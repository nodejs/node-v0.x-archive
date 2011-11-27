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

function forEach(obj, fn) {
  Object.keys(obj).forEach(function (name, index) {
    fn(obj[name], name, index);
  });
}

if (cluster.isWorker) {
  missingFunction();
}

else if (cluster.isMaster) {
  
  var checks = {
    emit : false,
    noWorkers: false
  };
  
  cluster.setupMaster({
    silent: true
  });
  
  cluster.on('citicalError', function () {
    
    //It emitted
    checks.emit = true;
    
    //There should be no online workers
    checks.noWorkers = (cluster.onlineWorkers === 0);
    
    process.exit(0);
  });
  
  cluster.autoFork();
  
  //Make sure that the master dies after 10 sec
  setTimeout(function () {
    process.exit(1);
  }, 10000);
  
  //Check all values
  process.once('exit', function () {

    assert.ok(checks.emit, "The criticalError event did not emit");
    assert.ok(checks.noWorkers, "When the criticalError event emitted there was still workers online");    
  });

}