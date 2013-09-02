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
var util = require('util');

var repl = require('repl');

// A stream to push an array into a REPL
function ArrayStream() {
  this.run = function(data) {
    var self = this;
    data.forEach(function(line) {
      self.emit('data', line);
    });
  }
}
util.inherits(ArrayStream, require('stream').Stream);
ArrayStream.prototype.readable = true;
ArrayStream.prototype.writable = true;
ArrayStream.prototype.resume = function() {};
ArrayStream.prototype.write = function(data) {
  this.data += data;
};
ArrayStream.prototype.data = '';

var putIn = new ArrayStream();
var testMe = repl.start('', putIn);

// a command to test
testMe.defineCommand('test', {
  help: 'Just Something to test',
  action: function(arg) {
    arg = arg || '';
    this.outputStream.write('Test called with:' + arg + '\n');
    this.displayPrompt();
  }
});

// sending a command should work
putIn.run(['.test']);
assert.equal(putIn.data, 'Test called with:\n');

// reset condition
putIn.data = '';

// sending an argument to a REPL command should work
putIn.run(['.test me']);
assert.equal(putIn.data, 'Test called with:me\n');

// reset condition
putIn.data = '';

// break is a reserved word, so sending it witout
// a '.' should not execute the command but make
// the REPL await another line
putIn.run(['swtich(\'asdf\''
          , 'case \'asdf\':'
          , 'console.log(\'work\''
          , 'break'
          , '}']);
assert.equal(putIn.data, '... ... ..... ..... ... ');

// reset condition
putIn.data = '';

// on the other hand .break _is_ a REPL command,
// so sending '.break' should execute the command 
putIn.run(['swtich(\'asdf\''
          , 'case \'asdf\':'
          , 'console.log(\'work\''
          , '.break']);
assert.equal(putIn.data, '..... ..... ....... ');

// reset condition
putIn.data = '';

// sending a command witout a '.'
putIn.run(['test']);
assert.equal(putIn.data, 'Test called with:\n');

// reset condition
putIn.data = '';

// sending an argument to a REPL command should work
// even if we remove the '.'
putIn.run(['test me']);
assert.equal(putIn.data, 'Test called with:me\n');

// reset condition
putIn.data = '';

// If a variable has the same name as a REPL
// command, the REPL should prefer the
// variable to the command
putIn.run(['test = 5', 'test']);
assert.equal(putIn.data, '5\n5\n');

// reset condition
putIn.data = '';

// If I now clear the variable
// the command should be revealed.
// This test must follow the above test
putIn.run(['clear', 'test']);
assert.equal(putIn.data, 'Clearing context...\nTest called with:\n');

// reset condition
putIn.data = '';

// The REPL should still return a
// ReferanceError for something that
// is not a variable nor a REPL command
putIn.run(['noone']);
// To avoid haveing to fix this test every time
// a file in the stack trace changes, I split on \n
// and look at the first line only
var tmp = putIn.data.split('\n');
assert.equal(tmp[0], 'ReferenceError: noone is not defined');

