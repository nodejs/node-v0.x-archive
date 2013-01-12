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


var common = require('../common.js')
var Readable = require('_stream_readable');
var assert = require('assert');

// tiny node-tap lookalike.
var tests = [];
function test(name, fn) {
  tests.push([name, fn]);
}

function run() {
  var next = tests.shift();
  if (!next)
    return console.error('ok');

  var name = next[0];
  var fn = next[1];
  console.log('# %s', name);
  fn({
    same: assert.deepEqual,
    equal: assert.equal,
    end: run
  });
}

process.nextTick(run);

function toArray(callback) {
  var stream = new Readable();
  var list = [];
  stream.write = function (chunk) {
    list.push(chunk);
  };

  stream.end = function () {
    callback(list);
  };

  return stream;
}

function noop() {}

test('can read objects from stream', function (t) {
  var r = new Readable();
  r.push({ one: "1" });
  r.push({ two: "2" });
  r._read = noop

  r.pipe(toArray(function (list) {
    assert.deepEqual(list, [
      { one: "1" },
      { two: "2" }
    ]);
  }));

  t.end();
});
