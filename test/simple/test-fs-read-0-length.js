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

var fs = require('fs');
var fsBinding = process.binding('fs');
fsBinding.read = assert.fail;

var buf = new Buffer(1);
var cb = common.mustCall(function(er, bytes, buffer) {
  assert.ifError(er);
  assert.equal(bytes, 0);
  assert.equal(buffer, buf);
});

var fd = fs.openSync(__filename, 'r');
fs.read(fd, buf, 0, 0, 0, cb)
var ret = fs.readSync(fd, buf, 0, 0, 0);
assert(Array.isArray(ret));
assert.equal(ret[0], '');
assert.equal(ret[1], 0);

process.on('exit', function() {
  console.log('ok');
});
