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
var util = require('util');
var events = require('events');

var debug = util.debuglog('dgram');

var UDP = process.binding('udp_wrap').UDP;

var BIND_STATE_UNBOUND = 0;
var BIND_STATE_BINDING = 1;
var BIND_STATE_BOUND = 2;

// lazily loaded
var cluster = null;
var dns = null;

var errnoException = util._errnoException;

function lookup(address, family, callback) {
  if (!dns)
    dns = require('dns');

  return dns.lookup(address, family, callback);
}


function lookup4(address, callback) {
  return lookup(address || '0.0.0.0', 4, callback);
}


function lookup6(address, callback) {
  return lookup(address || '::0', 6, callback);
}

function newHandle(type) {

  if (type == 'udp4') {
    var handle = new UDP;
    handle.lookup = lookup4;
    return handle;
  }

  if (type == 'udp6') {
    var handle = new UDP;
    handle.lookup = lookup6;
    handle.bind = handle.bind6;
    handle.send = handle.send6;
    return handle;
  }

  if (type == 'unix_dgram')
    throw new Error('unix_dgram sockets are not supported any more.');

  throw new Error('Bad socket type specified. Valid types are: udp4, udp6');
}

exports.createServer = function () {    
  return new Server(arguments[0], arguments[1]);
};

exports._createSocketHandle = function(address, port, addressType, fd) {
  // Opening an existing fd is not supported for UDP handles.
  assert(!util.isNumber(fd) || fd < 0);

  var handle = newHandle(addressType);

  if (port || address) {
    var err = handle.bind(address, port || 0, 0);
    if (err) {
      handle.close();
      return err;
    }
  }

  return handle;
};

// Returns an array [options] or [options, cb]
// It is the same as the argument of Socket.prototype().
function normalizeSocketArgs(args) {
  var options = {};

  options.type = args[0];

  var cb = args[args.length - 1];
  return util.isFunction(cb) ? [options, cb] : [options];
}
exports._normalizeSocketArgs = normalizeSocketArgs;

function Socket() {

  var args = normalizeSocketArgs(arguments);
  var options = args[0];
  var listener = args[1];
  
  events.EventEmitter.call(this);

  debug('Socket : ', options.type);
  
  var handle = newHandle(options.type);
  handle.owner = this;

  this._handle = handle;
  this._receiving = false;
  this._bindState = BIND_STATE_UNBOUND;
  this.type = options.type;
  this.fd = null; // compatibility hack

  if (util.isFunction(listener))
    this.on('message', listener);
}
util.inherits(Socket, events.EventEmitter);
exports.Socket = Socket;


exports.createSocket = function(type, listener) {
  return new Socket(type, listener);
};


function startListening(socket, context) {
  socket._handle.onmessage = onMessage;
  // Todo: handle errors
  socket._handle.recvStart();
  socket._receiving = true;
  socket._bindState = BIND_STATE_BOUND;
  socket.fd = -42; // compatibility hack

  (context || socket).emit('listening');
}

function replaceHandle(self, newHandle) {

  // Set up the handle that we got from master.
  newHandle.lookup = self._handle.lookup;
  newHandle.bind = self._handle.bind;
  newHandle.send = self._handle.send;
  newHandle.owner = self;

  // Replace the existing handle by the handle we got from master.
  self._handle.close();
  self._handle = newHandle;
}

Socket.prototype.bind = function(/*port, address, callback*/) {
  var self = this;

  self._healthCheck();

  if (this._bindState != BIND_STATE_UNBOUND)
    throw new Error('Socket is already bound');

  this._bindState = BIND_STATE_BINDING;

  if (util.isFunction(arguments[arguments.length - 1]))
    self.once('listening', arguments[arguments.length - 1]);

  var UDP = process.binding('udp_wrap').UDP;
  if (arguments[0] instanceof UDP) {
    replaceHandle(self, arguments[0]);
    startListening(self);
    return;
  }

  var port = arguments[0];
  var address = arguments[1];
  if (util.isFunction(address)) address = '';  // a.k.a. "any address"

  // resolve address first
  self._handle.lookup(address, function(err, ip) {
    if (err) {
      self._bindState = BIND_STATE_UNBOUND;
      self.emit('error', err);
      return;
    }

    if (!cluster)
      cluster = require('cluster');

    if (cluster.isWorker) {
      cluster._getServer(self, ip, port, self.type, -1, function(err, handle) {
        if (err) {
          self.emit('error', errnoException(err, 'bind'));
          self._bindState = BIND_STATE_UNBOUND;
          return;
        }

        if (!self._handle)
          // handle has been closed in the mean time.
          return handle.close();

        replaceHandle(self, handle);
        startListening(self);
      });

    } else {
      if (!self._handle)
        return; // handle has been closed in the mean time

      var err = self._handle.bind(ip, port || 0, /*flags=*/ 0);
      if (err) {
        self.emit('error', errnoException(err, 'bind'));
        self._bindState = BIND_STATE_UNBOUND;
        // Todo: close?
        return;
      }

      startListening(self);
    }
  });
};


// thin wrapper around `send`, here for compatibility with dgram_legacy.js
Socket.prototype.sendto = function(buffer,
                                   offset,
                                   length,
                                   port,
                                   address,
                                   callback) {
  if (!util.isNumber(offset) || !util.isNumber(length))
    throw new Error('send takes offset and length as args 2 and 3');

  if (!util.isString(address))
    throw new Error(this.type + ' sockets must send to port, address');

  this.send(buffer, offset, length, port, address, callback);
};


Socket.prototype.send = function(buffer,
                                 offset,
                                 length,
                                 port,
                                 address,
                                 callback) {
  var self = this;

  if (util.isString(buffer))
    buffer = new Buffer(buffer);

  if (!util.isBuffer(buffer))
    throw new TypeError('First argument must be a buffer or string.');

  offset = offset | 0;
  if (offset < 0)
    throw new RangeError('Offset should be >= 0');

  if (offset >= buffer.length)
    throw new RangeError('Offset into buffer too large');

  // Sending a zero-length datagram is kind of pointless but it _is_
  // allowed, hence check that length >= 0 rather than > 0.
  length = length | 0;
  if (length < 0)
    throw new RangeError('Length should be >= 0');

  if (offset + length > buffer.length)
    throw new RangeError('Offset + length beyond buffer length');

  port = port | 0;
  if (port <= 0 || port > 65535)
    throw new RangeError('Port should be > 0 and < 65536');

  // Normalize callback so it's either a function or undefined but not anything
  // else.
  if (!util.isFunction(callback))
    callback = undefined;

  self._healthCheck();

  if (self._bindState == BIND_STATE_UNBOUND)
    self.bind(0, null);

  // If the socket hasn't been bound yet, push the outbound packet onto the
  // send queue and send after binding is complete.
  if (self._bindState != BIND_STATE_BOUND) {
    // If the send queue hasn't been initialized yet, do it, and install an
    // event handler that flushes the send queue after binding is done.
    if (!self._sendQueue) {
      self._sendQueue = [];
      self.once('listening', function() {
        // Flush the send queue.
        for (var i = 0; i < self._sendQueue.length; i++)
          self.send.apply(self, self._sendQueue[i]);
        self._sendQueue = undefined;
      });
    }
    self._sendQueue.push([buffer, offset, length, port, address, callback]);
    return;
  }

  self._handle.lookup(address, function(ex, ip) {
    if (ex) {
      if (callback) callback(ex);
      self.emit('error', ex);
    }
    else if (self._handle) {
      var req = { buffer: buffer };  // Keep reference alive.
      if (callback) {
        req.callback = callback;
        req.oncomplete = afterSend;
      }
      var err = self._handle.send(req,
                                  buffer,
                                  offset,
                                  length,
                                  port,
                                  ip,
                                  !!callback);
      if (err && callback) {
        // don't emit as error, dgram_legacy.js compatibility
        process.nextTick(function() {
          callback(errnoException(err, 'send'));
        });
      }
    }
  });
};


function afterSend(err) {
  this.callback(err ? errnoException(err, 'send') : null);
}


Socket.prototype.close = function() {
  this._healthCheck();
  this._stopReceiving();
  this._handle.close();
  this._handle = null;
  this.emit('close');
};


Socket.prototype.address = function() {
  this._healthCheck();

  var out = {};
  var err = this._handle.getsockname(out);
  if (err) {
    throw errnoException(err, 'getsockname');
  }

  return out;
};


Socket.prototype.setBroadcast = function(arg) {
  var err = this._handle.setBroadcast(arg ? 1 : 0);
  if (err) {
    throw errnoException(err, 'setBroadcast');
  }
};


Socket.prototype.setTTL = function(arg) {
  if (!util.isNumber(arg)) {
    throw new TypeError('Argument must be a number');
  }

  var err = this._handle.setTTL(arg);
  if (err) {
    throw errnoException(err, 'setTTL');
  }

  return arg;
};


Socket.prototype.setMulticastTTL = function(arg) {
  if (!util.isNumber(arg)) {
    throw new TypeError('Argument must be a number');
  }

  var err = this._handle.setMulticastTTL(arg);
  if (err) {
    throw errnoException(err, 'setMulticastTTL');
  }

  return arg;
};


Socket.prototype.setMulticastLoopback = function(arg) {
  var err = this._handle.setMulticastLoopback(arg ? 1 : 0);
  if (err) {
    throw errnoException(err, 'setMulticastLoopback');
  }

  return arg; // 0.4 compatibility
};


Socket.prototype.addMembership = function(multicastAddress,
                                          interfaceAddress) {
  this._healthCheck();

  if (!multicastAddress) {
    throw new Error('multicast address must be specified');
  }

  var err = this._handle.addMembership(multicastAddress, interfaceAddress);
  if (err) {
    throw new errnoException(err, 'addMembership');
  }
};


Socket.prototype.dropMembership = function(multicastAddress,
                                           interfaceAddress) {
  this._healthCheck();

  if (!multicastAddress) {
    throw new Error('multicast address must be specified');
  }

  var err = this._handle.dropMembership(multicastAddress, interfaceAddress);
  if (err) {
    throw new errnoException(err, 'dropMembership');
  }
};


Socket.prototype._healthCheck = function() {
  if (!this._handle)
    throw new Error('Not running'); // error message from dgram_legacy.js
};


Socket.prototype._stopReceiving = function() {
  if (!this._receiving)
    return;

  this._handle.recvStop();
  this._receiving = false;
  this.fd = null; // compatibility hack
};


function onMessage(nread, handle, buf, rinfo) {
  var self = handle.owner;
  if (nread < 0) {
    return self.emit('error', errnoException(nread, 'recvmsg'));
  }
  rinfo.size = buf.length; // compatibility
  self.emit('message', buf, rinfo);
}


Socket.prototype.ref = function() {
  if (this._handle)
    this._handle.ref();
};


Socket.prototype.unref = function() {
  if (this._handle)
    this._handle.unref();
};

function Server(/* [ options, ] listener */) {    

  if (!(this instanceof Server))
      return new Server(arguments[0], arguments[1]);

  events.EventEmitter.call(this);

  var self = this;

  var options;

  debug('dgram:Server');
  
  if (util.isFunction(arguments[0])) {
    options = {};
    self.on('listening', arguments[0]);
  } else {
    options = arguments[0] || {};

    if (util.isFunction(arguments[1])) {
        self.on('listening', arguments[1]);
    }
  }

  this._connections = 0;

  Object.defineProperty(this, 'connections', {
    get: util.deprecate(function() {

      if (self._usingSlaves) {
        return null;
      }
      return self._connections;
    }, 'connections property is deprecated. Use getConnections() method'),
    set: util.deprecate(function(val) {
      return (self._connections = val);
    }, 'connections property is deprecated. Use getConnections() method'),
    configurable: true, enumerable: true
  });
  
  var type = options.type || 'udp4';
  
  if (!this.socket) {
      this.socket = {};
      Socket.call(this.socket, { type: type });
  }

  this._usingSlaves = false; // TODO - CHECK THIS
  this._slaves = [];		 // TODO - CHECK THIS

  this.allowHalfOpen = options.allowHalfOpen || false; // TODO - CHECK THIS
}
util.inherits(Server, events.EventEmitter);
exports.Server = Server;


Server.prototype._bind2 = function(address, port, addressType, fd) {
  debug('_bind2', address, port, addressType);
  var self = this;

  // If there is not yet a handle, we need to create one and bind.
  // In the case of a server sent via IPC, we don't need to do this.
  if (!self._handle) {
    debug('_bind2: create a handle');
    var rval = createServerHandle(address, port, addressType, fd);
    if (util.isNumber(rval)) {
      var error = errnoException(rval, 'bind');
      process.nextTick(function() {
        self.emit('error', error);
      });
      return;
    }
    self._handle = rval;
  } else {
    debug('_bind2: have a handle already');
  }

  self._handle.onconnection = onconnection;
  self._handle.owner = self;

  // Use a backlog of 512 entries. We pass 511 to the listen() call because
  // the kernel does: backlogsize = roundup_pow_of_two(backlogsize + 1);
  // which will thus give us a backlog of 512 entries.
  var err = self._handle.listen(backlog || 511);

  if (err) {
    var ex = errnoException(err, 'bind2');
    self._handle.close();
    self._handle = null;
    process.nextTick(function() {
      self.emit('error', ex);
    });
    return;
  }

  // generate connection key, this should be unique to the connection
  this._connectionKey = addressType + ':' + address + ':' + port;

  process.nextTick(function() {
    self.emit('listening');
  });
};


function bind(self, address, port, addressType, fd) {
  if (!cluster) cluster = require('cluster');

  if (cluster.isMaster) {
    self._bind2(address, port, addressType, fd);
    return;
  }

  cluster._getServer(self, address, port, addressType, fd, cb);

  function cb(err, handle) {
    // EADDRINUSE may not be reported until we call listen(). To complicate
    // matters, a failed bind() followed by listen() will implicitly bind to
    // a random port. Ergo, check that the socket is bound to the expected
    // port before calling listen().
    //
    // FIXME(bnoordhuis) Doesn't work for pipe handles, they don't have a
    // getsockname() method. Non-issue for now, the cluster module doesn't
    // really support pipes anyway.
    if (err === 0 && port > 0 && handle.getsockname) {
      var out = {};
      err = handle.getsockname(out);
      if (err === 0 && port !== out.port)
        err = uv.UV_EADDRINUSE;
    }

    if (err)
      return self.emit('error', errnoException(err, 'bind'));

    self._handle = handle;
    self._bind2(address, port, addressType, fd);
  }
}


Server.prototype.bind = function() {
  var self = this;
  
  //self._healthCheck();

  if (this.socket._bindState != BIND_STATE_UNBOUND)
    throw new Error('Socket is already bound');

  this.socket._bindState = BIND_STATE_BINDING;

  if (util.isFunction(arguments[arguments.length - 1]))
    self.once('listening', arguments[arguments.length - 1]);

  var UDP = process.binding('udp_wrap').UDP;
  if (arguments[0] instanceof UDP) {
    replaceHandle(self, arguments[0]);
    startListening(self, '');
    return;
  }

  var port = arguments[0];
  var address = arguments[1];
  if (util.isFunction(address)) address = '';  // a.k.a. "any address"

  // resolve address first
  self.socket._handle.lookup(address, function(err, ip) {
    if (err) {
      self.socket._bindState = BIND_STATE_UNBOUND;
      self.emit('error', err);
      return;
    }

    if (!cluster)
      cluster = require('cluster');

    if (cluster.isWorker) {
      cluster._getServer(self, ip, port, self.type, -1, function(err, handle) {
        if (err) {
          self.emit('error', errnoException(err, 'bind'));
          self._bindState = BIND_STATE_UNBOUND;
          return;
        }

        if (!self._handle)
          // handle has been closed in the mean time.
          return handle.close();

        replaceHandle(self, handle);
        startListening(self);
      });

    } else {
      if (!self.socket._handle)
        return; // handle has been closed in the mean time

      var err = self.socket._handle.bind(ip, port || 0, /*flags=*/ 0);
      if (err) {
        self.emit('error', errnoException(err, 'bind'));
        self.socket._bindState = BIND_STATE_UNBOUND;
        // Todo: close?
        return;
      }

      startListening(self.socket, self);
    }
  });
}

