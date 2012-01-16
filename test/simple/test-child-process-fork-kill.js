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

if (process.argv[2] === 'child') {
  // keep process from self terminating
  setInterval(function() {}, 200);

  if (process.argv[3] === 'signal') {
    process.on('SIGTERM', function() {
      process.send('got it');
    });
  } else if (process.argv[3] === 'kill') {
    // SIGINT and SIGTERM
  } else if (process.argv[3] === 'exit') {
    process.exit(1);
  }

  process.send('ready');

} else if (process.argv[2] === 'testcase') {

  // testcase
  var check = 0;
  var fork = require('child_process').fork;

  var child1 = fork(process.argv[1], ['child', 'exit']);

  child1.on('exit', function(code, signal) {
    assert.equal(code, 1);
    assert.equal(signal, null);
    check++;
  });

  var child2 = fork(process.argv[1], ['child', 'kill']);

  child2.on('exit', function(code, signal) {
    assert.equal(code, null);
    assert.equal(signal, 'SIGTERM');
    check++;
  });
  child2.kill();

  var fork = require('child_process').fork;
  var child3 = fork(process.argv[1], ['child', 'signal']);

  child3.on('exit', function(code, signal) {
    assert.equal(code, null);
    assert.equal(signal, 'SIGINT');
    check++;
  });

  var message = '';
  child3.on('message', function (msg) {
    message = msg;
    if (msg === 'ready') {
      child3.kill('SIGTERM');
    } else if (msg === 'got it') {
      // this won't be prevented since no event listener exist
      child3.kill('SIGINT');
    }
  });

  process.on('exit', function () {
    assert.equal(check, 3);
    assert.equal(message, 'got it');
    process.stdout.write('exit\n');
  });

} else {
  // we need this to check that process.on('exit') fires

  var spawn = require('child_process').spawn;
  var child = spawn(process.execPath, [process.argv[1], 'testcase']);

  // pipe stderr and stdin
  child.stderr.pipe(process.stderr);
  process.stdin.pipe(child.stdin);

  var missing = true;
  child.stdout.on('data', function(chunk) {
    if (missing) {
        missing = chunk.toString() !== 'exit\n';
    }
    process.stdout.write(chunk);
  });

  child.on('exit', function(code) {
    process.exit(code);
  });

  process.on('exit', function() {
    assert.equal(missing, false);
  });
}
