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

// Testing: https://github.com/joyent/node/issues/5330
// Send handles to the parent process.
// This test tries to trigger a race condition. Hence, its detection rate may be less than 100%.

var common = require('../common');
var assert = require('assert');
var cluster = require('cluster');
var net = require('net');

var workers = {
  toStart: 8
};

if (cluster.isMaster) {
  for (var i = 0; i < workers.toStart; ++i) {
    var worker = cluster.fork();
    worker.on('exit', function(code, signal) {
      assert.equal(code, 0, 'Worker exited with an error code');
      assert(!signal, 'Worker exited by a signal');
    });
  }
} else {
  var server = net.createServer(function(sock) {
    var intervalId = setInterval(function () {
      process.send('crash-test1');
      process.send('crash-test2', sock); // This shouldn't trigger a race condition crashing Node.js on Linux
      process.send('crash-test3');
      process.send('crash-test4', sock); // This shouldn't trigger a race condition crashing Node.js on Linux
      process.send('crash-test5');
    }, 1);

    sock.on('close', function () {
      clearInterval(intervalId);
    });
  });

  server.listen(common.PORT, function () {
    var client = net.connect({ host: 'localhost', port: common.PORT });
    client.on('close', function () { cluster.worker.disconnect(); });
    setTimeout(function () {
      client.end();
    }, 50);
  }).on('error', function (e) {
    console.error(e);
    assert(false, 'server.listen failed');
    cluster.worker.disconnect();
  });
}
