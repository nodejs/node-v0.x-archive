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
var ProgressTracker = require('progressTracker');
var processWatch = require('processWatch');

function forEach(obj, fn) {
  Object.keys(obj).forEach(function(name, index) {
    fn(obj[name], name, index);
  });
}

if (cluster.isWorker) {
  var http = require('http');
  http.Server(function() {

  }).listen(common.PORT, '127.0.0.1');
}

else if (cluster.isMaster) {

  var checks = {
    'SIGINT': {
      killed: false,
      emit: false,
      suicide: false,
      eventName: 'exit'
    },
    'SIGTERM': {
      killed: false,
      emit: false,
      suicide: false,
      eventName: 'exit'
    },
    'SIGQUIT': {
      killed: false,
      emit: false,
      suicide: false,
      eventName: 'disconnect'
    }
  };

  var progress = new ProgressTracker(function() {
    process.exit(0);
  });
  progress.add(checks);

  forEach(checks, function(check, signalCode) {

    var worker = cluster.fork();
    worker.on('listening', function() {

      //Check that it die
      processWatch.watch(worker.process.pid, function(exist) {
        if (!exist) {
          check.killed = true;
          process.nextTick(function() {
            progress.set(signalCode);
          });
        }
      });

      //Check that the event emits
      worker.on(check.eventName, function() {
        check.emit = true;
        check.suicide = worker.suicide;
      });

      //Send signalCode
      process.kill(worker.process.pid, signalCode);
    });
  });

  //Check all values
  process.once('exit', function() {

    forEach(checks, function(check, signalCode) {
      assert.ok(check.killed, 'The worker did not die after sending the ' + signalCode + ' signal');
      assert.ok(check.emit, 'The ' + check.eventName + ' event was never emitted after sending the ' + signalCode + ' signal');
      assert.ok(check.suicide, 'The worker was not set in suicide mode');
    });

  });

}
