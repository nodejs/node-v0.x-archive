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
  while(i--) {
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
var servers = {};
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
    // Quickly try to kill all the workers.
    // TODO: be session leader - will cause auto SIGHUP to the children.
    cluster.eachWorker(function(worker) {
      debug('kill worker ' + worker.pid);
      worker.kill();
    });

    console.error('Exception in cluster master process: ' +
        e.message + '\n' + e.stack);
    process.exit(1);
  });
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

// Fork a new worker
cluster.fork = function(env) {
  // This can only be called from the master.
  assert(cluster.isMaster);

  // Make sure that the master has been initalized
  startMaster();

  return (new cluster.Worker(env));
};

// Internal function. Called from src/node.js when worker process starts.
cluster._setupWorker = function() {
  // Get worker class
  var worker = cluster.worker = new Worker();

  // signal handlers
  process.on('SIGINT', worker.destroy.bind(worker));
  process.on('SIGTERM', worker.destroy.bind(worker));
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
