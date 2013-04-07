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

var common = require('../common.js');
var W = require('_stream_writable');
var D = require('_stream_duplex');
var assert = require('assert');

var util = require('util');
util.inherits(TestWriter, W);

function TestWriter() {
  W.call(this, { coalesce: 2, decodeStrings: false });
  this.result = [];
};

TestWriter.prototype._write = function(chunk, encoding, cb) {
  writeCalled++;
  this.result.push(new Buffer(chunk, encoding));
  setTimeout(cb, 3);
};

TestWriter.prototype._writev = function(chunks, len, cb) {
  writevCalled++;
  assert.ok(Array.isArray(chunks));
  assert.ok(chunks.length <= 2);
  assert.ok(chunks.every(function(chunk) {
    return Buffer.isBuffer(chunk);
  }));
  this.result = this.result.concat(chunks);
  setTimeout(cb, 3);
};

var finishCalled = false;
var writeCalled = 0;
var writevCalled = 0;
var t = new TestWriter();

[ 'hello', 'world', '!', '!' ].forEach(function(chunk) {
  t.write(new Buffer(chunk));
});
t.write('opa');
[ 'hello', 'world', '!', '!' ].forEach(function(chunk) {
  t.write(new Buffer(chunk));
});

t.once('finish', function() {
  finishCalled = true;
});
t.end();

process.once('exit', function() {
  assert.ok(finishCalled);
  assert.equal(writeCalled, 1);
  assert.equal(writevCalled, 4);
  assert.equal(t.result.length, 9);
  assert.equal(t.result.join(' '), 'hello world ! ! opa hello world ! !');
});
