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
var fork = require('child_process').fork;
var net = require('net');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function isObject(o) {
  return (typeof o === 'object' && o !== null);
}

function extendObject(origin, add) {
  var keys = Object.keys(add),
      i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

var cluster = module.exports = new EventEmitter();

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
var workerFilename;
var workerArgs;

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
cluster.workers = cluster.isMaster ? {} : null;

//Simple function there call a function on each worker
cluster.eachWorker = function(cb) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  // Go througe all workers
  for (var id in cluster.workers) {
    if (cluster.workers.hasOwnProperty(id)) {
      cb(cluster.workers[id]);
    }
  }
};

// Call this from the master process. It will start child workers.
//
// options.workerFilename
// Specifies the script to execute for the child processes. Default is
// process.argv[1]
//
// options.args
// Specifies program arguments for the workers. The Default is
// process.argv.slice(2)
//
// options.workers
// The number of workers to start. Defaults to os.cpus().length.
function startMaster() {
  // This can only be called from the master.
  assert(cluster.isMaster);

  if (masterStarted) return;
  masterStarted = true;

  workerFilename = process.argv[1];
  workerArgs = process.argv.slice(2);

  process.on('uncaughtException', function(e) {
    console.error('Exception in cluster master process: ' +
        e.message + '\n' + e.stack);

    quickDestroyCluster();
    process.exit(1);
  });
}

// Check if a message is internal only
function isInternalMessage(wrap) {
  return isObject(wrap) && wrap._internal === true;
}

// Create a internal message object
function internalMessage(message) {
  return {
    _wrapper: true,
    _internal: true,
    content: message
  };
}

// Check if a message is a wrapper
function isMessageWrapper(wrap) {
  return (isObject(wrap) && wrap.hasOwnProperty('_wrapper'));
}

//Handle callback messges
function handleCallback(outMessage, outHandle, inWrap, inHandle, worker) {

  //Create out wrap object
  var outWrap = {
    content: outMessage,
    _wrapper: true,
    _internal: inWrap._internal, //will be undefined if not set
    _queryEcho: inWrap._requestEcho //will be undefined if not set
  };

  //Call callback if a query echo is received
  if (inWrap.hasOwnProperty('_queryEcho')) {
    queryCallbacks[inWrap._queryEcho](inWrap.content, inHandle);
    delete queryCallbacks[inWrap._queryEcho];
  }

  //Send if outWrap do contain something useful
  if (!(outWrap.content === undefined && outWrap._queryEcho === undefined)) {
    worker.send(outWrap, outHandle);
  }
}

// Handle messages from both master and workers
var messageHandingObject = {};
function handleMessage(inWrap, inHandle, worker) {

  var message = inWrap.content;

  var respondUsed = false;
  var respond = function(outMessage, outHandler) {
    respondUsed = true;
    handleCallback(outMessage, outHandler, inWrap, inHandle, worker);
  };

  //Run handler if it exist
  if (isObject(message) && messageHandingObject[message.cmd]) {
    messageHandingObject[message.cmd](message, worker, respond);
  }

  //Send respond if it wasn't done
  if (respondUsed === false) {
    respond();
  }
}

//Messages to the master will be handled using this methods
if (cluster.isMaster) {

  //Handle online messages from workers
  messageHandingObject.online = function(message, worker) {
    worker.state = 'online';
    debug('Worker ' + worker.process.pid + ' online');
    worker.emit('online', worker);
    cluster.emit('online', worker);
  };

  //Handle queryServer messages form workers
  messageHandingObject.queryServer = function(message, worker, send) {

    //This sequence of infomation is unique to the connection but not the worker
    var args = [message.address, message.port, message.addressType];
    var key = args.join(':');
    var handler;

    if (serverHandlers.hasOwnProperty(key)) {
      handler = serverHandlers[key];
    } else {
      handler = serverHandlers[key] = net._createServerHandle.apply(net, args);
    }

    //echo callback with the fd handler associated with it
    send({}, handler);
  };

  //Handle listening messages from workers
  messageHandingObject.listening = function(message, worker) {

    worker.state = 'listening';

    //Emit listining, now that we know the worker is listning
    worker.emit('listening', worker, {
      address: message.address,
      port: message.port,
      addressType: message.addressType
    });
    cluster.emit('listening', worker, {
      address: message.address,
      port: message.port,
      addressType: message.addressType
    });
  };

  //Handle suicide messages from workers
  messageHandingObject.suicide = function(message, worker) {
    worker.suicide = true;
  };

}

//Messages to a worker will be handled using this methods
else if (cluster.isWorker) {

  //TODO: the disconnect step will use this
}

function toDecInt(value) {
  value = parseInt(value, 10);
  return isNaN(value) ? null : value;
}

// Create a worker object, there works both for master and worker
function Worker(env) {
  if (!(this instanceof Worker)) return new Worker();

  var self = this;

  //Assign uniqueID, default null
  Object.defineProperty(this, 'uniqueID', {
    value: cluster.isMaster ? ++ids : toDecInt(process.env.NODE_UNIQUE_ID),
    enumerable: true
  });

  //Assign state
  this.state = 'none';

  //Create or get process
  if (cluster.isMaster) {

    //Create env object
    //first: copy and add uniqueID
    var envCopy = extendObject({}, process.env);
    envCopy['NODE_UNIQUE_ID'] = this.uniqueID;
    //second: extend envCopy with the env argument
    if (isObject(env)) {
      envCopy = extendObject(envCopy, env);
    }

    //fork worker
    this.process = fork(workerFilename, workerArgs, {
      'env': envCopy
    });

  } else {
    this.process = process;
  }

  if (cluster.isMaster) {
    //Save worker in the cluster.workers array
    cluster.workers[this.uniqueID] = this;

    //Emit a fork event, on next tick
    //There is no worker.fork event since this has no real purpose
    process.nextTick(function() {
      cluster.emit('fork', self);
    });
  }

  //Handle message
  this.process.on('message', function(wrap, handle) {
    debug('recived: ', wrap);

    //If this is an internal message handle it and ignore the rest
    if (isInternalMessage(wrap)) {
      handleMessage(wrap, handle, self);
      return undefined;
    }

    //Handle callback
    handleCallback(undefined, undefined, wrap, handle, self);

    if (wrap.content !== undefined) {
      //Emit message
      self.emit('message', wrap.content, self);
    }
  });

  //Handle exit
  self.process.on('exit', function() {
    debug('worker id=' + self.uniqueID + ' died');

    //Prepear worker to die and emit events
    prepearDeath(self, 'dead', 'death');
  });

}
util.inherits(Worker, EventEmitter);
cluster.Worker = Worker;

function prepearDeath(worker, state, eventName) {

  //set state to disconnect
  worker.state = state;

  //Make suicide a boolean
  worker.suicide = !!worker.suicide;

  //Remove from workers in the master
  if (cluster.isMaster) {
    delete cluster.workers[worker.uniqueID];
  }

  //Emit events
  worker.emit(eventName, worker);
  cluster.emit(eventName, worker);
}

//Send message to worker or master
Worker.prototype.send = function(/*message, handler, callback*/) {

  //Exist callback
  var callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = undefined;
  }

  //Get message and handler and contain it in a args array
  var slice = Array.prototype.slice;
  var sliceTo = callback ? arguments.length - 1 : arguments.length;
  var args = slice.call(arguments, 0, sliceTo);

  var wrap = args[0];
  if (!isMessageWrapper(wrap)) {
    wrap = {
      content: wrap,
      _wrapper: true
    };
  }

  // Store callback for later
  if (callback) {
    wrap._requestEcho = this.uniqueID + ':' + (++queryIds);
    queryCallbacks[wrap._requestEcho] = callback;
  }

  //Save wrap
  args[0] = wrap;

  // Send message
  if (this.process._channel !== null) {
    this.process.send.apply(this.process, args);
  }
};


function closeWorkerChannel(worker, callback) {
  worker.process._channel.close();
  worker.process._channel = null;
  process.nextTick(callback);
}

//Sync function to quickly kill worker
function quickDestroyWorker(worker) {
  worker.suicide = true;
  worker.process.kill();
}

// Kill the worker without restarting
Worker.prototype.destroy = function() {
  var self = this;

  this.suicide = true;

  if (cluster.isMaster) {
    //Stop channel
    //this way the worker won't need to propagate suicide state to master
    closeWorkerChannel(this, function() {
      //Then kill worker
      self.process.kill();
    });

  } else {
    //Channel is open
    if (this.process._channel !== null) {

      //Inform master that is is suicide and then kill
      this.send(internalMessage({cmd: 'suicide'}), function() {
        //Stop continuously channel check
        if (keepChecking) clearInterval(keepChecking);

        //Kill worker
        self.process.exit(0);
      });

      //When master do a quickDestroy the channel is not necesarily closed
      //at the point this function runs. For that reason we need to keep
      //checking that the channel is still open, until a actually callback
      //from the master is resicved. Also we can't do a timeout and then
      //just kill, since we don't know if the quickDestroy function was called.
      var keepChecking = setInterval(function() {
        if (self.process._channel === null) {
          self.process.exit(0);
        }
      }, 200);

    } else {
      self.process.exit(0);
    }
  }
};

// Fork a new worker
cluster.fork = function(env) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  // Make sure that the master has been initalized
  startMaster();

  return (new cluster.Worker(env));
};

//Sync way to quickly kill all cluster workers
function quickDestroyCluster() {
  cluster.eachWorker(quickDestroyWorker);
}

// Internal function. Called from src/node.js when worker process starts.
cluster._setupWorker = function() {
  // Get worker class
  var worker = cluster.worker = new Worker();

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
