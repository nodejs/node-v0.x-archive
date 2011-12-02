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
var processWatch = require('processWatch');
var ProgressTracker = require('progressTracker');

if (cluster.isWorker) {
  var http = require('http');
  http.Server(function () {

  }).listen(common.PORT, "127.0.0.1");
}

else if (cluster.isMaster) {
  
  var checks = {
    cluster: {
      emitDisconnect: false,
      emitDeath: false,
      globalDisconnect: false,
      noWorkers: false,
      allDead: false
    },
    worker: {
      emitDisconnect: false,
      emitExit: false,
      state: false,
      suicideMode: false,
      died: false
    }
  };
  
  //run beginTest when all workers are running
  var cpus = os.cpus().length;
  var workers = 0;
  
  cluster.on('listening', function listeningEvent (worker) {
    workers += 1;
    if (workers === cpus) {
      cluster.removeListener('listening', listeningEvent);
      disconnectWorker(worker);
    }
  });
  

/*
test-cluster-disconnect: Check the disconnect feature, and make sure that the worker did die 
cluster events: disconnect, death 
worker events: disconnect 
methods: worker.send
*/
  
  var disconnectWorker = function (worker) {
    
    //Check cluster events
    cluster.once('disconnect', function () {
      checks.cluster.emitDisconnect = true;
    });
    cluster.once('death', function () {
      checks.cluster.emitDeath = true;
    });
    
    //Check worker eventes
    worker.on('disconnect', function () {
      checks.worker.emitDisconnect = true;
      checks.worker.suicideMode = worker.suicide;
      checks.worker.state = (worker.state === 'disconnect');
    });
    worker.on('exit', function () {
      checks.worker.emitExit = true;
      
      //check that it did die
      processWatch.watch(worker.process.pid, function (alive) {
        checks.worker.died = !alive;
        disconnectCluter();
      });
    });
    
    worker.disconnect();
  };
  
  
  var disconnectCluter = function() {
    
    //Save the workers in a list
    var workerList = [];
    cluster.eachWorker(function (worker) {
      workerList.push(worker);
    });
    
    //When all workers are dead
    var progress = new ProgressTracker(function () {
      checks.cluster.allDead = true;
      process.exit(0);
    });
    progress.add(cluster.workers);
    
    //Disconnect all workers
    cluster.disconnect(function () {
      checks.cluster.globalDisconnect = true;
      
      //Check that the worker list is empty
      checks.cluster.noWorkers = (cluster.onlineWorkers === 0);
      
      //Check that all workers are dead
      workerList.forEach(function (worker) {
        processWatch.watch(worker.process.pid, function () {
          progress.set(worker.uniqueID);
        });
      });
    });
  };
  
  cluster.autoFork();
  
  process.once('exit', function () {
    
    //Check cluster events
    assert.ok(checks.cluster.emitDisconnect, "The disconnect event on the cluster object did never emit");
    assert.ok(checks.cluster.emitDeath, "The death event on the cluster object did never emit");
    
    //Check worker events
    assert.ok(checks.worker.emitDisconnect, "The disconnect event on the worker object did never emit");
    assert.ok(checks.worker.emitExit, "The exit event on the worker object did never emit");
    
    //Check worker state
    assert.ok(checks.worker.state, "The worker state was not 'disconnect' when the exit disconnect was emitted");
    assert.ok(checks.worker.suicideMode, "The suicide mode was not set when the disconnect event emitted ");
    
    //Check result after cluster.disconnect
    assert.ok(checks.cluster.globalDisconnect, "The callback in cluster.disconnect was never called");
    assert.ok(checks.cluster.noWorkers, "There was stil workers online when the cluster.disconnect callback was called");
    
    //Check that workers did die
    assert.ok(checks.cluster.allDead, "Not all clusters died eventually after callinging cluster.disconnect");
    assert.ok(checks.worker.died, "The was did not eventually die after calling worker.disconnect");
    
  });
}