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

if (cluster.isWorker) {

  // Just keep the worker alive
  process.send(process.argv[2]);

} else if (cluster.isMaster) {

  var checks = {
    globalMasterArgs    : false,
    localMasterArgs     : false,
    globalMasterWorkers : 0,
    localMasterWorkers  : 0
  };

  cluster.setupMaster({
    'args' : ['custom argument']
  });

  var localMaster = new cluster.Master();

  localMaster.setupMaster({
    'args' : ['local custom argument']
  });

  cluster.on('online', function lisenter(worker) {
    checks.globalMasterWorkers++;

    worker.once('message', function(data) {
      checks.globalMasterArgs = (data === 'custom argument');
      worker.destroy();
    });
  });

  localMaster.on('online', function lisenter(worker) {
    checks.localMasterWorkers++;

    worker.once('message', function(data) {
      checks.localMasterArgs = (data === 'local custom argument');
      worker.destroy();
    });
  });

  // Start workers
  cluster.fork();
  localMaster.fork();

  // Check all values
  process.once('exit', function() {
    assert.ok(checks.globalMasterWorkers === 1, 'Wrong number of workers for global master');
    assert.ok(checks.localMasterWorkers === 1, 'Wrong number of workers for local master');
    assert.ok(checks.globalMasterArgs, 'Worker for global master did not receive custom args');
    assert.ok(checks.localMasterArgs, 'Worker for local master did not receive custom args');
  });

}

