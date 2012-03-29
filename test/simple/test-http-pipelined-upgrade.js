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
var net = require('net');
var http = require('http');

var agent = new http.Agent({ maxSockets: 1 });

var gotRegularResponse = false;
var gotUpgradeResponse = false;

var server = http.createServer(function(req, res) {
  common.debug('Server got regular request');
  setTimeout(function() {
    common.debug('Server finished regular request');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  }, 500);
});
server.on('upgrade', function(req, sock, head) {
  common.debug('Server got upgrade request');
  sock.end('HTTP/1.1 101 Switching Protocols\r\n' +
             'Upgrade: dummy\r\n' +
             'Connection: Upgrade\r\n' +
             '\r\n\r\n');
  server.close();
});
server.listen(common.PORT, function() {
  var conn = net.createConnection(common.PORT);

  conn.on('connect', function() {
    conn.write('GET / HTTP/1.1\r\n' +
               '\r\n' +
               'GET / HTTP/1.1\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');
  });

  conn.setEncoding('utf8');
  var data = '';
  conn.on('data', function(chunk) {
    data += chunk;
  });

  conn.on('end', function() {
    conn.end();

    var regularIndex = data.indexOf('Hello World');
    var upgradeIndex = data.indexOf('Upgrade');
    assert.notEqual(regularIndex, -1);
    assert.notEqual(upgradeIndex, -1);
    assert.ok(regularIndex < upgradeIndex);
  });
});
