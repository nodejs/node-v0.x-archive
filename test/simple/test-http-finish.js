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

var assert = require('assert');
var http = require('http');
var stream = require('stream');
var url = require('url');

var chunks = 5;

var responseBuffer = new Buffer(1024 * 1024 * 16);
responseBuffer.fill('x');
responseBuffer = responseBuffer.toString();

var expect = chunks * responseBuffer.length;

var server = http.createServer(function(req, res) {
  var src = new stream.Readable();
  var reads = 0;
  src._read = function(n) {
    src.push(reads++ === chunks ? null : responseBuffer);
  };

  res.setHeader('connection', 'close');
  res.setHeader('x-id', req.socket.id);

  // 'finish' should mean fully flushed.
  res.once('finish', function() {
    req.destroy();
  });

  src.pipe(res);
});

var socketId = 1;
server.on('connection', function(sock) {
  sock.id = socketId++;
});

server.listen(common.PORT, function() {
  makeReq();
  makeReq();
  makeReq();
  makeReq();
  makeReq();
  makeReq();
  makeReq();
  makeReq();
});

var reqs = 0;

function makeReq() {
  reqs++;
  var r = url.parse('http://127.0.0.1:' + common.PORT);
  r.method = 'PUT';
  r.headers = { 'content-length': 1024 * 1024 };
  // r.agent = false;
  r = http.request(r, function(res) {
    var received = 0;
    res.on('data', function(chunk) {
      received += chunk.length;
    });

    res.once('end', function() {
      assert.equal(received, expect, 'Not equal results');
      console.log('ok - socket id #%d', res.headers['x-id']);
      if (--reqs === 0) {
        console.log('0..8');
        server.close();
      }
    });
  });
  r.end();
}
