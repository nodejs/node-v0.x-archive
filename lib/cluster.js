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

function extendObject(origin, add) {
  // Don't do anything if add isn't an object
  if (!add) return origin;

  var keys = Object.keys(add),
      i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
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
  var outMessage = extendObject({}, inMessage);

  // Add internal prefix to cmd
  outMessage.cmd = INTERNAL_PREFIX + (outMessage.cmd || '');

  return outMessage;
}


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
var messageHandingObject = {};
function handleMessage(worker, inMessage, inHandle) {

  //Remove internal prefix
  var message = extendObject({}, inMessage);
  message.cmd = inMessage.cmd.substr(INTERNAL_PREFIX.length);

  var respondUsed = false;
  var respond = function(outMessage, outHandler) {
    respondUsed = true;
    handleResponse(outMessage, outHandler, inMessage, inHandle, worker);
  };

  // Run handler if it exist
  if (messageHandingObject[message.cmd]) {
    messageHandingObject[message.cmd](message, worker, respond);
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

  var serverLisenters = {};
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
      if (this.process.connected) {
  
        // Inform master that is is suicide and then kill
        sendInternalMessage(this, {cmd: 'suicide'}, function() {
          process.exit(0);
        });
  
        var self = this;

        // When master do a quickDestroy the channel is not necesarily closed
        // at the point this function runs. For that reason we need to keep
        // checking that the channel is still open, until a actually callback
        // from the master is resicved. Also we can't do a timeout and then
        // just kill, since we don't know if the quickDestroy function was called.
        setInterval(function() {
          if (!self.process.connected) {
            process.exit(0);
          }
        }, 200);
  
      } else {
        process.exit(0);
      }
    };

    // Send message to master
    Worker.prototype.send = process.send.bind(process);
 
    // Get worker class
    var worker = cluster.worker = new Worker();
  
    // Tell master that the worker is online
    sendInternalMessage(worker, { cmd: 'online' });
  };
  
  // Internal function. Called by lib/net.js when attempting to bind a server.
  cluster._getServer = function(tcpSelf, address, port, addressType, cb) {
    // This can only be called from a worker.
    assert(cluster.isWorker);
  
    // Store tcp instance for later use
    var key = [address, port, addressType].join(':');
    serverLisenters[key] = tcpSelf;
  
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

  // TODO: the disconnect step?


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
    var envCopy = extendObject({}, env);
    envCopy['NODE_UNIQUE_ID'] = this.uniqueID;
    // second: extend envCopy with the env argument
    if (isObject(customEnv)) {
      envCopy = extendObject(envCopy, customEnv);
    }

    var settings = master.settings;

    // fork worker
    this.process = fork(settings.exec, settings.args, {
      'env': envCopy,
      'silent': settings.silent
    });

    // handle internalMessage and exit event
    this.process.on('internalMessage', handleMessage.bind(null, this));
    this.process.on('exit', this._prepareDeath.bind(this)); //null, this, 'dead', 'death'));
 
    // relay message and error
    this.process.on('message', this.emit.bind(this, 'message'));
    this.process.on('error', this.emit.bind(this, 'error'));
  
  }
  util.inherits(Worker, EventEmitter);
  
  Worker.prototype._prepareDeath = function () {
    // set state to disconnect
    this.state = 'dead';
    
    // Make suicide a boolean
    this.suicide = !!this.suicide;

    // Remove from workers in the master
    delete this.master.workers[this.uniqueID];

    // Emit events
    this.emit('death', this);
    this.master.emit('death', this);
  };

  Worker.prototype.destroy = function() {

    // Disconnect IPC channel
    //Apparently the .close method is async, but do not have a callback

    var workerProcess = this.process;
    workerProcess._channel.close();
    workerProcess._channel = null;
    process.nextTick(function () {
        workerProcess.kill();
    });
  };

  // Send message to worker
  Worker.prototype.send = function() {
    this.process.send.apply(this.process, arguments);
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

  cluster = module.exports = new Master();

  cluster.Master = Master;
  cluster.Worker = Worker;

  // Handle online messages from workers
  messageHandingObject.online = function(message, worker) {
    worker.state = 'online';
    debug('Worker ' + worker.process.pid + ' online');
    worker.emit('online', worker);
    worker.master.emit('online', worker);
  };

  var serverHandlers = {};

  // Handle queryServer messages form workers
  messageHandingObject.queryServer = function(message, worker, send) {

    // This sequence of infomation is unique to the connection but not
    // to the worker
    var args = [message.address, message.port, message.addressType];
    var key = args.join(':');
    var handler;

    if (serverHandlers.hasOwnProperty(key)) {
      handler = serverHandlers[key];
    } else {
      handler = serverHandlers[key] = net._createServerHandle.apply(net, args);
    }

    // echo callback with the fd handler associated with it
    send({}, handler);
  };

  // Handle listening messages from workers
  messageHandingObject.listening = function(message, worker) {

    worker.state = 'listening';

    // Emit listining, now that we know the worker is listning
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

  // Handle suicide messages from workers
  messageHandingObject.suicide = function(message, worker) {
    worker.suicide = true;
  };

}

// ----------------------------------------------------------------








