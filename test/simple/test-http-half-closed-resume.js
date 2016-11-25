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
var net = require('net');
var http = require('http');

var server = http.createServer(function(req, res) {
  req.on('data', function (chunk) {
    req.pause();
    setTimeout(function () {
      req.resume();
    }, 10);
  });
  req.on('end', function () {
    setTimeout(function () {
      res.writeHead(200);
      res.end();
    }, 10);
  });
});
server.httpAllowHalfOpen = true;
server.listen(common.PORT);

server.on('listening', function() {
  var c = net.createConnection(common.PORT);
  c.write('PUT / HTTP/1.1\r\nHost: localhost\r\nContent-Length: 5\r\n\r\n');
  c.on('data', function (chunk) {});
  c.on('end', function () { server.close(); });
  c.end('abcde');
});
