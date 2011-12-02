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
  var http = require('http');
  http.Server(function () {

  }).listen(common.PORT, "127.0.0.1");
}

else if (cluster.isMaster) {

  var checks = {
    callback: false,
    noWorkers: false
  };
  
  var cpus = os.cpus().length;
  
  cluster.on('listening', function () {
    if (cluster.onlineWorkers === cpus) {
      
      cluster.destroy(function () {
        checks.callback = true;
        checks.noWorkers = (cluster.onlineWorkers === 0);
        process.exit(0);
      });
    }
  });
  
  cluster.autoFork();
  
  //Check all values
  process.once('exit', function () {
    assert.ok(checks.callback, 'The callback was never called');
    assert.ok(checks.noWorkers, 'Not all workers was killed when the callback was called');
  });

}