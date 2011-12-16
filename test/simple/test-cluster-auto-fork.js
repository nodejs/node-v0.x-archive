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

function forEach(obj, fn) {
  Object.keys(obj).forEach(function(name, index) {
    fn(obj[name], name, index);
  });
}

if (cluster.isWorker) {

  //Throw an error at some point
  cluster.worker.on('message', function(message) {
    if (message === 'please throw error') {
      process.exit(0);
    }
  });

  //Just keep the worker alive
  var http = require('http');
  http.Server(function() {

  }).listen(common.PORT, '127.0.0.1');
}

else if (cluster.isMaster) {

  var checks = {
    defaultWorkers: false,
    uniqueIDincrease: false,
    workerIDincrease: false,
    workerIDreuse: false,
    workerIDrespawnReuse: false,
    onlineWorkers: false,
    startup: false,
    autoRespawn: false,
    manualRespawn: false,
    suicideException: false
  };

  var cpus = os.cpus().length;
  var workers = 0;
  var workerID = -1;
  var uniqueID = 0;
  var onlineWorkers = 0;
  var listeningWorkers = 0;
  var forkUsed = false;

  //Incresement listenters
  cluster.on('fork', function() {
    uniqueID += 1;
  });

  cluster.on('online', function() {
    onlineWorkers += 1;
  });

  cluster.on('listening', function() {
    listeningWorkers += 1;
  });

  cluster.on('death', function() {
    onlineWorkers -= 1;
    listeningWorkers -= 1;
  });


  //This listenter will be removed again
  cluster.on('fork', function forkListenter(worker) {

    workers += 1;
    workerID += 1;

    if (workers === cpus) {
      forkUsed = true;
      var time = Date.now();

      //Check the worerID incresement
      checks.workerIDincrease = (workerID === worker.workerID);

      //Check the statup time, accept 1 sec delay
      checks.startup = (worker.startup >= (time - 1000) && worker.startup <= time);

      cluster.removeListener('fork', forkListenter);
    }

  });

  //This listenter will be removed again
  cluster.on('online', function onlineListenter() {

    //Check that the number of default workers are cpus
    checks.defaultWorkers = (cluster.workers[cpus] !== undefined);

    //Check onlineWorkers
    checks.onlineWorkers = (onlineWorkers === cluster.onlineWorkers);

    if (onlineWorkers === workers) {
      cluster.removeListener('online', onlineListenter);
    }
  });

  //This listenter will be removed again
  cluster.on('listening', function listeningListenter(newWorker) {

    //next step begin kill and respawn check
    if (listeningWorkers === workers) {
      cluster.removeListener('listening', listeningListenter);

      process.nextTick(function() {
        checkThrowHandling(newWorker);
      });
    }
  });

  var checkThrowHandling = function(killWorker) {

    cluster.once('listening', function(newWorker) {

      //Set autoRespawn
      checks.autoRespawn = true;

      //Check that the workerID is the same
      checks.workerIDreuse = (killWorker.workerID === killWorker.workerID);

      //Check that the uniqueID has been increesed
      checks.uniqueIDincrease = (uniqueID > workerID && newWorker.uniqueID === uniqueID);

      checkKillHandling(newWorker);
    });

    //Force worker to make throw an error
    killWorker.send('please throw error');
  };

  var checkKillHandling = function(killWorker) {

    var sometingsForked = false;

    var forkCheck = function () {
      sometingsForked = true;
    };
    cluster.once('fork', forkCheck);

    //If after 1 sec no worker is forked, we can assume there was no autoRespawn
    setTimeout(function() {

      cluster.removeListener('fork', forkCheck);

      if (sometingsForked === false) {
        checks.suicideException = true;
      }

      process.nextTick(function() {
        checkManualRespawn(killWorker);
      });

    }, 1000);

    killWorker.destroy();
  };

  var checkManualRespawn = function(killWorker) {

    cluster.once('fork', function(newWorker) {
      checks.manualRespawn = true;
      checks.workerIDrespawnReuse = (killWorker.workerID === newWorker.workerID);
    });

    cluster.once('listening', function() {
      process.exit(0);
    });

    cluster.autoFork();
  };

  //Start all workers
  cluster.autoFork();

  //Check all values
  process.once('exit', function() {

    assert.ok(checks.defaultWorkers, 'There was not created the default number of worker');
    assert.ok(checks.uniqueIDincrease, 'The uniqueID did not increase correctly');
    assert.ok(checks.workerIDincrease, 'The workerID did not increase correctly');
    assert.ok(checks.workerIDreuse, 'The workerID was not resued when the worker respawn after an accidently death');
    assert.ok(checks.workerIDrespawnReuse, 'The workerID was not resued when a worker was manual respawned');
    assert.ok(checks.onlineWorkers, 'The onlineWorkers property did not return a correct value');
    assert.ok(checks.startup, 'The startup property was off by more that one second');
    assert.ok(checks.autoRespawn, 'There was not respawned a worker after an accidently death');
    assert.ok(checks.manualRespawn, 'The cluster module could not manually respawn worker');
    assert.ok(checks.suicideException, 'THe worker was respawn after a controlled suicide kill');
  });

}
