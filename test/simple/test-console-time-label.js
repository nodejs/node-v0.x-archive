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

var stdout_write = global.process.stdout.write;
var strings = [];
global.process.stdout.write = function(string) {
  strings.push(string);
};

console.time('label');
console.timeEnd('label');

console.time('label %s');
console.timeEnd('label %s', 'hello');

console.time('label %s %s');
console.timeEnd('label %s %s', 'hello', 'world');

global.process.stdout.write = stdout_write;
assert(/^label: [0-9]+ms\n/.test(strings.shift()), 'simple timeEnd');
assert(/^label hello: [0-9]+ms\n/.test(strings.shift()), 'timeEnd with one extra arg');
assert(/^label hello world: [0-9]+ms\n/.test(strings.shift()), 'timeEnd with more then one extra arg');

assert.throws(function () {
  console.timeEnd('no such label');
});

assert.doesNotThrow(function () {
  console.time('valid label');
  console.timeEnd('valid label');
});
