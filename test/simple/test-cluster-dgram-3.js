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
var cluster = require('cluster');
var dgram = require('dgram');

if (cluster.isMaster) {
  // ensure that the worker exits peacefully
  var worker = cluster.fork();
  worker.on('exit', function(statusCode) {
    assert.equal(statusCode, 0);
    worker = null;
  });
  worker.on('message', function(msg) {
    if (msg === 'PASS') {
      worker.disconnect();
    }
  });
  process.on('exit', function() {
    assert.equal(worker, null);
  });

  return;
}

// Should return two sockets, open on the same ephemeral port
var A = dgram.createSocket('udp4');
A.bind(0);

var B = dgram.createSocket('udp4');
B.bind(0);

setTimeout(function() {
  process.send('PASS');
}, 0);
