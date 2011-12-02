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
var spawn = require('child_process').spawn;
var os = require('os');
var ProgressTracker = require('progressTracker');
var processWatch = require('processWatch');

function forEach(obj, fn) {
  Object.keys(obj).forEach(function (name, index) {
    fn(obj[name], name, index);
  });
}

// Cluster setup
if (cluster.isWorker) {
  var http = require('http');
  http.Server(function () {

  }).listen(common.PORT, "127.0.0.1");
}

else if (process.argv[2] === 'cluster' && cluster.isMaster) {
  
  var cpus = os.cpus().length;
  
  cluster.on('online', function lisenter(worker) {
    process.stdout.write("=" + worker.process.pid);
    if (cluster.onlineWorkers === cpus) {
      cluster.removeListener('online', lisenter);
      process.stdout.write('=ready');
    }
  });
  
  //Startup a basic cluster
  cluster.autoFork();
}

//testcase
else {
  
  var checks = {
    "SIGINT": {
      master: false,
      workers: false
    },
    "SIGTERM": {
      master: false,
      workers: false
    },
    "SIGQUIT": {
      master: false,
      workers: false
    }
  };
  
  var signals = Object.keys(checks);
  
  var testCluster = function (index) {
    
    //When no more singnals can be tested
    if (index === signals.length) {
      process.exit(0);
      return;
    }
    
    //get signal
    var signalCode = signals[index];
    
    //Keep track of progress
    var progress = new ProgressTracker(function () {
      checks[signalCode].workers = true;
      testCluster(index + 1);
    });
    progress.add('master');
    
    //List all workers
    var workers = [];
    
    //Spawn a independtent cluster process
    var master = spawn(process.argv[0], [process.argv[1], 'cluster']);
    
    //Handle messages from the cluster
    master.stdout.on('data', function (data) {
      data = data.toString();
      
      //If this was not a testcode message
      if (!data.match('=')) {
        console.log('stdout: ' + data);
      }
      
      else {
        //Sometimes there are sended more that one message in a buffer
        var codes = data.split('=').filter(function (value) {
          return value !== '';
        });
        
        codes.forEach(function (code) {
          //Parse code
          code = isNaN(code) ? code : parseInt(code, 10);
          
          //is a Number = worker pid
          if (typeof code === 'number') {
            progress.add(code);
            workers.push(code);
          }
          else if (code === 'ready') {
            process.kill(master.pid, signalCode);
          }
        });
      }
    });
    
    //If any error is recived relay and throw
    master.stderr.on('data', function (data) {
      console.error("cluster error:" + data);
    });
    
    //When cluster is dead the the next worker
    master.on('exit', function (code) {
      checks[signalCode].master = (code === 0);
      progress.set('master');
      
      //watch all workers
      workers.forEach(function (pid) {
        processWatch.watch(pid, function (exist) {
          if (!exist) {
            progress.set(pid);
          }
        });
      });
    });
    
  };
  
  //test the first signal
  testCluster(0);
  
  process.once('exit', function () {
    forEach(checks, function (value, signalName) {
      assert.ok(value.master, "The master did not die after sending the " + signalName + " signal");
      assert.ok(value.workers, "The workers did not die after sending the " + signalName + " signal to there master");
    });
  });
  
}