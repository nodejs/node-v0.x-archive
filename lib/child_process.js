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

function ProgressTracker(callback) {
  this.callback = callback;
  this.states = [];
}
ProgressTracker.prototype.add = function() {
  var i = arguments.length;
  while (i--) {
    this.states.push(arguments[i]);
  }
};
ProgressTracker.prototype.set = function(name) {
  this.states.splice(this.states.indexOf(name), 1);
  this.check();
};
ProgressTracker.prototype.check = function() {
  if (this.states.length !== 0) return;

  if (this.callback) {
    this.callback();
  }
};

function createSocket(pipe, readable) {
  var s = new net.Socket({ handle: pipe });

  if (readable) {
    s.writable = false;
    s.readable = true;
    s.resume();
  } else {
    s.writable = true;
    s.readable = false;
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

//
// Process Object
//

// Setup the process
function Process() {
  var self = this;

  // Process exit status
  this.signalCode = null;
  this.exitCode = null;
  this.killed = false;

  //Create a new binding to the process layer
  this._internal = new internalProcess();

  //This will run the the child process may exits
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
    var track = new ProgressTracker(function () {
      self.emit('exit', self.exitCode, self.signalCode);
    });
    track.add('stdin', 'stderr', 'stdout', 'process');

    // we will destroy the stdin sockets
    if (self.stdin && !self.stdin.destroyed) {
      self.stdin.on('close', function () {
        track.set('stdin');
      });
      self.stdin.destroy();
    } else {
      track.set('stdin');
    }
    
    // we will close the stdout and stderr
    if (self.stdout && !self.stdout.destroyed) {
      self.stdout.on('close', function () {
        track.set('stdout');
      });
    } else {
      track.set('stdout');
    }

    if (self.stderr && !self.stderr.destroyed) {
      self.stderr.on('close', function () {
        track.set('stderr');
      });
    } else {
      track.set('stderr');
    }

    // clossing the process watcher channel
    self._internal.close();
    self._internal = null;

    // We are first ready now to emit exit if no std channels was open
    track.set('process');
  };

}
util.inherits(Process, EventEmitter);
exports.Process = Process;

// Spawn the process
Process.prototype.spawn = function (options) {

  // Create the options object there is send to internalProcess.spawn
  var layerOptions = {};

  // Setup streams betweeen parent and child
  layerOptions.stdinStream = new Pipe(!!options.channel);
  layerOptions.stdoutStream = new Pipe();
  layerOptions.stderrStream = new Pipe();

  // Create the env property
  var env = options.env || process.env;
  var envPairs = [];
  for (var key in env) {
    envPairs.push(key + '=' + env[key]);
  }
  layerOptions.envPairs = envPairs;
  
  // Create the args array
  layerOptions.args = options.args ? options.args.slice(0) : [];
  layerOptions.args.unshift(options.file);
  
  // If the platform is windows check the verbatim property
  if (process.platform === 'win32') {
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
  this.stdin = createSocket(layerOptions.stdinStream, false);
  
  //export as readable stream
  this.stdout = createSocket(layerOptions.stdoutStream, true);
  this.stderr = createSocket(layerOptions.stderrStream, true);
};

// Kill the process
Process.prototype.kill = function () {

  // get signal
  var sig = sig || 'SIGTERM';
  var signal = constants[sig];

  if (!signal) {
    throw new Error('Unknown signal: ' + sig);
  }

  // Kill child process
  if (this._internal) {
    this.killed = true;

    var r = this._internal.kill(signal);
    if (r === -1) {
      throw errnoException(errno, 'kill', 'No such process');
    }
  }
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
  if (process.platform === 'win32') {
    file = 'cmd.exe';
    args = ['/s', '/c', '"' + command + '"'];
  } else {
    file = '/bin/sh';
    args = ['-c', command];
  }
  
  // use the execFile to exeucte the command
  return exports.execFile(file, args, options, callback);
};
