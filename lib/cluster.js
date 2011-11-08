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
var os = require("os");
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
cluster.worker = cluster.isWorker ? new EventEmitter() : null;
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

  //Create chain
  return this;
};

// Call this from the master process. It will start child workers.
cluster.setupMaster = function (options) {
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
      debug("kill worker " + worker.pid);
      worker.kill();
    });

    console.error("Exception in cluster master process: " +
        e.message + '\n' + e.stack);
    console.error("Please report this bug.");
    process.exit(1);
  });
  
  //Create chain
  return this;
};

//Handle messages that the master resive from workers
function handleWorkerMessage(message, worker) {
  // This can only be called from the master.
  assert(cluster.isMaster);
  
  var cmd = message.cmd;
  var internal = message._internal === true;
  
  debug("recv " + JSON.stringify(message));
  
  //When the worker is started
  if (internal && cmd === 'online') {
      cluster.workers[worker.workerID].state = "online";
      console.log("Worker " + worker.process.pid + " online");
      cluster.emit("connected", worker);
      
      //Emit a online event, now that we know the worker is running
      cluster.emit("online", worker);
      
      //echo callback id, if one was requested
      if (message._queryId) {
        worker.send({ _internal: true, _queryId: message._queryId });
      }
  }
  
  //When worker is requesting fd handler
  else if (internal && cmd === 'queryServer') { 
      
      //Genearate a key unique to this connection, but not the worker
      var key = message.address + ":" +
                message.port + ":" +
                message.addressType;
      
      //If this connection hasn't been made create a TCP server
      if (!(key in servers)) {
        debug('create new server ' + key);
        servers[key] = net._createServerHandle(message.address,
                                               message.port,
                                               message.addressType);
      }
      
      //echo callback id, with the fd handler associated with it
      var response = { _internal: true, _queryId: message._queryId };
      worker.send(response, servers[key]);
  }
  
  //When worker is accuturly listining for connections
  else if (internal && cmd === "listening") {
    cluster.workers[worker.workerID].state = "listening";
    
    //Emit a listining now that we know the worker is listning
    cluster.emit("listening", worker, {
      address : message.address,
      port : message.port,
      addressType : message.addressType
    });
    
    //echo callback id, if one was requested
    if (message._queryId) {
      worker.send({ _internal: true, _queryId: message._queryId });
    }
  }
  
  //echo callback id, if one was requested
  else {
    if (message._queryId) {
      worker.send({ _internal: true, _queryId: message._queryId });
    }
  }
}

// This is the Worker class
var Worker = function (workerFilename, workerArgs, workerID) {
  if (!(this instanceof Worker)) return new Worker();
  
  // This can only be called from the master.
  assert(cluster.isMaster);
  
  var self = this;
  
  //Assign id and state
  Object.defineProperty(self, "workerID", {value : workerID});
  self.state = "none";
  
  // Build worker environment
  var envCopy = {};
  for (var x in process.env) {
    envCopy[x] = process.env[x];
  }
  envCopy['NODE_WORKER_ID'] = workerID;
  
  // Spawn worker
  var worker = self.process = fork(workerFilename, workerArgs, { env: envCopy });
  
  // handle messages form the worker process
  worker.on('message', function(message) {
    if (message._internal && message._internal === true) {
      handleWorkerMessage(message, self);
    } else {
      self.emit('message', message, self);
    }
  });
  
  // emit death when the worker dies, and remove it form workers array
  worker.on('exit', function() {
    debug('worker id=' + workerID + ' died');
    
    //Make suicide a boolean
    self.suicide = !!self.suicide;
    
    //Remove from workers
    delete cluster.workers[workerID];
    
    //Emit exit and death
    self.emit('exit', self);
    cluster.emit('death', self);
  });
  
};
util.inherits(Worker, EventEmitter);

// Kill the worker without restart
Worker.prototype.kill = function () {
  this.suicide = true;
  this.process.kill();
};

//Send message to worker - primarily for backward compatible
Worker.prototype.send = function () {
  this.process.send.apply(this.process, arguments);
};

// Fork a new worker
cluster.fork = function (env) {
  
  // Make sure that the master has been initalized 
  cluster.setupMaster();
  
  var workerID = ++ids;
  
  // Save worker
  var worker = cluster.workers[workerID] = new Worker(workerFilename, workerArgs, workerID, env || {});

  //Emit a fork event
  cluster.emit("fork", worker);
  
  return worker;
};

// Spawn all necessary workers
cluster.autoFork = function () {
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
  while(i--) {
    cluster.fork();
  }
  
  //Restart workers when they die
  cluster.on("death", function (worker) {
    console.log('worker ' + worker.process.pid + ' died. restart...');
    if (worker.suicide !== true) {
      cluster.fork();
    }
  });
  
  //Create chain
  return this;
};

// Internal function. Called from src/node.js when worker process starts.
cluster._setupWorker = function() {
  // This can only be called from a worker.
  assert(cluster.isWorker);
  
  //Set a protected workerID
  Object.defineProperty(cluster.worker, "workerID", {
    value : parseInt(process.env.NODE_WORKER_ID, 10)
  });
  
  //Tell master that the worker is online
  cluster.worker.respond({
    cmd: 'online',
    _internal : true
  });

  // Make callbacks from cluster.worker.send()
  process.on('message', function(msg, handle) {
    debug("recv " + JSON.stringify(msg));
    
    if (msg._internal && msg._internal === true) {
      if (msg._queryId && msg._queryId in queryCallbacks) {
        var cb = queryCallbacks[msg._queryId];
        if (typeof cb == 'function') {
          cb(msg, handle);
        }
        delete queryCallbacks[msg._queryId];
      }
    } else {
      cluster.worker.emit("message", msg);
    }
  });
};

// Send message to the master, and run callback when the master echo
if (cluster.isWorker) {
  cluster.worker.respond = function (msg, cb) {
    // This can only be called from a worker.
    assert(cluster.isWorker);
  
    debug('send ' + JSON.stringify(msg));
  
    // Store callback for later. Callback called in _startWorker.
    if (cb) {
      // Grab some random queryId
      msg._queryId = (++queryIds);
      queryCallbacks[msg._queryId] = cb;
    }
  
    // Send message to master
    process.send(msg);
  };
}

// Internal function. Called by lib/net.js when attempting to bind a server.
cluster._getServer = function(tcpSelf, address, port, addressType, cb) {
  // This can only be called from a worker.
  assert(cluster.isWorker);
  
  //Send a listening message to the master
  tcpSelf.once('listening', function () {
    cluster.worker.respond({
      cmd: "listening",
      _internal : true,
      address: address,
      port: port,
      addressType: addressType
    });
  });
  
  //Request the fd handler from the master process
  var message = {
    cmd: "queryServer",
    _internal : true,
    address: address,
    port: port,
    addressType: addressType
  };
  //The callback will be stored until the master has responed
  cluster.worker.respond(message, function(msg, handle) {
    cb(handle);
  });
  
};
