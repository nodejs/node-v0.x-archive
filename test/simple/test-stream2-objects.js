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
var count = 0;

function test(name, fn) {
  count++;
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
    end: function () {
      count--;
      run();
    }
  });
}

// ensure all tests have run
process.on("exit", function () {
  assert.equal(count, 0);
});

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

function fromArray(list) {
  var r = new Readable();
  list.forEach(function (chunk) {
    r.push(chunk);
  });
  r.push(null);
  r._read = noop;

  return r
}

function noop() {}

test('can read objects from stream', function (t) {
  var r = fromArray([{ one: "1"}, { two: "2" }]);

  var v1 = r.read();
  var v2 = r.read();
  var v3 = r.read();

  assert.deepEqual(v1, { one: "1" });
  assert.deepEqual(v2, { two: "2" });
  assert.deepEqual(v3, null);

  t.end();
})

test('can pipe objects into stream', function (t) {
  var r = fromArray([{ one: "1"}, { two: "2" }]);

  r.pipe(toArray(function (list) {
    assert.deepEqual(list, [
      { one: "1" },
      { two: "2" }
    ]);

    t.end();
  }));
});

test('read(n) is ignored', function (t) {
  var r = fromArray([{ one: "1"}, { two: "2" }]);

  var value = r.read(2);

  assert.deepEqual(value, { one: "1" });

  t.end();
});

test('can read objects from _read (sync)', function (t) {
  var r = new Readable();
  var list = [{ one: "1"}, { two: "2" }];
  r._read = function (n, cb) {
    var item = list.shift()
    cb(null, item || null)
  };

  r.pipe(toArray(function (list) {
    assert.deepEqual(list, [
      { one: "1" },
      { two: "2" }
    ]);

    t.end();
  }));
});

test('can read objects from _read (async)', function (t) {
  var r = new Readable();
  var list = [{ one: "1"}, { two: "2" }];
  r._read = function (n, cb) {
    var item = list.shift()
    process.nextTick(function () {
      cb(null, item || null)
    });
  };

  r.pipe(toArray(function (list) {
    assert.deepEqual(list, [
      { one: "1" },
      { two: "2" }
    ]);

    t.end();
  }));
});

test('can read strings as objects', function (t) {
  var r = new Readable({
    isObjectStream: true
  });
  var list = ["one", "two", "three"];
  list.forEach(function (str) {
    r.push(str);
  });
  r.push(null);

  r.pipe(toArray(function (array) {
    assert.deepEqual(array, list)

    t.end();
  }));
});
