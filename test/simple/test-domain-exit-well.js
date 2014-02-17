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

// Simple tests of most basic domain functionality.

var common = require('../common');
var assert = require('assert');
var domain = require('domain');
var dns = require('dns');
var fs = require('fs');

var queue = [];
var expected = 0;
var received = 0;

function runner() {
  if (queue.length > 0)
    queue.shift()();
}
setImmediate(runner);

process.on('uncaughtException', function(er) {
  received++;
  setImmediate(runner);
});

process.on('exit', function() {
  process.removeAllListeners('uncaughtException');
  assert.equal(expected, received);
  console.log('ok');
});

var d = domain.createDomain();
d.on('error', function (err) {
  process.removeAllListeners('uncaughtException');
  throw new Error('Entered domain error handler');
});

// Queue up tests.

queue.push(function() {
  d.enter();
  process.nextTick(function () {
    d.exit();
    throw new Error('process.nextTick');
  });
});
expected++;

queue.push(function() {
  d.enter();
  setImmediate(function () {
    d.exit();
    throw new Error('setImmediate');
  });
});
expected++;

queue.push(function() {
  d.enter();
  setTimeout(function () {
    d.exit();
    throw new Error('setTimeout');
  }, 10);
});
expected++;

queue.push(function() {
  d.enter();
  dns.lookup('localhost', function() {
    d.exit();
    throw new Error('dns.lookup');
  });
});
expected++;

queue.push(function() {
  d.enter();
  fs.stat(__filename, function() {
    d.exit();
    throw new Error('fs.stat');
  });
});
expected++;
