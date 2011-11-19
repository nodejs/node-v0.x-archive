// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var assert = require('assert');
var os = require('os');
var fork = require('child_process').fork;
var net = require('net');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var cluster = module.exports = new EventEmitter();
// Events threre exists:
// death, fork, spawn, online, listening;

var debug;
if (process.env.NODE_DEBUG && /cluster/.test(process.env.NODE_DEBUG)) {
  debug = function(x) {
    var prefix = process.pid + ',' +
        (process.env.NODE_WORKER_ID ? 'Worker' : 'Master');
    console.error(prefix, x);
  };
} else {
  debug = function() { };
}

// Used in the master:
var masterStarted = false;
var ids = 0;
var serverHandlers = {};
var workerFilename = '';
var workerArgs = [];
var workerTotal = 0;
var autoForkStarted = false;
var forkMode = 'standby'; //standby, manual, auto
var reforkLog = [];

// Used in the worker:
var serverLisenters = {};
var queryIds = 0;
var queryCallbacks = {};

//Define isWorker and isMaster as protected booleans
Object.defineProperty(cluster, 'isWorker', {
  value: Object.prototype.hasOwnProperty.call(process.env, 'NODE_UNIQUE_ID'),
  enumerable: true
});
Object.defineProperty(cluster, 'isMaster', {
  value: !cluster.isWorker,
  enumerable: true
});

//The worker object is only used in a worker
cluster.worker = cluster.isWorker ? {} : null;
//The workers array is oly used in the naster
cluster.workers = cluster.isMaster ? [] : null;

//Simple function there call a function on each worker
cluster.eachWorker = function(cb) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  // Go througe all workers
  for (var id in cluster.workers) {
    if (cluster.workers[id]) {
      cb(cluster.workers[id]);
    }
  }
};

//return a int there tell how many workers there are online
Object.defineProperty(cluster, 'onlineWorkers', {
  get: function() {
    var online = 0;
    cluster.eachWorker(function(worker) {
      if (worker.state === 'online' || worker.state === 'listening') {
        online += 1;
      }
    });
    return online;
  },
  enumerable: true
});

// Call this from the master process. It will start child workers.
cluster.setupMaster = function(options) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  // Don't allow this function to run more that once
  if (masterStarted) return;
  masterStarted = true;

  // Get filename and arguments
  options = options || {};
  workerFilename = options.exec || process.argv[1];
  workerArgs = options.args || process.argv.slice(2);
  workerTotal = options.workers || os.cpus().length;

  // signal handlers
  process.on('SIGINT', function() {
    cluster.destroy(function() {
      process.exit(0);
    });
  });
  process.on('SIGTERM', function() {
    cluster.destroy(function() {
      process.exit(0);
    });
  });
  process.on('SIGQUIT', function() {
    cluster.disconnect(function() {
      process.exit(0);
    });
  });

  // Quit workers when master exits
  process.on('exit', cluster.destroy.bind(cluster));

  process.on('uncaughtException', function(err) {
    console.error(err.stack);
    cluster.destroy(function() {
      process.exit(1);
    });
  });
};

// Small progress racker
function ProgressTracker(callback) {
  this.callback = callback;
  this.states = {};
  this.called = false;
}
ProgressTracker.prototype.add = function(subject) {
  if (typeof subject === 'object') {
    var name;
    for (name in subject) {
      if (subject.hasOwnProperty(name)) this.states[name] = false;
    }
  } else {
    this.states[subject] = false;
  }
};
ProgressTracker.prototype.set = function(name) {
  this.states[name] = true;
  this.check();
};
ProgressTracker.prototype.check = function(name) {
  var state;
  for (state in this.states) {
    if (this.states.hasOwnProperty(state) && this.states[state] === false) {
      return;
    }
  }
  if (typeof this.callback === 'function' && !this.called) {
    this.callback();
  }
  this.called = true;
};


// Check if a message is internal only
function isInternalMessage(message) {
  return (message !== null &&
          typeof message === 'object' &&
          message._internal === true);
}

// Check if a message require echo
function requireEcho(message) {
  return (message !== null &&
          typeof message === 'object' &&
          message.hasOwnProperty('_requestEcho'));
}

// Checi if a echo is recived
function receiveEcho(message) {
  return (message !== null &&
          typeof message === 'object' &&
          message.hasOwnProperty('_queryEcho'));
}

// Create a internal message object
function internalMessage(sending, receiving) {
  sending = sending || {};
  receiving = receiving || {};

  sending._internal = true;
  if (requireEcho(receiving)) {
    sending._queryEcho = receiving._requestEcho;
  }
  return sending;
}

// Handle messages from both master and workers
var messageHandingObject = {};
function handleMessage(message, handle, worker) {

  //Run handler if it exist
  if (message.cmd && typeof messageHandingObject[message.cmd] === 'function') {
    messageHandingObject[message.cmd](message, worker);
  }

  //Else check for callback request
  else {
    if (requireEcho(message)) {
      worker.send(internalMessage({}, message));
    }
    if (receiveEcho(message)) {
      queryCallbacks[message._queryEcho](message, handle);
      delete queryCallbacks[message._queryEcho];
    }
  }
}

//Messages to the master will be handled using this methods
if (cluster.isMaster) {

  //Handle online messages from workers
  messageHandingObject.online = function(message, worker) {
    worker.state = 'online';
    debug('Worker ' + worker.process.pid + ' online');
    cluster.emit('online', worker);

    //Send echo if requested
    if (requireEcho(message)) {
      worker.send(internalMessage({}, message));
    }
  };

  //Handle queryServer messages form workers
  messageHandingObject.queryServer = function(message, worker) {

    //This sequence of infomation is unique to the connection but not the worker
    var args = [message.address, message.port, message.addressType];
    var key = args.join(':');
    var handler;

    if (serverHandlers.hasOwnProperty(key)) {
      handler = serverHandlers[key];
    } else {
      handler = serverHandlers[key] = net._createServerHandle.apply(net, args);
    }

    //echo callback id, with the fd handler associated with it
    worker.send(internalMessage({}, message), handler);
  };

  //Handle listening messages from workers
  messageHandingObject.listening = function(message, worker) {
    worker.state = 'listening';

    //Emit a listining now that we know the worker is listning
    cluster.emit('listening', worker, {
      address: message.address,
      port: message.port,
      addressType: message.addressType
    });

    //Send echo if requested
    if (requireEcho(message)) {
      worker.send(internalMessage({}, message));
    }
  };

  //Handle suicide messages from workers
  messageHandingObject.suicide = function(message, worker) {
    worker.suicide = true;

    //Send echo if requested
    if (requireEcho(message)) {
      worker.send(internalMessage({}, message));
    }
  };

  //Handle disconnect messages from workers
  messageHandingObject.disconnect = function(message, worker) {

    if (message.state === 'setState') {
      worker.state = 'disconnect';
      worker.suicide = true;

      //Send echo if requested
      if (requireEcho(message)) {
        worker.send(internalMessage({}, message));
      }
    }

    else if (message.state === 'done') {
      //Send echo if requested before closing channel
      if (requireEcho(message)) {
        worker.send(internalMessage({}, message));
      }

      worker.process._channel.close();
      worker.emit('disconnect', worker);
      cluster.emit('disconnect', worker);
    }

  };

}

//Messages to a worker will be handled using this methods
else if (cluster.isWorker) {

  //Handle disconnect messages from master
  messageHandingObject.disconnect = function(message, worker) {
    //Run disconnect
    worker.disconnect();

    //Send echo if requested
    if (requireEcho(message)) {
      worker.send(internalMessage({}, message));
    }
  };

}

function toDecInt(value) {
  value = parseInt(value, 10);
  return isNaN(value) ? null : value;
}

// Create a worker object, there works both for master and worker
function Worker(env, workerID) {
  if (!(this instanceof Worker)) return new Worker();

  var self = this;

  //Assign uniqueID, default null
  Object.defineProperty(this, 'uniqueID', {
    value: cluster.isMaster ? ++ids : toDecInt(process.env.NODE_UNIQUE_ID),
    enumerable: true
  });

  //Assign workerID, default null
  workerID = workerID === undefined ? null : workerID;
  Object.defineProperty(this, 'workerID', {
    value: cluster.isMaster ? workerID : toDecInt(process.env.NODE_WORKER_ID),
    enumerable: true
  });

  //Assign state
  this.state = 'none';

  //assign startup property, ms since unix epoch
  Object.defineProperty(this, 'startup', {
    value: Date.now(),
    enumerable: true
  });

  //Create or get process
  if (cluster.isMaster) {

    var envCopy = env || {};
    for (var x in process.env) {
      envCopy[x] = process.env[x];
    }
    envCopy['NODE_UNIQUE_ID'] = this.uniqueID;
    envCopy['NODE_WORKER_ID'] = this.workerID;

    self.process = fork(workerFilename, workerArgs, { env: envCopy });
  } else {
    self.process = process;
  }

  //Handle message
  this.process.on('message', function(message, handle) {
    debug('recived: ', message);

    //If this is an internal message handle it and ignore the rest
    if (isInternalMessage(message)) {
      handleMessage(message, handle, self);
      return undefined;
    }

    //Check if a echo is required
    if (requireEcho(message)) {
      self.send({ _queryEcho: message._requestEcho });
    }

    //Check if a echo is recived
    if (queryEcho(message)) {
      queryCallbacks[msg._queryEcho](msg, handle);
      delete queryCallbacks[msg._queryEcho];
    }

    //Emit message
    self.emit('message', message, self);
  });

  //Handle exit
  self.process.on('exit', function() {
    debug('worker id=' + self.uniqueID + ' died');

    //set state to dead so the user can check for old worker objects
    self.state = 'dead';

    //Make suicide a boolean
    self.suicide = !!self.suicide;

    //Remove from workers in the master
    if (cluster.isMaster) {
      delete cluster.workers[self.uniqueID];
    }

    //Emit exit and death
    self.emit('exit', self);
    cluster.emit('death', self);
  });

  //Handle disconnect
  self.on('disconnect', function() {
    debug('worker id=' + self.uniqueID + ' disconnect');

    //set state to disconnect
    self.disconnect = 'disconnect';

    //Make suicide a boolean
    self.suicide = !!self.suicide;

    //Remove from workers in the master
    if (cluster.isMaster) {
      delete cluster.workers[self.uniqueID];
    }

    //Emit exit and death
    self.emit('exit', self);
    cluster.emit('death', self);
  });

}
util.inherits(Worker, EventEmitter);

//Send message to worker or master
Worker.prototype.send = function(/*message, handler, callback*/) {

  debug('send ' + JSON.stringify(message));

  //Exist callback
  var callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = undefined;
  }

  //Get message and handler as array
  var slice = Array.prototype.slice;
  var sliceTo = callback ? arguments.length - 1 : arguments.length;
  var message = slice.call(arguments, 0, sliceTo);

  // Store callback for later.
  if (callback) {
    message[0] = message[0] || {};
    // Grab some random requestEcho string
    message[0]._requestEcho = this.uniqueID + ':' + (++queryIds);
    queryCallbacks[message[0]._requestEcho] = callback;
  }

  // Send message
  if (this.process._channel !== null) {
    this.process.send.apply(this.process, message);
  }
};

// Kill the worker without restarting
Worker.prototype.kill = function() {
  var self = this;

  this.suicide = true;

  if (cluster.isMaster) {
    this.process.kill();
  } else {
    //Inform mater that is is suicide and then kill
    if (this.process._channel !== null) {
      this.send(internalMessage({cmd: 'suicide'}), function() {
        self.process.exit(0);
      });
    } else {
      self.process.exit(0);
    }
  }
};

// Kill the worker without restarting
Worker.prototype.disconnect = function() {
  var self = this;

  if (cluster.isMaster) {
    //Inform worker that is should disconnect from the master
    this.send(internalMessage({cmd: 'disconnect'}));
  } else {

    var setStateMsg = internalMessage({ cmd: 'disconnect', state: 'setState' });
    var doneMsg = internalMessage({ cmd: 'disconnect', state: 'done' });

    //Inform master that about state and suicide and make it emit disconnect
    this.send(setStateMsg, function() {

      //TCP close tracker
      var progress = new ProgressTracker(function() {

        //Tell master when all TCP connection is closed
        //and ask it to close the IPC channel
        self.send(doneMsg, function() {
          //When master is informed
          //Emit a disconnect when all TCP connections are closed
          self.emit('disconnect', self);
        });
      });
      progress.add(serverLisenters);

      //Close TCP connections
      var key;
      for (key in serverLisenters) {
        if (serverLisenters.hasOwnProperty(key)) {

          //Close TCP connection and set closeState when done
          (function(key) {
            serverLisenters[key].once('close', function() {
              progress.set(key);
            });
          })(key);

          serverLisenters[key].close();
        }
      }

      //In case there aren't any TCP handlers
      progress.check();
    });
  }
};

//Internal function to fork a worker
var forkWorker = function(env, workerID) {
  // Create and store worker
  var worker = new Worker(env, workerID);
  cluster.workers[worker.uniqueID] = worker;

  //Emit a fork event
  cluster.emit('fork', worker);

  return worker;
};

// Fork a new worker
cluster.fork = function(env) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  // Make sure that the master has been initalized
  cluster.setupMaster();

  // This can only be called if forkMode is manual
  if (forkMode === 'standby') forkMode = 'manual';
  assert.equal('manual', forkMode);

  return forkWorker(env);
};

//Log the alive time and check for error loop
function respawnCheck(startup) {

  //remove the first item, if there are five items
  if (reforkLog.length === 5) {
    reforkLog.splice(0, 1);
  }

  //Add startup at the end
  reforkLog.push(Date.now() - startup);

  //Check error loop, if there are five items
  if (reforkLog.length === 5) {
    //If an item is greater that 1 sec, it isn't an error loop
    var limit = 1000;

    var i = 5;
    while (i--) {
      if (reforkLog[i] > limit) {
        return false;
      }
    }
  } else {
    return false;
  }

  //Citical
  return true;
}

// Spawn all necessary workers
cluster.autoFork = function() {
  // This can only be called from the master.
  assert(cluster.isMaster);

  //Make sure that the master is inialized
  cluster.setupMaster();

  // This can only be called if forkMode is auto
  if (forkMode === 'standby') forkMode = 'auto';
  assert.equal('auto', forkMode);

  // This should only be runned once, but we won't throw errors
  if (autoForkStarted === true) {
    return undefined;
  }

  autoForkStarted = true;

  //Spawn necessary workers
  var workerID = workerTotal;
  while (workerID--) {
    forkWorker(undefined, workerID);
  }

  //Restart workers when they die
  cluster.on('death', function(worker) {
    if (worker.suicide === false) {
      debug('worker ' + worker.process.pid + ' died. restart...');

      //respawn worker
      if (!respawnCheck(worker.startup)) {
        forkWorker(undefined, worker.workerID);
      }
      //if there are a citical error make a gracefull shoutdown and emit event
      else {
        cluster.disconnect(function() {
          cluster.emit('citicalError');
        });
      }
    }
  });
};

// Destroy all workers
cluster.destroy = function(callback) {

  var childrens = new ProgressTracker(callback);
  childrens.add(cluster.workers);

  cluster.eachWorker(function(worker) {
    //Listen for exit events if callback is used
    worker.once('exit', function(worker) {
      childrens.set(worker.uniqueID);
    });

    //Kill worker
    worker.kill();
  });

  //In case there wasn't any workers
  childrens.check();
};

// Disconnect all workers
cluster.disconnect = function(callback) {

  //Keep progress of disconnections
  var progress = new ProgressTracker(function() {

    //When allworkers are disconnected, stop handlers
    var handler;
    for (handler in serverHandlers) {
      if (serverHandlers.hasOwnProperty(handler)) {
        serverHandlers[handler].close();
        delete serverHandlers[handler];
      }
    }

    //Now we are done
    if (callback) callback();
  });
  progress.add(cluster.workers);

  //Kill worekrs
  cluster.eachWorker(function(worker) {
    worker.once('disconnect', function(worker) {
      progress.set(worker.uniqueID);
    });
    worker.disconnect();
  });

  //In case there wasn't any workers
  progress.check();

};

// Internal function. Called from src/node.js when worker process starts.
cluster._setupWorker = function() {
  // This can only be called from a worker.
  assert(cluster.isWorker);

  // Get worker class
  var worker = cluster.worker = new Worker();

  // signal handlers
  process.on('SIGINT', worker.kill.bind(worker));
  process.on('SIGTERM', worker.kill.bind(worker));
  process.on('SIGQUIT', worker.disconnect.bind(worker));

  //Tell master that the worker is online
  worker.state = 'online';
  worker.send(internalMessage({ cmd: 'online' }));

};

// Internal function. Called by lib/net.js when attempting to bind a server.
cluster._getServer = function(tcpSelf, address, port, addressType, cb) {
  // This can only be called from a worker.
  assert(cluster.isWorker);

  //Store tcp instance for later use
  var key = [address, port, addressType].join(':');
  serverLisenters[key] = tcpSelf;

  //Send a listening message to the master
  tcpSelf.once('listening', function() {
    cluster.worker.state = 'listening';
    cluster.worker.send(internalMessage({
      cmd: 'listening',
      address: address,
      port: port,
      addressType: addressType
    }));
  });

  //Request the fd handler from the master process
  var message = internalMessage({
    cmd: 'queryServer',
    address: address,
    port: port,
    addressType: addressType
  });
  //The callback will be stored until the master has responed
  cluster.worker.send(message, function(msg, handle) {
    cb(handle);
  });
};
