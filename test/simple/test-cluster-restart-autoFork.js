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
var os = require('os');

if (cluster.isWorker) {

  //Just keep the worker alive
  var net = require('net');
  var server = net.createServer(function(socket) {
  });
  server.listen(common.PORT, '127.0.0.1');
}

else if (cluster.isMaster) {

  // Go througe all workers
  var eachWorker = function(callback) {
      for (var uniqueID in cluster.workers) {
          callback(cluster.workers[uniqueID]);
      }
  };

  var checks = {
    workersMatch: false,
    callback: false,
    listeningState: false,
    wasRestarted: false
  };

  var cpus = os.cpus().length;

  //Start workers by fork
  cluster.autoFork();

  //Disconnect the first worker
  cluster.on('listening', function listeningEvent(worker) {
    //When all workers are online
    if (cluster.onlineWorkers === cpus) {
      cluster.removeListener('listening', listeningEvent);

      //When using autoFork, workers there did suicide do also respawn
      //when calling cluster.restart. To test that we will disconnect
      //a singel worker
      worker.once('disconnect', function () {
        var time = Date.now();

        //Check that startup time is greate that the current time
        //this will indicate any new workers
        cluster.once('fork', function (worker) {
          checks.wasRestarted = (worker.startup >= time);
        });

        //restart worker and when done, check that all workers was created
        cluster.restart(function() {
          checks.callback = true;
          checks.workersMatch = (cluster.onlineWorkers === cpus);

          var missing = false;
          eachWorker(function (worker) {
            if (worker.state !== 'listening') missing = true;
          });
          checks.listeningState = !missing;

          console.log(cluster.workers);
          cluster.destroy(function() {
            process.exit(0);
          });
        });
      });

      //disconnect now
      worker.disconnect();
    }
  });

  //Check all values
  process.once('exit', function() {
    assert.ok(checks.callback, 'The callback from restart was not called');
    assert.ok(checks.workersMatch, 'Not all workers was restarted when the callback was called');
    assert.ok(checks.listeningState, 'All workers did not have the listening when restart callback was called');
    assert.ok(checks.wasRestarted, 'The worker did not restart');
});

}
