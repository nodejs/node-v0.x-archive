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

function forEach(obj, fn) {
  Object.keys(obj).forEach(function (name, index) {
    fn(obj[name], name, index);
  });
}

if (cluster.isWorker) {
  //Create a tcp server
  // this will be used as cluster-shared-server
  //and as an alternativ IPC channel
  var server = net.Server();
  server.on('connection', function (socket) {
    
    //Tell master using TCP socket that a message is received
    cluster.worker.on('message', function (message) {
      socket.write(JSON.stringify({
        code: 'received message',
        echo: message
      }));
    });
    
    //When getting TCP data from master, send it back using IPC
    socket.on('data', function (data) {

      cluster.worker.send("message from worker", function () {
        //When master echo a callback, notify master using TCP socket
        socket.write(JSON.stringify({
          code: 'received callback'
        }));
      });
      
    });
  });
  
  server.listen(common.PORT, "127.0.0.1");
}

else if (cluster.isMaster) {
    
  var checks = {
    master: {
      "receive": false,
      "correct": false,
      "callback": false
    },
    worker: {
      "receive": false,
      "correct": false,
      "callback": false
    }
  };
  
  //Spawn worker and connect to TCP when worker is lisining
  var worker = cluster.fork();
  
  //When a IPC message is resicved form the worker
  worker.on('message', function (messsage) {
    checks.master.receive = true;
    checks.master.correct = (messsage === "message from worker");
  });
  
  //When a TCP connection is made with the worker¨
  worker.on('listening', function () {
    var client;
    
    client = net.connect(common.PORT, function() {
      
      //Send message to worker, and check for callback
      worker.send("message from master", function() {
        checks.master.callback = true;
      });
      
      //Request that the worker send a messae to the master using TCP
      client.write("worker please send message to master");
    });
    
    client.on('data', function(data) {
      //All data is JSON
      data = JSON.parse(data.toString());
      
      switch(data.code) {
        case 'received message':
          checks.worker.receive = true;
          checks.worker.correct = (data.echo === "message from master");
          break;
        case 'received callback':
          checks.worker.callback = true;
          client.end();
          break;
        default:
          throw new Error("worng TCP message recived: " + data);
      }
    });
    
    //When the connection ends kill worker and shutdown process
    client.on('end', function() {
      worker.kill();
    });
    
    worker.on('exit', function () {
      process.exit(0);
    });
  
  });
  
  process.once('exit', function () {  
    forEach(checks, function (check, type) {
      assert.ok(check.receive, "The " + type + " did not receive any message");
      assert.ok(check.correct, "The " + type + " did not get the correct message");
      assert.ok(check.callback, "The " + type + " did not get any callback after sending");
    });
  });
}
