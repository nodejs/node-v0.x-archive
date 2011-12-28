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

  var time = Date.now();

  //Send a end message back to master
  //containing env and startup time
  cluster.worker.on('message', function () {
    cluster.worker.send({
      "time": time,
      "env": process.env['custom_env']
    });
  });
}

else if (cluster.isMaster) {

  var checks = {
    callback: false,
    timeChanged: false,
    envMatch: false
  };

  //Fork a new worker with a custom env
  var oldWorker = cluster.fork({
    'custom_env': 'value'
  });

  //Get data from original worker
  oldWorker.on('listening', function () {
    oldWorker.on('message', function (oldData) {

      //restart worker
      oldWorker.restart(function (newWorker) {
        checks.callback = true;

        newWorker.on('message', function (newData) {
          //Did time change
          if (oldData.time !== newData.time) {
            checks.timeChanged = true;
          }

          //Do old and new env match
          if (oldData.env === newData.env) {
            checks.envMatch = true;
          }

          process.exit(0);

        });
        newWorker.send('ping');
      });

    });
    oldWorker.send('ping');
  });

  //Check all values
  process.once('exit', function() {
    assert.ok(checks.callback, 'The callback from restart was not called');
    assert.ok(checks.timeChanged, 'The worker did not appeare to restart');
    assert.ok(checks.envMatch, 'The env was not reused when the worker restarted');
  });

}
