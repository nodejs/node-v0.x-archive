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

//TODO: emit a finalized event when all workers are listening on all ports

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
var servers = {};
var workerFilename;
var workerArgs;
var workerTotal;

// Used in the worker:
var queryIds = 0;
var queryCallbacks = {};

cluster.isWorker = 'NODE_WORKER_ID' in process.env;
cluster.isMaster = ! cluster.isWorker;

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
    if (workers[id]) {
      cb(workers[id]);
    }
  }
};

// Call this from the master process. It will start child workers.
cluster.setupMaster = function(options) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  //Don't allow this function to run more that once
  if (masterStarted) return;
  masterStarted = true;

  //Get filename and arguments
  options = options || {};
  workerFilename = options.exec || process.argv[1];
  workerArgs = options.args || process.argv.slice(2);
  workerTotal = options.workers || os.cpus().length;

  //This is really bad
  process.on('uncaughtException', function(e) {
    // Quickly try to kill all the workers.
    // TODO: be session leader - will cause auto SIGHUP to the children.
    cluster.eachWorker(function(worker) {
      debug('kill worker ' + worker.pid);
      worker.kill();
    });

    console.error('Exception in cluster master process: ' +
        e.message + '\n' + e.stack);
    console.error('Please report this bug.');
    process.exit(1);
  });

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
if (cluster.isMaster) {

  //Handle online messages from workers
  messageHandingObject.online = function(message, worker) {
    worker.state = 'online';
    console.log('Worker ' + worker.process.pid + ' online');
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

    if (servers.hasOwnProperty(key)) {
      handler = servers[key];
    } else {
      handler = servers[key] = net._createServerHandle.apply(net, args);
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
}

// Create a worker call there works both for master and worker
function Worker(env) {
  if (!(this instanceof Worker)) return new Worker();

  var self = this;

  //Assign an id and state
  Object.defineProperty(this, 'workerID', {
    value: (cluster.isMaster ? ++ids : parseInt(process.env.NODE_WORKER_ID, 10))
  });
  this.state = 'none';

  //Create or get process
  if (cluster.isMaster) {

    var envCopy = env || {};
    for (var x in process.env) {
      envCopy[x] = process.env[x];
    }
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
    debug('worker id=' + self.workerID + ' died');

    //Make suicide a boolean
    self.suicide = !!self.suicide;

    //Remove from workers in the master
    if (cluster.isMaster) {
      delete cluster.workers[self.workerID];
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
  var slice = Array.prototype.slice.call;
  var sliceTo = callback ? arguments.length - 1 : arguments.length;
  var message = slice(arguments, 0, sliceTo);

  // Store callback for later.
  if (callback) {
    message[0] = message[0] || {};
    // Grab some random requestEcho string
    message[0]._requestEcho = this.workerID + ':' + (++queryIds);
    queryCallbacks[message[0]._requestEcho] = callback;
  }

  // Send message
  this.process.send.apply(this.process, message);
};

// Kill the worker without restarting
Worker.prototype.kill = function() {
  this.suicide = true;

  if (cluster.isMaster) {
    this.process.kill();
  } else {
    //Inform mater that is is suicide and then kill
    this.send(internalMessage({cmd: 'suicide'}), function() {
      this.process.kill();
    });
  }
};

// Fork a new worker
cluster.fork = function(env) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  // Make sure that the master has been initalized
  cluster.setupMaster();

  // Create and store worker
  var worker = new Worker(env);
  cluster.workers[worker.workerID] = worker;

  //Emit a fork event
  cluster.emit('fork', worker);

  return worker;
};

// Spawn all necessary workers
cluster.autoFork = function() {
  // This can only be called from the master.
  assert(cluster.isMaster);

  //Make sure that the master is inialized
  cluster.setupMaster();

  //Make sure that there hasn't been spawned any workers
  if (cluster.workers.length !== 0) {
    return;
  }

  //Spawn workers
  var i = workerTotal;
  while (i--) {
    cluster.fork();
  }

  //Restart workers when they die
  cluster.on('death', function(worker) {
    if (worker.suicide === false) {
      console.log('worker ' + worker.process.pid + ' died. restart...');
      cluster.fork();
    }
  });
};

// Internal function. Called from src/node.js when worker process starts.
cluster._setupWorker = function() {
  // This can only be called from a worker.
  assert(cluster.isWorker);

  // Get worker class
  cluster.worker = new Worker();

  //Tell master that the worker is online
  cluster.worker.state = 'online';
  cluster.worker.send(internalMessage({ cmd: 'online' }));

};

// Internal function. Called by lib/net.js when attempting to bind a server.
cluster._getServer = function(tcpSelf, address, port, addressType, cb) {
  // This can only be called from a worker.
  assert(cluster.isWorker);

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
