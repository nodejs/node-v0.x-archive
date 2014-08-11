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

var common = require('../common');
var assert = require('assert');
var http = require('http');
var net = require('net');
var Agent = require('_http_agent').Agent;
var EventEmitter = require('events').EventEmitter;

var agent = new Agent({
  keepAlive: true,
  keepAliveTimeout: 2000,
  maxSockets: 10,
  maxFreeSockets: 10
});

var server = http.createServer(function (req, res) {
  var remoteAddress = req.socket.remoteAddress;
  var remotePort = req.socket.remotePort;
  console.log('[%s] [http keepalive test] [server] new request from socket#%s:%s %s %s',
    Date(), remoteAddress, remotePort, req.method, req.url);
  res.end('hello world');

  if (req.url === '/first') {
    setTimeout(function () {
      // Use `iptables/ipfw` to drop the server's TCP `FIN` packet,
      // then client free socket wont emit `close` event
      //
      // platform: darwin
      // $ sudo ipfw add 50000 deny tcp from 127.0.0.1 to 127.0.0.1 in tcpflags fin
      //
      // platform: linux
      // $ sudo iptables -A INPUT -s 127.0.0.1 -p tcp -m tcp --tcp-flags FIN FIN -j DROP
      console.log('[%s] [http keepalive test] [server] socket#%s:%s destroy(), send FIN to client',
        Date(), remoteAddress, remotePort);
      req.socket.destroy();
    }, 2000);
  }
});

var serverAddress = '127.0.0.1';

function get(path, callback) {
  console.log('[%s] [http keepalive test] GET %s', Date(), path);
  var req = http.get({
    host: serverAddress,
    port: common.PORT,
    agent: agent,
    path: path
  }, function (res) {
    req.setTimeout(0);
    callback(res);
  });
  return req;
}

var name = serverAddress + ':' + common.PORT + '::';

function checkDataAndSockets(body) {
  assert.equal(body.toString(), 'hello world');
  assert.equal(agent.sockets[name].length, 1);
  assert.equal(agent.freeSockets[name], undefined);
}

function first() {
  // request first, and keep alive
  get('/first', function (res) {
    console.log('[%s] [http keepalive test] got first response', Date());
    assert.equal(res.statusCode, 200);
    res.on('data', checkDataAndSockets);
    res.on('end', function () {
      assert.equal(agent.sockets[name].length, 1);
      assert.equal(agent.freeSockets[name], undefined);
      process.nextTick(function () {
        assert.equal(agent.sockets[name], undefined);
        assert.equal(agent.freeSockets[name].length, 1);
        setTimeout(function () {
          // should use the same socket
          second();
        }, 1000);
      });
    });
    var address = res.socket.address();
    res.socket.on('close', function () {
      console.log('[%s] [http keepalive test] [client] socket#%s:%s close',
        Date(), address.address, address.port);
    });
  });
}

function second() {
  // request second, use the same socket
  get('/second', function (res) {
    console.log('[%s] [http keepalive test] got second response', Date());
    assert.equal(res.statusCode, 200);
    res.on('data', checkDataAndSockets);
    res.on('end', function () {
      assert.equal(agent.sockets[name].length, 1);
      assert.equal(agent.freeSockets[name], undefined);
      process.nextTick(function () {
        assert.equal(agent.sockets[name], undefined);
        assert.equal(agent.freeSockets[name].length, 1);
        setTimeout(function () {
          // free socket should be timeout and release
          third();
        }, 3000);
      });
    });
  });
}

function third() {
  // request third, use the a new socket
  get('/third', function (res) {
    console.log('[%s] [http keepalive test] got third response', Date());
    assert.equal(res.statusCode, 200);
    res.on('data', checkDataAndSockets);
    res.on('end', function () {
      assert.equal(agent.sockets[name].length, 1);
      assert.equal(agent.freeSockets[name], undefined);
      process.nextTick(function () {
        assert.equal(agent.sockets[name], undefined);
        assert.equal(agent.freeSockets[name].length, 1);
        done();
      });
    });
  });
}

function done() {
  console.log('[%s] [http keepalive test] success.', Date());
  server.close();
  assert.equal(Object.keys(agent.sockets).length, 0);
  assert.equal(Object.keys(agent.freeSockets).length, 1);
  // wait free socket to timeout
  setTimeout(function () {
    assert.equal(Object.keys(agent.freeSockets).length, 0);
    process.exit(0);
  }, 2100);
}

server.listen(common.PORT, function () {
  first();
});
