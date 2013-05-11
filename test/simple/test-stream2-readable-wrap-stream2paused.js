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

var Readable = require('_stream_readable');
var Writable = require('_stream_writable');

var Old = function () {
  Readable.call(this);
};
util.inherits(Old, Readable);

Old.prototype._read = function (size) {

    this.push('xxxxxxxxxx');
    this.push(null);
};

var old = new Old();

var oldEnded = false;
old.on('end', function () {
    oldEnded = true;
});

old.pause();

var r = new Readable();
assert.equal(r, r.wrap(old));
old.resume();

var ended = false;
r.on('end', function() {
  ended = true;
});


var w = new Writable();
var written = [];
w._write = function(chunk, encoding, cb) {
  written.push(chunk.toString());
  setTimeout(cb);
};

var finished = false;
w.on('finish', function() {
  finished = true;
});


r.pipe(w);


process.on('exit', function() {
  assert(ended);
  assert(finished);
  assert(oldEnded);
  assert.equal(written, 'xxxxxxxxxx');
  console.log('ok');
});
