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

// Child process will echo back all messages
// and exit when all messages is received
if (process.argv[2] === 'child') {

  var messages = 0;
  process.on('message', function(message, namespace) {
    messages += 1;
    process.send(message, namespace);

    if (messages === 3) process.exit(0);
  });

  process.on('internalMessage', function(message, namespace) {
    messages += 1;
    process.send(message, namespace, null, true);

    if (messages === 3) process.exit(0);
  });

} else {
  var fork = require('child_process').fork;

  var child = fork(process.argv[1], ['child']);

  // Make sure the child died correctly
  var exitCode = -1;
  child.on('exit', function (code) {
    exitCode = code;
  });

  // Check external and internal messages
  var messages = 0;
  child.on('message', function (message, namespace) {
    messages += 1;
    if (message === 'normal message') {
      assert.equal(namespace, undefined);
    } else if (message === 'namespaced message') {
      assert.equal(namespace, 'test1');
    }
  });

  child.on('internalMessage', function (message, namespace) {
    messages += 1;
    if (message === 'internal message') {
      assert.equal(namespace, 'test2');
    }
  });

  // send messages
  child.send('normal message');
  child.send('namespaced message', 'test1');
  child.send('internal message', 'test2', null, true);

  process.on('exit', function () {
    assert.equal(exitCode, 0);
    assert.equal(messages, 3);
  });

}