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
      self.emit('data', line + '\n');
    });
  }
}
util.inherits(ArrayStream, require('stream').Stream);
ArrayStream.prototype.readable = true;
ArrayStream.prototype.writable = true;
ArrayStream.prototype.resume = function() {};
ArrayStream.prototype.write = function() {};

var array_elements = [
  [ 'asdf.__defineGetter__', 'asdf.__defineSetter__',
    'asdf.__lookupGetter__', 'asdf.__lookupSetter__',
    'asdf.__proto__', 'asdf.constructor',
    'asdf.hasOwnProperty', 'asdf.isPrototypeOf',
    'asdf.propertyIsEnumerable',
    'asdf.toLocaleString', 'asdf.toString',
    'asdf.valueOf', '', 'asdf.concat', 'asdf.constructor',
    'asdf.every', 'asdf.filter',
    'asdf.forEach', 'asdf.indexOf',
    'asdf.join', 'asdf.lastIndexOf',
    'asdf.length', 'asdf.map',
    'asdf.pop', 'asdf.push', 'asdf.reduce',
    'asdf.reduceRight', 'asdf.reverse', 'asdf.shift',
    'asdf.slice', 'asdf.some', 'asdf.sort', 'asdf.splice',
    'asdf.toLocaleString', 'asdf.toString', 'asdf.unshift',
    '', 'asdf.length' ],
  'asdf.' ];

var object_elements = [
  [ 'asdf.__defineGetter__', 'asdf.__defineSetter__',
    'asdf.__lookupGetter__', 'asdf.__lookupSetter__',
    'asdf.__proto__', 'asdf.constructor',
    'asdf.hasOwnProperty', 'asdf.isPrototypeOf',
    'asdf.propertyIsEnumerable',
    'asdf.toLocaleString', 'asdf.toString',
    'asdf.valueOf', '', 'asdf.1'],
  'asdf.' ];

var putIn = new ArrayStream();
var testMe = repl.start('', putIn);

// Tab Complete will not return integer indexes
putIn.run(['.clear']);
putIn.run([
  'asdf = [\'one\', 2, 3]',
]);
testMe.complete('asdf.', function(error, data) {
    assert.deepEqual(data, array_elements);
});

// Tab Complete will return additional non-integer indexes
putIn.run(['.clear']);
putIn.run([
  'asdf = [\'one\', 2, 3]',
  'asdf.qwer = 1'
]);

var array_with_extra = array_elements;
array_with_extra[0].push('qwer');

testMe.complete('asdf.', function(error, data) {
  assert.deepEqual(data, array_with_extra);
});

// Tab Complete will return integer indexes on an object
putIn.run(['.clear']);
putIn.run([
  'asdf = {}',
  'asdf[1] = 1'
]);
testMe.complete('asdf.', function(error, data) {
  assert.deepEqual(data, object_elements);
});

