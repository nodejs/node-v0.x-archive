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

// utility

function isObject(o) {
  return (typeof o === 'object' && o !== null);
}

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

function toDecInt(value) {
  value = parseInt(value, 10);
  return isNaN(value) ? null : value;
}

// Check if a message is internal only
var INTERNAL_PREFIX = 'NODE_CLUSTER_';
function isInternalMessage(message) {
  return (isObject(message) &&
          typeof message.cmd === 'string' &&
          message.cmd.indexOf(INTERNAL_PREFIX) === 0);
}

// Modify message object to be internal
function internalMessage(inMessage) {
  var outMessage = util._extend({}, inMessage);

  // Add internal prefix to cmd
  outMessage.cmd = INTERNAL_PREFIX + (outMessage.cmd || '');

  return outMessage;
}

// Extremely simple progress tracker
function ProgressTracker(missing, callback) {
  this.missing = missing;
  this.callback = callback;
}
ProgressTracker.prototype.done = function() {
  this.missing -= 1;
  this.check();
};
ProgressTracker.prototype.check = function() {
  if (this.missing === 0) this.callback();
};

// common to both master and workers

// Handle callback messges
function handleResponse(outMessage, outHandle, inMessage, inHandle, worker) {

  // The message there will be send
  var message = internalMessage(outMessage);

  // callback id - will be undefined if not set
  message._queryEcho = inMessage._requestEcho;

  // Call callback if a query echo is received
  if (inMessage._queryEcho) {
    queryCallbacks[inMessage._queryEcho](inMessage.content, inHandle);
    delete queryCallbacks[inMessage._queryEcho];
  }

  // Send if outWrap do contain something useful
  if (!(outMessage === undefined && message._queryEcho === undefined)) {
    sendInternalMessage(worker, message, outHandle);
  }
}

// Handle messages from both master and workers
var messageHandler = {};
function handleMessage(worker, inMessage, inHandle) {

  //Remove internal prefix
  var message = util._extend({}, inMessage);
  message.cmd = inMessage.cmd.substr(INTERNAL_PREFIX.length);

  var respondUsed = false;
  function respond(outMessage, outHandler) {
    respondUsed = true;
    handleResponse(outMessage, outHandler, inMessage, inHandle, worker);
  }

  // Run handler if it exist
  if (messageHandler[message.cmd]) {
    messageHandler[message.cmd](message, worker, respond);
  }

  // Send respond if it wasn't done
  if (respondUsed === false) {
    respond();
  }
}

// Send internal message
function sendInternalMessage(worker, message/*, handler, callback*/) {

  // Exist callback
  var callback = arguments[arguments.length - 1];
  if (typeof callback !== 'function') {
    callback = undefined;
  }

  // exist handler
  var handler = arguments[2] !== callback ? arguments[2] : undefined;

  if (!isInternalMessage(message)) {
    message = internalMessage(message);
  }

  // Store callback for later
  if (callback) {
    message._requestEcho = worker.uniqueID + ':' + (++queryIds);
    queryCallbacks[message._requestEcho] = callback;
  }


  worker.send(message, handler);
}

var cluster;
var isWorker = 'NODE_UNIQUE_ID' in process.env;

if (isWorker) {

  var serverListeners = {};
  var queryIds = 0;
  var queryCallbacks = {};

  // limit what's exposed to the worker to what can be used in the worker
  cluster = module.exports = {
    isMaster: false,
    isWorker: true
  };

  // Internal function. Called from src/node.js when worker process starts.
  cluster._setupWorker = function() {
  
    // the worker representation inside a worker
    function Worker() {
      this.uniqueID = toDecInt(process.env.NODE_UNIQUE_ID);
  
      // handle internalMessage and exit event
      process.on('internalMessage', handleMessage.bind(null, this));
  
      // relay messages from the master
      process.on('message', this.emit.bind(this, 'message'));
    };
    util.inherits(Worker, EventEmitter);

    Worker.prototype.destroy = function() {
      this.suicide = true;

      // Channel is open
      if (process.connected) {
  
        // Inform master that is is suicide and then kill
        sendInternalMessage(this, {cmd: 'suicide'}, function() {
          process.exit(0);
        });
  
        var self = this;

        // When channel is closed, terminate the process
        process.once('disconnect', function() {
          process.exit(0);
        });

      } else {
        process.exit(0);
      }
    };


    Worker.prototype.disconnect = function() {
      this.suicide = true;

      // keep track of open servers
      var servers = Object.keys(serverListeners).length;
      var progress = new ProgressTracker(servers, function() {
        // there are no more servers open so we will close the IPC channel.
        // Closeing the IPC channel will emit emit a disconnect event
        // in both master and worker on the process object.
        // This event will be handled by prepearDeath.
        process.disconnect();
      });

      // depending on where this function was called from (master or worker)
      // the suicide state has allready been set.
      // But it dosn't really matter if we set it again.
      sendInternalMessage(this, {cmd: 'suicide'}, function() {
        // in case there are no servers
        progress.check();

        // closeing all servers graceful
        var server;
        for (var key in serverListeners) {
          server = serverListeners[key];

          // in case the server is closed we wont close it again
          if (server._handle === null) {
            progress.done();
            continue;
          }

          server.on('close', progress.done.bind(progress));
          server.close();
        }
      });

    };

    // Send message to master
    Worker.prototype.send = process.send.bind(process);
 
    // Get worker class
    var worker = cluster.worker = new Worker();
  
    // when the worker is disconnected from parent accidentally
    // we will terminate the worker
    process.once('disconnect', function() {
      if (worker.suicide !== true) {
        process.exit(0);
      }
    });

    // Tell master that the worker is online
    sendInternalMessage(worker, { cmd: 'online' });
  };
  
  // Internal function. Called by lib/net.js when attempting to bind a server.
  cluster._getServer = function(tcpSelf, address, port, addressType, cb) {
    // This can only be called from a worker.
    assert(cluster.isWorker);
  
    // Store tcp instance for later use
    var key = [address, port, addressType].join(':');
    serverListeners[key] = tcpSelf;
  
    // Send a listening message to the master
    tcpSelf.once('listening', function() {
      cluster.worker.state = 'listening';
      sendInternalMessage(cluster.worker, {
        cmd: 'listening',
        address: address,
        port: port,
        addressType: addressType
      });
    });
  
    // Request the fd handler from the master process
    var message = {
      cmd: 'queryServer',
      address: address,
      port: port,
      addressType: addressType
    };
  
    // The callback will be stored until the master has responed
    sendInternalMessage(cluster.worker, message, function(msg, handle) {
      cb(handle);
    });
  
  };

  // Handle worker.disconnect from master
  messageHandler.disconnect = function(message, worker) {
    worker.disconnect();
  };

} else { // isMaster

  // Create a worker object, there works both for master and worker
  function Worker(master, customEnv, id) {
    var env = process.env;
  
    this.master = master;
    this.uniqueID = id;
  
    // Assign state
    this.state = 'none';
  
    // Create env object
    // first: copy and add uniqueID
    var envCopy = util._extend({}, env);
    envCopy['NODE_UNIQUE_ID'] = this.uniqueID;
    // second: extend envCopy with the env argument
    if (isObject(customEnv)) {
      envCopy = util._extend(envCopy, customEnv);
    }

    var settings = master.settings;

    // fork worker
    this.process = fork(settings.exec, settings.args, {
      'env': envCopy,
      'silent': settings.silent,
      'execArgv': settings.execArgv
    });

    // handle internalMessage, exit and disconnect event
    this.process.on('internalMessage', handleMessage.bind(null, this));
    this.process.on('exit', this._prepareExit.bind(this, 'dead', 'exit'));
    this.process.on('disconnect', this._prepareExit.bind(this, 'disconnected', 'disconnect'));
 
    // relay message and error
    this.process.on('message', this.emit.bind(this, 'message'));
    this.process.on('error', this.emit.bind(this, 'error'));
  
  }
  util.inherits(Worker, EventEmitter);
  
  Worker.prototype._prepareExit = function (state, eventName) {

    // set state to disconnect
    this.state = state;
    
    // Make suicide a boolean
    this.suicide = !!this.suicide;

    // Remove from workers in the master
    delete this.master.workers[this.uniqueID];

    // Emit events
    this.emit(eventName, this);
    this.master.emit(eventName, this);
  };

  Worker.prototype.destroy = function() {
    var self = this;
    if (self.process.connected) {
      self.process.once('disconnect', function() {
        self.process.kill();
      });
      self.process.disconnect();
    } else {
       self.process.kill();
    }
  };

  // Send message to worker
  Worker.prototype.send = function() {
    this.process.send.apply(this.process, arguments);
  };


  // The .disconnect function will close all server and then disconnect
  // the IPC channel.
  Worker.prototype.disconnect = function() {
    this.suicide = true;

    sendInternalMessage(this, {cmd: 'disconnect'});
  };


  var allWorkers = {};

  // Kill workers when a uncaught exception is received
  process.on('uncaughtException', function(err) {
    // Did the user install a listener? If so, it overrides this one.
    if (process.listeners('uncaughtException').length > 1) return;

    // Output the error stack, and create on if non exist
    if (!(err instanceof Error)) {
      err = new Error(err);
    }
    console.error(err.stack);

    // quick destroy cluster
    // Sync way to quickly kill all cluster workers
    // However the workers may not die instantly
    for (var i in allWorkers) {
      if (allWorkers.hasOwnProperty(i)) {
        allWorkers[i].process.disconnect();
        allWorkers[i].process.kill();
      }
    }

    // when done exit process with error code: 1
    process.exit(1);
  });

  function Master() {
    this._started = false;
    this._serverHandles = {};
    // Settings object
    this.settings = {};
    this.workers = {};
  };

  util.inherits(Master, EventEmitter);

  Master.prototype.isMaster = true;
  Master.prototype.isWorker = false;

  Master.prototype.setupMaster = function(options) {
    // Don't allow this function to run more that once
    if (this._started) return;
    this._started = true;
  
    // Get filename and arguments
    options = options || {};
  
    // Set settings object
    this.settings = {
      exec: options.exec || process.argv[1],
      execArgv: options.execArgv || process.execArgv,
      args: options.args || process.argv.slice(2),
      silent: options.silent || false
    };
  
  
    // emit setup event
    cluster.emit('setup');
  };

  var ids = 0;

  // Fork a new worker
  Master.prototype.fork = function(env) {
  
    // Make sure that the master has been initalized
    this.setupMaster();

    var id = ids++,
        worker = this.workers[id] = allWorkers[id] = new Worker(this, env, id),
        master = this;

    // Emit a fork event, on next tick
    // There is no worker.fork event since this has no real purpose
    process.nextTick(function() {
      master.emit('fork', worker);
    });

    return worker;
  };

  // execute .disconnect on all workers and close handlers when done
  Master.prototype.disconnect = function(callback) {

    var self = this;

    // Close all TCP handlers when all workers are disconnected
    var workers = Object.keys(this.workers).length;
    var progress = new ProgressTracker(workers, function() {
      for (var key in self._serverHandles) {
        self._serverHandles[key].close();
        delete self._serverHandles[key];
      }

      // call callback when done
      if (callback) callback();
    });

    // begin disconnecting all workers
    for (var i in this.workers) {
      this.workers[i].once('disconnect', progress.done.bind(progress));
      this.workers[i].disconnect();
    }

    // in case there wasn't any workers
    progress.check();
  };

  Master.prototype._getServerHandle = function (address, port, addressType) {
    var key = address + ':' + port + ':' + addressType; 

    if (this._serverHandles.hasOwnProperty(key)) {
      return this._serverHandles[key];
    } else {
      return this._serverHandles[key] = net._createServerHandle(address, port, addressType);
    }
  };

  cluster = module.exports = new Master();

  cluster.Master = Master;
  cluster.Worker = Worker;

  // Handle online messages from workers
  messageHandler.online = function(message, worker) {
    worker.state = 'online';
    debug('Worker ' + worker.process.pid + ' online');
    worker.emit('online', worker);
    worker.master.emit('online', worker);
  };

  // Handle queryServer messages form workers
  messageHandler.queryServer = function(message, worker, send) {
    send({}, worker.master._getServerHandle(message.address, message.port, message.addressType));
  };

  // Handle listening messages from workers
  messageHandler.listening = function(message, worker) {

    worker.state = 'listening';

    // Emit listining, now that we know the worker is listening
    worker.emit('listening', worker, {
      address: message.address,
      port: message.port,
      addressType: message.addressType
    });
    worker.master.emit('listening', worker, {
      address: message.address,
      port: message.port,
      addressType: message.addressType
    });
  };

  // Handle suicide messages from workers
  messageHandler.suicide = function(message, worker) {
    worker.suicide = true;
  };

}

