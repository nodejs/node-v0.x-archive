// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE

'use strict';

var dgram = require('dgram'),
    net = require('net'),
    util = require('util'),
    Packet = require('dns_packet').Packet,
    EDNSPacket = require('dns_packet').EDNSPacket,
    TCPMessage = require('dns_utils').TCPMessage,
    Socket = require('dns_utils').Socket;

var SocketCache = function(parent) {
  this._pending = {};
  this._socket = {};
  this._parent = parent;
};

SocketCache.prototype._hash = function(server) {
  if (server.type === 'tcp')
    return server.address + ':' + server.port;
  else
    return 'udp' + net.isIP(server.address);
};

SocketCache.prototype._getPending = function(server) {
  var name = this._hash(server);
  return this._pending[name];
};

SocketCache.prototype._pendingAdd = function(server, cb) {
  var name = this._hash(server);
  if (!this._pending[name]) {
    this._pending[name] = [];
  }
  this._pending[name].push(cb);
};

SocketCache.prototype._pendingRemove = function(server) {
  var name = this._hash(server);
  delete this._pending[name];
};

SocketCache.prototype._toInternalSocket = function(server, socket) {
  var S;

  if (server.type === 'tcp') {
    S = new Socket(null, socket);
  } else {
    S = new Socket(socket, server);
  }

  return S;
};

SocketCache.prototype._pendingEmit = function(server, socket) {
  var S, pending, self = this;
  pending = this._getPending(server);
  if (pending) {
    self._socketAdd(server, socket);
    this._pendingRemove(server);
    S = this._toInternalSocket(server, socket);
    pending.forEach(function(cb) {
      cb(S);
    });
  }
};

SocketCache.prototype._getSocket = function(server) {
  var name = this._hash(server);
  return this._socket[name];
};

SocketCache.prototype._socketRemoveInternal = function(shash, socket) {
  if (socket) {
    delete this._socket[shash];
    if (socket.socket.end) {
      socket.socket.end();
    } else {
      socket.socket.close();
    }
  }
};

SocketCache.prototype._socketRemove = function(server) {
  var cache_name = this._hash(server);
  var socket = this._getSocket(server);
  this._socketRemoveInternal(cache_name, socket);
};

SocketCache.prototype._socketAdd = function(server, socket) {
  var self = this;
  var cache_name = this._hash(server);
  this._socket[cache_name] = {
    last: new Date().getTime(),
    socket: socket
  };
};

SocketCache.prototype._createTcp = function(server) {
  var socket, self = this, tcp;
  socket = net.connect(server.port, server.address);

  socket.on('timeout', function() {
    self._pendingRemove(server);
    self._socketRemove(server);
  });

  socket.on('close', function() {
    self._pendingRemove(server);
    self._socketRemove(server);
  });

  socket.on('connect', function() {
    self._pendingEmit(server, socket);
  });

  tcp = new TCPMessage(socket, function(msg, socket) {
    self._parent.handleMessage(server, msg, socket);
  });
};

SocketCache.prototype._createUdp = function(server) {
  var socket, self = this,
      type = net.isIP(server.address);
  if (type) {
    socket = dgram.createSocket('udp' + type);
    socket.on('message', function(msg, remote) {
      // 20 is the smallest a packet could be when asking for the root
      // we have no way to associate this response to any request, thus if the
      // packet was broken somewhere along the way it will result in a timeout
      if (msg.length >= 20)
        self._parent.handleMessage(server, msg, new Socket(socket, remote));
    });
    socket.on('close', function() {
      self._socketRemove(server);
    });
    socket.on('listening', function() {
      //self._socketAdd(server, socket);
      self._pendingEmit(server, socket);
    });
    socket.bind();
  }
};

SocketCache.prototype.get = function(server, cb) {
  var socket, pending, S;

  socket = this._getSocket(server);
  pending = this._getPending(server);

  if (!socket) {
    this._pendingAdd(server, cb);
    if (!pending) {
      if (server.type === 'tcp') {
        this._createTcp(server);
      } else {
        this._createUdp(server);
      }
    }
  } else {
    socket.last = new Date().getTime();
    S = this._toInternalSocket(server, socket.socket);
    cb(S);
  }
};

SocketCache.prototype.close = function(shash) {
  var socket = this._socket[shash];
  this._socketRemoveInternal(shash, socket);
};

var random_integer = function() {
  return Math.floor(Math.random() * 50000 + 1);
};

var SOCKET_TIMEOUT = 300;

var ServerQueue = module.exports = function(parent, active) {
  var self = this;

  this._queue = {};
  this._active = {};
  this._socketCache = new SocketCache(parent);
  this._max_queue = active;

  var check_sockets = function() {
    var s, now;
    now = new Date().getTime();
    Object.keys(self._socketCache._socket).forEach(function(s) {
      var socket = self._socketCache._socket[s];
      var delta = now - socket.last;

      var m = { server: s, delta: delta };

      if (self._queue[s])
        m.queue = self._queue[s].order.length;

      if (self._active[s])
        m.active = self._active[s].count;

      if (delta > SOCKET_TIMEOUT && self._queue[s].order.length === 0 &&
          self._active[s].count === 0) {
        self._socketCache.close(s);
      }
    });
    if (Object.keys(self._socketCache._socket).length) {
      self._timer = setTimeout(check_sockets, SOCKET_TIMEOUT);
    }
  };

  self._timer = setTimeout(check_sockets, SOCKET_TIMEOUT);
};

ServerQueue.prototype._hash = function(server) {
  if (server.type === 'tcp')
    return server.address + ':' + server.port;
  else
    return 'udp' + net.isIP(server.address);
};

ServerQueue.prototype._getQueue = function(server) {
  var name = this._hash(server);

  if (!this._queue[name]) {
    this._queue[name] = {
      order: []
    };
  }

  return this._queue[name];
};

ServerQueue.prototype._getActive = function(server) {
  var name = this._hash(server);

  if (!this._active[name]) {
    this._active[name] = {
      count: 0
    };
  }

  return this._active[name];
};

ServerQueue.prototype.add = function(server, request, cb) {
  var name, id, queue, active;

  name = this._hash(server);
  queue = this._getQueue(server);
  active = this._getActive(server);

  id = random_integer();
  while (queue[id] || active[id]) id = random_integer();

  queue[id] = {
    request: request,
    cb: cb
  };
  queue.order.splice(0, 0, id);
  request.id = id;
  this.fill(server);
};

ServerQueue.prototype.remove = function(server, id) {
  var idx, queue, active;

  queue = this._getQueue(server);
  active = this._getActive(server);

  delete queue[id];
  idx = queue.order.indexOf(id);
  if (idx > -1)
    queue.order.splice(idx, 1);

  if (active[id]) {
    delete active[id];
    active.count -= 1;
  }

  this.fill(server);
};

ServerQueue.prototype.pop = function(server) {
  var queue, active, id, obj;
  queue = this._getQueue(server);
  active = this._getActive(server);

  id = queue.order.pop();
  obj = queue[id];

  if (id && obj) {
    active[id] = obj.request;
    active.count += 1;
    return obj.cb;
  }
};

ServerQueue.prototype.fill = function(server) {
  var active, cb;
  active = this._getActive(server);
  while (active.count < this._max_queue) {
    cb = this.pop(server);
    if (cb)
      this._socketCache.get(server, cb);
    else
      break;
  }
};

ServerQueue.prototype.getRequest = function(server, id) {
  var active = this._getActive(server);
  return active[id];
};

var PendingRequests = function() {
  this._server_queue = new ServerQueue(this, 100);
  this.autopromote = true;
};

PendingRequests.prototype.send = function(request) {
  var packet;

  this._server_queue.add(request.server, request, function(socket) {
    if (request.try_edns) {
      packet = new EDNSPacket(socket);
    } else {
      packet = new Packet(socket);
    }
    packet.header.id = request.id;
    packet.header.rd = 1;
    packet.question.push(request.question);
    try {
      packet.send();
    } catch (e) {
      request.error(e);
    }
  });
};

PendingRequests.prototype.remove = function(request) {
  if (request.server && request.id)
    this._server_queue.remove(request.server, request.id);
};

PendingRequests.prototype.handleMessage = function(server, msg, socket) {
  var err, request, answer;

  answer = new Packet(socket);
  answer.unpack(msg, this.autopromote);
  answer = answer.promote(this.autopromote);

  request = this._server_queue.getRequest(server, answer.header.id);
  if (request)
  {
    this.remove(request);
    request.handle(err, answer);
  }
};

module.exports = new PendingRequests();
