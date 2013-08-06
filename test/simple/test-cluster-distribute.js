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
var cluster = require('cluster');
var http = require('http');

var workerCount = 3;
var requestsPerWorker = 10;

if (cluster.isMaster) {
  var distributed = 0;
  var hitCount = 0;

  var i = 0;
  cluster.setupMaster({
    distribute: function(callback) {
      setTimeout(function() {
        // Hand-off handles to the first two workers
        var i = (i + 1) % (workerCount - 1);
        distributed++;
        callback(null, workers[i]);
      }, 5);
    }
  });

  var hits = {};
  var workers = [];

  function fork() {
    var worker = cluster.fork();
    workers.push(worker);
    worker.on('message', function(msg) {
      if (msg === 'shoot') {
        http.get({ port: common.PORT, path: '/' }, function(res) {
          res.resume();
          res.on('end', function(err) {
            if (err) throw err;
          });
        });
      } else if (msg === 'hit') {
        // Count hits
        if (!hits[worker.id])
          hits[worker.id] = 1;
        else
          hits[worker.id]++;
        if (++hitCount === requestsPerWorker * workerCount)
          process.exit();
      }
    });
  }

  for (var i = 0; i < workerCount; i++)
    fork();

  process.on('exit', function() {
    assert.equal(hitCount, requestsPerWorker * workerCount);
    assert.equal(distributed, requestsPerWorker * workerCount);

    // One worker should receive no requests at all
    assert.equal(Object.keys(hits).length, workerCount - 1);
  });

  return;
}

http.createServer(function(req, res) {
  process.send('hit');
  res.end('OK');
}).listen(common.PORT, function() {
  for (var i = 0; i < requestsPerWorker; i++)
    process.send('shoot');
});
