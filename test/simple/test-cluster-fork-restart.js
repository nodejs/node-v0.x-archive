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

  //Just keep the worker alive
  var http = require('http');
  http.Server(function() {

  }).listen(common.PORT, '127.0.0.1');
}

else if (cluster.isMaster) {

  var checks = {
    workersMatch: false,
    callback: false,
    wasRestarted: false
  };
  
  //Start workers by fork
  cluster.fork();
  cluster.fork();
  
  //When all workers are listening
  cluster.on('listening', function listeningEvent () {
    if (cluster.onlineWorkers === 2) {
      cluster.removeListener('listening', listeningEvent);
        
      cluster.restart(function () {
        checks.callback = true;
        checks.workersMatch = (cluster.onlineWorkers === 2);
          
        //The index in cluster.workers are unique ID
        //if a 3th index exist, a the worker did restart
        checks.wasRestarted = cluster.workers[3] !== undefined;

        process.exit(0);
      });
        
    }
  });

  //Check all values
  process.once('exit', function() {
    assert.ok(checks.callback, 'The callback from restart was not called');
    assert.ok(checks.workersMatch, 'Not all workers was restarted when the callback was called');
    assert.ok(checks.wasRestarted, 'The worker did not restart');
});
 
}
