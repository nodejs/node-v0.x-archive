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
// Send messages to workers while they start listening.
// This test tries to trigger a race condition.
// Hence, its detection rate may be less than 100%.

var common = require('../common');
var assert = require('assert');
var cluster = require('cluster');
var net = require('net');

var sendMessageIntervalId = null;
var workers = {
  toStart: 16,
  exited: 0
};

if (cluster.isMaster) {
  sendMessageIntervalId = setInterval(function () {
    for (var id in cluster.workers) {
      // This shouldn't trigger a race condition crashing Node.js
      cluster.workers[id].send({msg: 'crash-test'});
    }
  }, 1);

  for (var i = 0; i < workers.toStart; ++i) {
    var worker = cluster.fork();
    worker.on('exit', function(code, signal) {
      assert.equal(code, 0, 'Worker exited with an error code');
      assert(!signal, 'Worker exited by a signal');

      workers.exited += 1;
      if (workers.toStart === workers.exited) {
        clearInterval(sendMessageIntervalId);
      }
    });
  }
} else {
  var server = net.createServer(assert.fail);

  server.listen(common.PORT, function () {
    setTimeout(function () { cluster.worker.disconnect(); }, 50);
  }).on('error', function (e) {
    console.error(e);
    assert(false, 'server.listen failed');
    cluster.worker.disconnect();
  });
}
