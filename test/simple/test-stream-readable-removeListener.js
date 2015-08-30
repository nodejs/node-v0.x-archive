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
var EE = require('events').EventEmitter;
var Readable = require('stream').Readable;

var buf = new Buffer(65536);
buf.fill(0);

var packetsToPush = 10;
var toUnshift = 16*1024;

Readable.prototype._read = function() {
  var chunk = --packetsToPush > 0 ? buf.slice() : null;
  setImmediate(this.push.bind(this, chunk));
}

var rStream = new Readable();

var first = true;
rStream.on('readable', function onReadable() {
  var data = rStream.read();
  if (first) {
    first = false;
    rStream.removeListener('readable', onReadable);
    assert.equal(EE.listenerCount(rStream, 'readable'), 0);
    rStream.unshift(buf.slice(0, toUnshift));
    rStream.on('readable', onReadable);
  }
});

process.on('exit', function() {
  assert.equal(packetsToPush, 0);
});

rStream.read(0);