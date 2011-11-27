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
var os = require("os");

function forEach(obj, fn) {
  Object.keys(obj).forEach(function (name, index) {
    fn(obj[name], name, index);
  });
}

if (cluster.isWorker) {
  var http = require('http');
  http.Server(function () {

  }).listen(common.PORT, "127.0.0.1");
}

else if (cluster.isMaster) {
  
  var workers = 0;
  var cpus = os.cpus().length;

  cluster.on('online', function onlineEvent (worker) {
    workers += 1;
    if (workers === cpus) {
      cluster.removeListener('online', onlineEvent);
      checkValues(worker);
    }
  });
  
  var checkProperty = function (obj, objName, propName) {
    var desc = Object.getOwnPropertyDescriptor(obj, propName);
    
    assert.equal(desc.enumerable, true, "The " + objName + "." + propName + " is not enumerable");
    assert.equal(desc.configurable, false, "The " + objName + "." + propName + " is configurable");
    
    //If the property is a value (not a getter)
    if (desc.get === undefined) {
      assert.equal(desc.writable, false, "The " + objName + "." + propName + " is writable");
    }
  };
  
  
  var checkValues = function (worker) {
  
    //Check cluster properties
    checkProperty(cluster, "cluster", "isMaster");
    checkProperty(cluster, "cluster", "isWorker");
    checkProperty(cluster, "cluster", "onlineWorkers");
    
    //Check worker properties
    checkProperty(worker, "worker", "startup");
    checkProperty(worker, "worker", "workerID");
    checkProperty(worker, "worker", "uniqueID");
    
    checkConficts();    
  };
  
  var checkConficts = function () {
    
    //check cluster.fork conflict
    assert.throws(cluster.fork, Error, "The cluster.fork should throw an error after using cluster.autoFork");
    
    //Kill all workers
    cluster.destroy(function () {
      process.exit(0);
    });
  };
  
  cluster.autoFork();  
}
