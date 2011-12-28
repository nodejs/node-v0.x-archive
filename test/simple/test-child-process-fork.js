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

var assert = require('assert');
var common = require('../common');
var fork = require('child_process').fork;
var args = ['foo', 'bar'];

var child = fork(common.fixturesDir + '/child-process-spawn-node.js', args);
assert.deepEqual(args, ['foo', 'bar']);

var disconnectEmit = false;
child.on('disconnect', function () {
  disconnectEmit = true;
  assert.throws(function() { child.send('foo'); }, Error);
});

var messageCount = 0;
child.on('message', function(m) {
  console.log('PARENT got message:', m);
  assert.ok(m.foo);
  messageCount++;
  child.disconnect();
});

// https://github.com/joyent/node/issues/2355 - JSON.stringify(undefined)
// returns "undefined" but JSON.parse() cannot parse that...
assert.throws(function() { child.send(undefined); }, TypeError);
assert.throws(function() { child.send(); }, TypeError);

child.send({ hello: 'world' });

var childExitCode = -1;
child.on('exit', function(c) {
  childExitCode = c;
});

process.on('exit', function() {
  assert.equal(messageCount, 1);
  assert.equal(childExitCode, 0);
  assert.ok(disconnectEmit);
});
