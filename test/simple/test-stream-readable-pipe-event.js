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

var stream = require('stream');

var reader = new stream.Readable();
reader._read = function() {}

var writer = new stream.Writable();
writer._write = function() {}

reader.on('pipe', common.mustCall(function(dest) {
  assert.strictEqual(dest, writer);
}));

writer.on('pipe', common.mustCall(function(src) {
  assert.strictEqual(src, reader);
}));

var originalError = new Error('we have an error');

reader.on('unpipe', common.mustCall(function(dest, err) {
  assert.strictEqual(dest, writer);
  assert.strictEqual(err, originalError);
}));

writer.on('unpipe', common.mustCall(function(src, err) {
  assert.strictEqual(src, reader);
  assert.strictEqual(err, originalError);
}));

// listen here to avoid the EE throw on no listeners
writer.on('error', function(err) {
  assert.strictEqual(err, originalError);
});

reader.pipe(writer);
writer.emit('error', originalError);
