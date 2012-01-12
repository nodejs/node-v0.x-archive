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

var EventEmitter = require('events').EventEmitter;
var net = require('net');
var util = require('util');

var constants = process.binding('constants');
var Pipe = process.binding('pipe_wrap').Pipe;

var internalProcess = process.binding('process_wrap').Process;
var internalThread = process.binding('isolates');

var isWindows = process.platform === 'win32';

//
// Helpers
//

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

// create errno object
function errnoException(errorno, syscall, msg, path) {
 // TODO make this more compatible with ErrnoException from src/node.cc
 // Once all of Node is using this function the ErrnoException from
 // src/node.cc should be removed.
  var message = errorno + ', ' + msg + (path ? ' \'' + path + '\'' : '');

  var e = new Error(message);
  e.errno = e.code = errorno;
  e.syscall = syscall;
  if (path) e.path = path;
  if (syscall) e.syscall = syscall;

 return e;
}

function createSocket(pipe, options) {
  var s = new net.Socket({ handle: pipe });

  extendObject(s, {
    writable: !!options.writable,
    readable: !!options.readable
  });

  if (options.readable) {
    s.resume();
  }

  return s;
}

function streamBuffer(name, from, to, encoding, maxBuffer, cb) {
  from[name].setEncoding(encoding);
  to[name] = '';
  var length = 0;

  from[name].addListener('data', function(chunk) {
    to[name] += chunk;
    length += chunk.length;

    if ((length += chunk.length) > maxBuffer) {
      cb(new Error('maxBuffer exceeded.'));
    }
  });
}

function ignoreCallback() { }

var simultaneousAccepts = process.env.NODE_MANY_ACCEPTS !== '0';
function setSimultaneousAccepts(handle) {
  if (!handle || !isWindows) return;

  // do only this once
  if (handle._simultaneousAccepts != simultaneousAccepts) {
      handle.setSimultaneousAccepts(simultaneousAccepts);
      handle._simultaneousAccepts = simultaneousAccepts;
  }
}

//
// Child Object
//
function Child() {
  this.signalCode = null;
  this.exitCode = null;
  this.killed = false;

  this._internal = null;
}
util.inherits(Child, EventEmitter);
exports.Child = Child;

// Kill the process
Child.prototype.kill = function (sig) {

  // get signal
  var signal = constants[sig || 'SIGTERM'];

  if (!signal) {
    throw new Error('Unknown signal: ' + sig);
  }

  // Kill child process
  if (this._internal) {
    this.killed = true;

    var r = this._internal.kill(signal);
    if (r === -1) {
      // errno is a global variable set in c++ land
      throw errnoException(errno, 'kill', 'No such process');
    }
  }
};


//
// Process Object
//

// Setup the process
function Process() {
  var self = this;

  // Initialize child
  Child.call(this);

  // Create a new binding to the process layer
  this._internal = new internalProcess();

  // This will run the the child process may exits
  this._internal.onexit = function (exitCode, signalCode) {
    //
    // follow 0.4.x behaviour:
    //
    // - normally terminated processes don't touch this.signalCode
    // - signaled processes don't touch this.exitCode
    //
    if (signalCode) {
      self.signalCode = signalCode;
    } else {
      self.exitCode = exitCode;
    }

    // closing all open channels
    var missing = 4;
    function check() {
      if ((--missing) === 0) {
        self.emit('exit', self.exitCode, self.signalCode);
      }
    }

    // we will destroy the stdin sockets
    var channel = self[self.useChannel ? 'channel' : 'stdin'];
    if (channel && !channel.destroyed) {
      channel.on('close', check);
      channel.destroy();
    } else {
      check();
    }

    // we will close the stdout and stderr
    if (self.stdout && !self.stdout.destroyed) {
      self.stdout.on('close', check);
    } else {
      check();
    }

    if (self.stderr && !self.stderr.destroyed) {
      self.stderr.on('close', check);
    } else {
      check();
    }

    // clossing the process watcher channel
    self._internal.close();
    self._internal = null;

    // We are first ready now to emit exit if no std channels was open
    check();
  };

}
util.inherits(Process, Child);
exports.Process = Process;

// Spawn the process
Process.prototype.spawn = function (options) {

  // Create the options object there is send to internalProcess.spawn
  var layerOptions = {};

  // should use channel
  this.useChannel = !!options.channel;

  // Setup streams betweeen parent and child
  // if a IPC is required stdin will be used
  layerOptions.stdinStream = new Pipe(this.useChannel);
  layerOptions.stdoutStream = new Pipe();
  layerOptions.stderrStream = new Pipe();

  // Create the env property
  var env = options.env || process.env;
  var envPairs = [];
  for (var key in env) {
    envPairs.push(key + '=' + env[key]);
  }
  if (this.useChannel) {
    // this will call require('child_process')._forkChild when child spawn
    envPairs.push('NODE_CHANNEL_FD=42');
  }

  layerOptions.envPairs = envPairs;

  // Create the args array
  layerOptions.args = options.args ? options.args.slice(0) : [];
  layerOptions.args.unshift(options.file);

  // If the platform is windows check the verbatim property
  if (isWindows) {
    layerOptions.windowsVerbatimArguments = !!options.verbatim;
  }

  // The rest do not need extra work
  extendObject(layerOptions, {
    file: options.file,
    cwd: options.cwd
  });

  // We are ready to spawn
  var r = this._internal.spawn(layerOptions);

  // There was an error when the process was spawned
  if (r) {

    // We will close all stream channels
    layerOptions.stdinStream.close();
    layerOptions.stdoutStream.close();
    layerOptions.stderrStream.close();

    // We will close the process watcher channel
    this._internal.close();
    this._internal = null;

    // errno is a global variable set in c++ land
    throw errnoException(errno, 'spawn', 'Could not execute');
  }

  // Export the process pid
  this.pid = this._internal.pid;

  //export as writeable stream
  if (this.useChannel) {
    this.channel = createSocket(layerOptions.stdinStream, {readable: true, writable: true});
  } else {
    this.stdin = createSocket(layerOptions.stdinStream, {writable: true});
  }

  //export as readable stream
  this.stdout = createSocket(layerOptions.stdoutStream, {readable: true});
  this.stderr = createSocket(layerOptions.stderrStream, {readable: true});
};

// setup channel in child
exports._forkChild = function() {
  var pipe = new Pipe(true);
  pipe.open(0);
  process.channel = createSocket(pipe, {readable: true, writable: true});

  return true;
};

// spawn a new minimal process
exports.spawn = function (file, args, options) {

  // create a new child instance
  var child = new Process();

  // create options object
  var sendOptions = {};
  extendObject(sendOptions, options);
  sendOptions.file = file;
  sendOptions.args = args;

  // spawn child
  child.spawn(sendOptions);

  return child;
};

// execute a file
exports.execFile = function(file /*, [args], [options], callback */) {

  // define additional arguments
  var existArgs = Array.isArray(arguments[1]);
  var existOptions = arguments.length === (existArgs ? 4 : 3);
  var callback = arguments[arguments.length - 1];
  var args = existArgs ? arguments[1] : undefined;
  var optionArg = existOptions ? arguments[existArgs ? 2 : 1] : undefined;

  // create options object
  var options = {
    encoding: 'utf8',
    maxBuffer: 200 * 1024,
    killSignal: 'SIGTERM'
  };
  extendObject(options, optionArg);

  // create the child
  var child = exports.spawn(file, args, options);

  // an optional setTimeout, will be removed later
  if (options.timeout) {
    var timeout = setTimeout(kill, options.timeout);
  }

  // kill the process from timeout or buffer overload
  function kill(err) {
    child.kill(options.killSignal);

    // the process might not be killed by the signal
    process.nextTick(function () {
      exitHandler(null, options.killSignal, err, true);
    });
  }

  // buffer all incomming data
  var out = {};
  var encoding = options.encoding;
  var maxBuffer = options.encoding;

  streamBuffer('stdout', child, out, encoding, maxBuffer, kill);
  streamBuffer('stderr', child, out, encoding, maxBuffer, kill);

  // handle exists
  child.addListener('exit', exitHandler);

  // handle both real and fake exit
  var exited;
  function exitHandler(code, signal, err, killed) {
    // run only once
    if (exited) return;
    exited = true;

    clearTimeout(timeout);

    if (!callback) return;

    if (code === 0) {
      //No errors
      callback(null, out.stdout, out.stderr);

    } else if (err) {
      // Buffer extended
      callback(err, out.stdout, out.stderr);

    } else {
      // Timeout or unsuccessful death
      var e = new Error('Command failed: ' + out.stderr);
      e.killed = child.killed || killed || false;
      e.code = code;
      e.signal = signal;
      callback(e, out.stdout, out.stderr);
    }
  }

  return child;
};

// execute a terminal command
exports.exec = function(command /*, [options], callback */) {

  // define additional arguments
  var existOptions = arguments.length === 3;
  var options = existOptions ? arguments[1] : undefined;
  var callback = arguments[arguments.length - 1];

  // set windows verbatim mode
  var sendOptions = {
    verbatim: true
  };
  extendObject(sendOptions, options);

  // use diffrent file to execute command depending on OS
  var file, args;
  if (isWindows) {
    file = 'cmd.exe';
    args = ['/s', '/c', '"' + command + '"'];
  } else {
    file = '/bin/sh';
    args = ['-c', command];
  }

  // use the execFile to exeucte the command
  return exports.execFile(file, args, options, callback);
};

//
// Thread Object
//

function Thread() {

  // Initialize child
  Child.call(this);
}
util.inherits(Thread, Child);
exports.Thread = Thread;

Thread.prototype.spawn = function (options) {
  var self = this;

  // create arguments object
  var args = options.args ? options.args.slice(0) : [];
  args.unshift(options.file);

  // spawn tread
  this._internal = internalThread.create(args, options);
  if (!this._internal) {
    throw new Error('Cannot create isolate.');
  }

  // set tread id
  this.tid = this._internal.tid;

  // handle messages
  this._internal.onmessage = function(message) {
    message = JSON.parse('' + message);

    // Filter out internal messages
    // if cmd property begin with "_NODE"
    if (message !== null &&
        typeof message === 'object' &&
        typeof message.cmd === 'string' &&
        message.cmd.indexOf('NODE_') === 0) {
      self.emit('inernalMessage', message);
    }

    // Non-internal message
    else {
      self.emit('message', message);
    }
  };

  // handle exit
  this._internal.onexit = function() {
    self._internal = null;
    self.emit('exit');
  };
};

Thread.prototype.send = function (message /*, sendHandle */) {
  if (typeof message === 'undefined') {
    throw new TypeError('message cannot be undefined');
  }

  message = new Buffer(JSON.stringify(message));
  return this._internal.send(message);
};

Thread.prototype.kill = function (/* sig */) {
  // ignore silently for now, need a way to signal the other thread
};

// fork a new tread
exports.fork = function (modulePath, args, options) {

  // add modulePath a new arguments array
  args = args ? args.slice(0) : [];
  args.unshift(modulePath);

  // create options object
  var sendOptions = {};
  extendObject(sendOptions, options);
  sendOptions.args = args;

  // fork tread
  var child = new Thread();
  child.spawn(sendOptions);

  return child;
};
