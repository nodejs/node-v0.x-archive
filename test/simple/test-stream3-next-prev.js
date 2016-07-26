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
var assert = require('assert');
var stream = require('stream');

var fs = require('fs');
var path = require('path');

// utils
function makeReadable() {
  var r = new stream.Readable;

  r._read = function() {
    setTimeout(function() {
      if(!r._readableState.ended) {
        r.push('cool story');
      }
    });
  };

  r.end = function() {
    r.push(null);
  }

  return r;
}

function makeWritable() {
  var w = new stream.Writable;

  w._write = function(chunk, enc, cb) {
    this.bytesWritten = this.bytesWritten || 0;
    this.bytesWritten += chunk.length;
    setImmediate(cb);
  };

  return w;
}

function makeDuplex() {
  var d = new stream.PassThrough;

  d.end = function() {
    stream.PassThrough.prototype.end.apply(d, arguments);
    d.push(null);
  }

  return d;
}

function makeLegacy() {
  var s = new stream.Stream;
  
  s.bytesWritten = 0;
  s.write = function(chunk) {
    s.bytesWritten += chunk.length;
    setTimeout(function() {
      s.emit('data', chunk); 
    });
  };
  s.end = function() {
    s.emit('end');
  };

  return s;
}

// borrowing node-tap look-alike
var tests = [];
var count = 0;

function test(name, fn) {
  count++;
  tests.push([name, fn]);
}

function run() {
  var next = tests.shift();
  if (!next) {
    return console.error('ok');
  }

  var name = next[0];
  var fn = next[1];
  console.log('# %s', name);

  assert.end = function() {
    --count;
    run();
  };

  fn(assert);
}

// ensure all tests have run
process.on("exit", function () {
  assert.equal(count, 0);
});

process.nextTick(run);

test('next()/prev() returns immediate destinations & sources', function(assert) {
  var simpleTests = [
    [makeReadable, makeWritable],
    [makeDuplex, makeDuplex],
    [makeReadable, makeLegacy],
    [makeLegacy, makeWritable],
    [makeDuplex, makeLegacy],
    [makeLegacy, makeLegacy]
  ]

  simpleTests.forEach(function(testPair) {
    var A = testPair[0]();
    var B = testPair[1]();

    A.pipe(B);
    assert.deepEqual(A.next(), [B]);
    assert.deepEqual(B.prev(), [A]);
    A.end();
  });

  var complexForward = [
    [makeReadable, [makeWritable, makeDuplex, makeLegacy]],
    [makeDuplex, [makeWritable, makeDuplex, makeLegacy]],
    [makeLegacy, [makeWritable, makeDuplex, makeLegacy]],
  ];

  complexForward.forEach(function(testPair) {
    var A = testPair[0]();
    var B = testPair[1].map(function(xs) {
      return A.pipe(xs());
    });

    assert.deepEqual(A.next(), B);
    B.forEach(function(xs) {
      assert.deepEqual(xs.prev(), [A]);
    });
    A.end();
  });

  var complexBackward = [
    [[makeReadable, makeDuplex, makeLegacy], makeWritable],
    [[makeReadable, makeDuplex, makeLegacy], makeDuplex],
    [[makeReadable, makeDuplex, makeLegacy], makeLegacy],
  ];

  complexBackward.forEach(function(testPair) {
    var B = testPair[1]();
    var A = testPair[0].map(function(xs) {
      xs = xs();
      xs.pipe(B);
      return xs;
    });

    assert.deepEqual(B.prev(), A);
    A.forEach(function(xs) {
      assert.deepEqual(xs.next(), [B]);
    });
    A.forEach(function(xs) {
      xs.end();
    });
  });

  var longPipe = [
    [makeReadable, makeDuplex, makeWritable],
    [makeDuplex, makeDuplex, makeDuplex],
    [makeReadable, makeDuplex, makeDuplex],
    [makeDuplex, makeDuplex, makeWritable],
    [makeLegacy, makeDuplex, makeWritable],
    [makeReadable, makeDuplex, makeLegacy],
    [makeReadable, makeLegacy, makeLegacy],
    [makeLegacy, makeLegacy, makeWritable],
    [makeLegacy, makeLegacy, makeLegacy],
  ];

  longPipe.forEach(function(testTriple) {
    var A = testTriple[0]();
    var B = testTriple[1]();
    var C = testTriple[2]();

    A.pipe(B).pipe(C);

    assert.deepEqual(A.next(), [B]);
    assert.deepEqual(C.prev(), [B]);
    A.end();
  });

  assert.end();
});

test('nextAll()/prevAll() returns all destinations/sources of this stream', function(assert) {
  var longPipe = [
    [makeReadable, makeDuplex, makeWritable],
    [makeDuplex, makeDuplex, makeDuplex],
    [makeReadable, makeDuplex, makeDuplex],
    [makeDuplex, makeDuplex, makeWritable],
    [makeLegacy, makeDuplex, makeWritable],
    [makeReadable, makeDuplex, makeLegacy],
    [makeReadable, makeLegacy, makeLegacy],
    [makeLegacy, makeLegacy, makeWritable],
    [makeLegacy, makeLegacy, makeLegacy],
  ];

  longPipe.forEach(function(testTriple) {
    var A = testTriple[0]();
    var B = testTriple[1]();
    var C = testTriple[2]();

    A.pipe(B).pipe(C);

    assert.deepEqual(A.nextAll(), [B, C]);
    assert.deepEqual(C.prevAll(), [B, A]);
    A.end();
  });

  var manyToMany = [
    [[makeReadable, makeDuplex, makeLegacy], makeDuplex, [makeWritable, makeDuplex, makeLegacy]],
    [[makeReadable, makeDuplex, makeLegacy], makeLegacy, [makeWritable, makeDuplex, makeLegacy]],
  ];

  manyToMany.forEach(function(testTriple) {
    var B = testTriple[1]();
    var A = testTriple[0].map(function(xs) {
      xs = xs();
      xs.pipe(B);
      return xs;
    });
    var C = testTriple[2].map(function(xs) {
      return B.pipe(xs());
    });

    A.forEach(function(stream) {
      assert.deepEqual(stream.nextAll(), [B].concat(C));
    });

    assert.deepEqual(B.nextAll(), C);
    assert.deepEqual(B.prevAll(), A);

    C.forEach(function(stream) {
      assert.deepEqual(stream.prevAll(), [B].concat(A));
    });

    A.forEach(function(xs) {
      xs.end();
    });
  });

  assert.end();
});

test('nextAll()/prevAll() returns all streams with no duplicates', function(assert) {
  // A - B
  //       \
  //        D - E
  //       /
  // A - C
  //
  var A = makeReadable();
  var B = makeDuplex();
  var C = makeLegacy();
  var D = makeDuplex();
  var E = makeWritable();

  A.pipe(B).pipe(D).pipe(E);
  A.pipe(C).pipe(D);

  assert.deepEqual(E.prevAll(), [D, B, A, C]);
  A.end();

  //       C - E
  //      /
  // A - B
  //      \
  //       D - E

  var A = makeReadable();
  var B = makeDuplex();
  var C = makeLegacy();
  var D = makeDuplex();
  var E = makeWritable();

  A.pipe(B).pipe(C).pipe(E);
  B.pipe(D).pipe(E);
  assert.deepEqual(A.nextAll(), [B, C, E, D]);
  A.end();

  assert.end();
});

test('nextAll()/prevAll() returns all streams with no cycles', function(assert) {
  var A = makeLegacy();
  var B = makeLegacy();

  A.pipe(B).pipe(A);
  assert.deepEqual(A.nextAll(), [B]);
  assert.deepEqual(B.nextAll(), [A]);
  assert.deepEqual(A.prevAll(), [B]);
  assert.deepEqual(B.prevAll(), [A]);
  A.end();

  var A = makeDuplex();
  var B = makeDuplex();

  A.pipe(B).pipe(A);
  assert.deepEqual(A.nextAll(), [B]);
  assert.deepEqual(B.nextAll(), [A]);
  assert.deepEqual(A.prevAll(), [B]);
  assert.deepEqual(B.prevAll(), [A]);
  A.end();

  assert.end();
});

test('lifecycle: {next,prev}{All,}() responds to the removal of streams via end or unpipe', function(assert) {
  //       C - E
  //      /
  // A - B
  //      \
  //       D - E
  //
  // then unpipe C from B
  var A = makeReadable();
  var B = makeDuplex();
  var C = makeDuplex();
  var D = makeDuplex();
  var E = makeWritable();

  A.pipe(B).pipe(C).pipe(E);
  B.pipe(D).pipe(E);
  assert.deepEqual(A.nextAll(), [B, C, E, D]);
  assert.deepEqual(E.prevAll(), [C, B, A, D]);
  assert.deepEqual(E.prev(), [C, D]);
  assert.deepEqual(B.next(), [C, D]);
  B.unpipe(C);
  assert.deepEqual(B.next(), [D]);
  assert.deepEqual(A.nextAll(), [B, D, E]);

  // C is still piped to E!
  assert.deepEqual(E.prevAll(), [C, D, B, A]);
  assert.deepEqual(E.prev(), [C, D]);
  C.unpipe(E);
  assert.deepEqual(E.prevAll(), [D, B, A]);
  assert.deepEqual(E.prev(), [D]);
  A.end();

  assert.end();
});
