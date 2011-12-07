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
var net = require('net');

if (cluster.isWorker) {
  
  var time = Date.now();
  
  //Just keep the worker alive
  var server = net.createServer(function(socket) {
    socket.end(JSON.stringify({
      "time": time,
      "env": process.env['custom_env']
    }));
  });
  server.listen(common.PORT, '127.0.0.1');
}

else if (cluster.isMaster) {

  var checks = {
    callback: false,
    timeChanged: false,
    envMatch: false
  };

  //Fork a new worker with a custom env 
  var worker = cluster.fork({
    'custom_env': 'value'
  });
  
  //Get startup time from worker
  var connect = function (callback) {
    var result;
    var socket = net.connect(common.PORT, '127.0.0.1', function () {
      socket.on('data', function (data) {
        result = JSON.parse(data);
      });
      socket.on('end', function () {
        callback(result);
      });
    });
  };

  worker.on('listening', function () {
    
    //Connect to worker to get time
    connect(function (oldData) {
      
      //restart worker
      worker.restart(function () {
        checks.callback = true;
        
        //Connect again to new worker
        connect(function (newData) {
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
      });
    });
  });

  //Check all values
  process.once('exit', function() {
    assert.ok(checks.callback, 'The callback from restart was not called');
    assert.ok(checks.timeChanged, 'The worker did not appeare to restart');
    assert.ok(checks.envMatch, 'The env was not reused when the worker restarted');
  });

}
