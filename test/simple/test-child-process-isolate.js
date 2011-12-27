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
var fork = require('child_process').fork;
var net = require('net');

var isParent = process.argv[2] === 'parent';
var isChild = process.argv[2] === 'child';

//This will keep the child process alive
//and works as a kill+respond method
if (isChild) {
  var server = net.createServer(function() {
    process.exit(0);
  });
  server.on('listening', function () {
    process.send('online');
  });
  server.listen(common.PORT, 'localhost');
}

//This is the parant there will spawn a child and then die
//The result is that the child is pulled in the background
else if (isParent) {
  var child = fork(process.argv[1], ['child']);

  //Send pids
  process.send({ cmd: 'pid', data: child.pid });

  //Inform testcase that the child is online
  child.once('message', function() {
    process.send({ cmd: 'online' });
  });

  //Inform testcase that isolate has emitted
  child.once('isolate', function() {
    process.send({ cmd: 'isolate emit' });
  });

  //When asked to die isolate child
  process.once('message', function() {
    child.isolate();
  });
}

//Testcase: will spawn parant and check if child still is alive
else {

  var alive = function(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch (e) {
      return false;
    }
  };

  //Create parrent
  var parent = fork(process.argv[1], ['parent']);

  //Get pids
  var childPid;
  var isolateEmit = false;
  parent.on('message', function messageHandler(msg) {
    if (msg.cmd === 'pid') {
      childPid = msg.data;

    } else if (msg.cmd === 'online') {
      //Ask parrent to die
      parent.send('do isolate');

    } else if (msg.cmd === 'isolate emit') {
      isolateEmit = true;

      //Dissconnect IPC connection so the parent can die graceful
      parent.disconnect();
    }
  });

  //Check that the parent process die but not its child
  var parentDie = false;
  var childAlive = false;
  parent.once('exit', function(code) {
    assert.equal(code, 0);
    parentDie = true;

    //Check that the child is stil alive
    childAlive = alive(childPid);
    quitChild();
  });

  //When the parent is dead this function will kill its child (cleanup)
  var quitChild = function() {
    var socket = net.createConnection(common.PORT);
    //Keep the testcase alive until the child die
    socket.on('close', function () {});
  };

  process.on('exit', function() {
    assert.ok(parentDie, 'the parent never died');
    assert.ok(childAlive, 'the child died with the parent');
    assert.ok(isolateEmit, 'the isolate event did not emit');
  });
}
