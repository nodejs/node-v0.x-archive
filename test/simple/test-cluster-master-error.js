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

// Cluster setup
if (cluster.isWorker) {
  var http = require('http');
  http.Server(function() {

  }).listen(common.PORT, '127.0.0.1');

} else if (process.argv[2] === 'cluster' && cluster.isMaster) {

  var cpus = require('os').cpus().length;

  //Send PID to testcase process
  var forkNum = 0;
  cluster.on('fork', function forkEvent(worker) {

    //Send PID
    process.send({
      cmd: 'worker',
      workerPID: worker.process.pid
    });

    //Stop listening when done
    if (++forkNum === cpus) {
      cluster.removeListener('fork', forkEvent);
    }
  });

  //Throw accidently error when all workers are listening
  var listeningNum = 0;
  cluster.on('listening', function listeningEvent() {

    //When all workers are listening
    if (++listeningNum === cpus) {
      //Stop listening
      cluster.removeListener('listening', listeningEvent);

      //throw accidently error
      setTimeout(function() {
        throw 'accidently error';
      }, 500);
    }

  });

  //Startup a basic respawn cluster
  cluster.autoFork();
}

//This is the testcase
else {

  var fork = require('child_process').fork;
  var ProgressTracker = require('progressTracker');
  var processWatch = require('processWatch');

  var checks = {
    master: false,
    workers: false
  };

  //Keep track of progress
  var progress = new ProgressTracker(function() {
    checks.workers = true;
  });
  progress.add('master');

  //List all workers
  var workers = [];

  //Spawn a cluster process
  var master = fork(process.argv[1], ['cluster'], {silent: true});

  //relay output using only stdout
  master.stdout.on('data', function (data) {
    data.toString().split('\n').forEach(function (text) {
      console.log('stdout: ' + text);
    });
  });

  master.stderr.on('data', function (data) {
    data.toString().split('\n').forEach(function (text) {
      console.log('stderr: ' + text);
    });
  });

  //Handle messages from the cluster
  master.on('message', function (data) {

    //Add worker pid to list and progress tracker
    if (data.cmd === 'worker') {
      progress.add('worker:' + data.workerPID);
      workers.push(data.workerPID);
    }
  });

  //When cluster is dead
  master.on('exit', function(code) {

    //Check that the cluster died accidently
    checks.master = (code === 1);

    //Inform progress tracker
    progress.set('master');

    //When master is dead all workers should be dead to
    var alive = false;
    workers.forEach(function(pid) {
      if (processWatch.alive(pid)) {
        alive = true;
      }
    });

    //If a worker was alive this did not act as expected
    checks.workers = !alive;
  });

  process.once('exit', function() {
    assert.ok(checks.master, 'The master did not die after when an error was throwed');
    assert.ok(checks.workers, 'The workers did not die after when an error was throwed in the master');
  });

}
