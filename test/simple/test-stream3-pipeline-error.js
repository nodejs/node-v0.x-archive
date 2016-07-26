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

test('PipelineError has expected attributes', function(assert) {
  var readable = new stream.Readable;
  var error = new Error;
  readable.addPipelineErrorHandler(function handler(ev) {
    readable.removePipelineErrorHandler(handler);
    assert.strictEqual(ev.error, error);
    assert.strictEqual(ev.stream, readable);
    assert.end();
  });

  readable.emit('error', error);
});

test('handleError stops propagation', function(assert) {
  // A -> B -> C
  var A = makeReadable();
  var B = makeDuplex();
  var C = makeWritable();

  // the error event should not crash the test.
  A.on('error', Function());
  B.on('error', Function());
  C.on('error', Function());

  A.pipe(B).pipe(C);

  B.addPipelineErrorHandler(function(ev) {
    ev.handleError();  
  });

  C.addPipelineErrorHandler(function(ev) {
    assert.fail('should not have seen pipelineError');
  });

  A.emit('error', new Error('test pipelineError'));

  A.push(null);
  assert.end();
});

test('event handler does not prevent default behavior', function(assert) {
  // A -> B -> C
  var A = makeReadable();
  var B = makeDuplex();
  var C = makeWritable();
  var seen = 0;
  var err;

  A.pipe(B).pipe(C);

  A.addPipelineErrorHandler(onpipelineerror);
  B.addPipelineErrorHandler(onpipelineerror);
  C.addPipelineErrorHandler(onpipelineerror);

  function onpipelineerror(ev) {
    assert.ok(ev);
    ++seen;
  }

  try {
    A.emit('error', new Error('test pipelineError'));
  } catch(e) {
    err = e;
  }

  assert.ok(err);
  assert.equal(seen, 3);
  A.push(null);
  assert.end();
});

test('propagation 1 - simple pipeline', function(assert) {
  // A -> B -> C
  var A = makeReadable();
  var B = makeDuplex();
  var C = makeWritable();

  var visited = [];

  A.pipe(B).pipe(C);
  A.id = 'A'
  B.id = 'B'
  C.id = 'C'


  A.addPipelineErrorHandler(countPipelineError);
  B.addPipelineErrorHandler(countPipelineError);
  C.addPipelineErrorHandler(countPipelineError);

  var situations = [
    [A, C, [A, B, C]],
    [A, A, [A]],
    [B, B, [B]],
    [C, C, [C]],
    [B, C, [B, C]],
    [A, B, [A, B]],
  ];
  situations.forEach(examine);
  A.push(null);
  assert.end();

  function examine(situation, idx) {
    visited.length = 0;
    situation[1].addPipelineErrorHandler(handlePipelineError);
    try {
      situation[0].emit('error', new Error('should not throw: ' + idx));
    } finally {
      situation[1].removePipelineErrorHandler(handlePipelineError);
    }
    assert.deepEqual(
        visited,
        situation[2],
        'expected ' + situation[2].map(toName).join('') + ', ' +
        'got ' + visited.map(toName).join('')
    )
  }

  function toName(stream) {
    switch(stream) {
      case A: return 'A'; break;
      case B: return 'B'; break;
      case C: return 'C'; break;
    }
  }

  function countPipelineError(ev) {
    visited.push(this);
  }

  function handlePipelineError(ev) {
    ev.handleError();
  }
});

test('propagation 2 - duplex pipeline', function(assert) {
  // A -> B -> A
  var A = makeDuplex();
  var B = makeDuplex();
  var C = makeDuplex();

  var visited = [];
  var err = new Error;

  A.pipe(B).pipe(A);

  A.addPipelineErrorHandler(countPipelineError);
  B.addPipelineErrorHandler(countPipelineError);

  // throws error / handles errors / propagation sequence
  var situations = [
    [A, A, [A]],
    [A, B, [A, B]],
    [B, B, [B]],
    [B, A, [B, A]],
  ];

  situations.forEach(examine);
  A.push(null);
  assert.end();

  function examine(situation, idx) {
    visited.length = 0;
    situation[1].addPipelineErrorHandler(handlePipelineError);
    try {
      situation[0].emit('error', new Error);
    } finally {
      situation[1].removePipelineErrorHandler(handlePipelineError);
    }
    assert.deepEqual(
        visited,
        situation[2],
        'expected ' + situation[2].map(toName).join('') + ', ' +
        'got ' + visited.map(toName).join('')
    )
  }

  function toName(stream) {
    switch(stream) {
      case A: return 'A'; break;
      case B: return 'B'; break;
    }
  }

  function countPipelineError(ev) {
    visited.push(this);
  }

  function handlePipelineError(ev) {
    ev.handleError();
  }
});

test('propagation 3 - complex pipeline', function(assert) {
  //        C -> D -> C
  //       /
  // A -> B    V -> W
  //       \  /     | 
  //        U       |
  //          \     v 
  //           X -> Y -> X -> Z

  var A, B, C, D, U, V, W, X, Y, Z;

  A = makeReadable();
  B = makeDuplex();
  C = makeDuplex();
  D = makeDuplex();
  U = makeDuplex();
  V = makeDuplex();
  W = makeDuplex();
  X = makeDuplex();
  Y = makeDuplex();
  Z = makeWritable();

  var visited = [];

  [A, B, C, D, U, V, W, X, Y, Z].forEach(function(xs) {
    xs.addPipelineErrorHandler(countPipelineError);
    xs.setMaxListeners(11);
  });

  A.pipe(B).pipe(C).pipe(D).pipe(C);
  B.pipe(U).pipe(V).pipe(W).pipe(Y);
  X.pipe(Y).pipe(X).pipe(Z);

  // throws error / handles errors / propagation sequence
  var situations = [
    [A, Z, [A, B, C, D, U, V, W, Y, X, Z]],
    [B, Z, [B, C, D, U, V, W, Y, X, Z]],
    [U, W, [U, V, W]],
    [U, Z, [U, V, W, Y, X, Z]],
    [X, Z, [X, Y, Z]],
    [C, D, [C, D]],
  ];

  situations.forEach(examine);
  A.push(null);
  assert.end();

  function examine(situation, idx) {
    visited.length = 0;
    situation[1].addPipelineErrorHandler(handlePipelineError);
    try {
      situation[0].emit('error', new Error);
    } finally {
      situation[1].removePipelineErrorHandler(handlePipelineError);
    }

    assert.deepEqual(
        visited,
        situation[2],
        'expected ' + situation[2].map(toName).join('') + ', ' +
        'got ' + visited.map(toName).join('')
    )
  }

  function toName(stream) {
    switch(stream) {
      case A: return 'A'; break;
      case B: return 'B'; break;
      case C: return 'C'; break;
      case D: return 'D'; break;
      case U: return 'U'; break;
      case V: return 'V'; break;
      case W: return 'W'; break;
      case X: return 'X'; break;
      case Y: return 'Y'; break;
      case Z: return 'Z'; break;
    }
  }

  function countPipelineError(ev) {
    visited.push(this);
  }

  function handlePipelineError(ev) {
    ev.handleError();
  }
});

test('pipelineError inside pipelineError works', function(assert) {
  // A -> B -> C
  // X -> Y
  var A = makeReadable();
  var B = makeDuplex();
  var C = makeWritable();
  
  var X = makeReadable();
  var Y = makeWritable();

  var xyProblem = new Error('when you want Y, but ask for X');
  var abProblem = new Error('what is the cat\'s rate of meows when given tuna vs chicken');
  var seen = 0;

  A.pipe(B).pipe(C);
  X.pipe(Y);

  // we're checking here that during the processing of one pipelineError,
  // another distinct pipelineError can be emitted / handled separately.
  C.addPipelineErrorHandler(function(ev) {
    var error = ev.error;
    var stream = ev.stream;
    assert.strictEqual(error, abProblem);
    assert.strictEqual(stream, A);
    X.emit('error', xyProblem);
    assert.ok(!ev.isHandled());
    assert.strictEqual(error, ev.error);
    assert.strictEqual(stream, ev.stream);
    ev.handleError();
  });

  Y.addPipelineErrorHandler(function(ev) {
    ++seen; 
    assert.strictEqual(ev.stream, X);
    assert.strictEqual(ev.error, xyProblem);
  });


  try {
    A.emit('error', abProblem);
  } catch(err) {
    assert.strictEqual(err, xyProblem);
    assert.strictEqual(seen, 1);
    A.push(null);
    X.push(null);
    return assert.end();
  }

  assert.fail('expected thrown error');
});

test('single readableStream has pipelineError', function(assert) {
  var readable = fs.createReadStream(path.join(__dirname, 'dne'));

  // if this does not get handled the process will crash.
  readable.addPipelineErrorHandler(function(ev) {
    ev.handleError();
    assert.end();
  })
});

test('unpiped streams regain their own pipelineError machinery', function(assert) {
  var A = makeReadable();
  var B = makeDuplex();

  A.pipe(B);

  B.addPipelineErrorHandler(function(ev) {
    ev.handleError();  
  });

  setTimeout(function() {
    A.unpipe(B);
    B.emit('error', new Error);
    A.push(null);
    assert.end();
  }, 10);
});

test('legacy streams work with pipelineError', function(assert) {
  var A = makeLegacy();
  var B = makeLegacy();
  var C = makeLegacy();

  [A, B, C].forEach(function(xs) {
    xs.name = toName(xs)
  })

  var visited = [];

  A.pipe(B).pipe(C);

  A.addPipelineErrorHandler(countPipelineError);
  B.addPipelineErrorHandler(countPipelineError);
  C.addPipelineErrorHandler(countPipelineError);

  var situations = [
    [A, C, [A, B, C]],
    [A, B, [A, B]],
    [A, A, [A]],
    [B, C, [B, C]],
    [B, B, [B]],
    [C, C, [C]]
  ];
  situations.forEach(examine);
  A.end();
  assert.end();

  function examine(situation, idx) {
    visited.length = 0;
    situation[1].addPipelineErrorHandler(handlePipelineError);
    situation[0].emit('error', new Error('failed ' + idx));
    situation[1].removePipelineErrorHandler(handlePipelineError);
    assert.deepEqual(
        visited,
        situation[2],
        'expected ' + situation[2].map(toName).join('') + ', ' +
        'got ' + visited.map(toName).join('')
    )
  }

  function toName(stream) {
    switch(stream) {
      case A: return 'A'; break;
      case B: return 'B'; break;
      case C: return 'C'; break;
    }
  }

  function countPipelineError(ev) {
    visited.push(this);
  }

  function handlePipelineError(ev) {
    ev.handleError();
  }    
});

test('lifecycle: addPipelineErrorHandler / pipe / error', function(assert) {
  var tests = [
    [makeReadable, makeWritable],
    [makeLegacy, makeWritable],
    [makeReadable, makeLegacy],
    [makeLegacy, makeLegacy],
    [makeDuplex, makeDuplex],
    [makeLegacy, makeDuplex],
    [makeDuplex, makeLegacy]
  ];

  tests.forEach(evaluate);
  assert.end();

  function evaluate(testPair, idx) {
    var A = testPair[0]();
    var B = testPair[1]();

    B.addPipelineErrorHandler(function(ev) {
      ev.handleError();
      assert.ok('saw error event');
    });
    A.pipe(B);
    A.emit('error', new Error('should not be thrown'));
    A.end();
  }
});

test('lifecycle: addPipelineErrorHandler / pipe / unpipe / error', function(assert) {
  // legacy streams don't have `.unpipe`, so are omitted here.
  var tests = [
    [makeReadable, makeWritable],
    [makeReadable, makeLegacy],
    [makeDuplex, makeDuplex],
    [makeDuplex, makeLegacy]
  ];

  tests.forEach(evaluate);
  assert.end();

  function evaluate(testPair, idx) {
    var A = testPair[0]();
    var B = testPair[1]();
    var C = makeReadable();

    B.addPipelineErrorHandler(function(ev) {
      ev.handleError();
      assert.ok('saw error event');
    });
    A.pipe(B);
    A.unpipe(B);

    var err;

    try {
      err = new Error('should be thrown');
      A.emit('error', err);
    } catch(e) {
      A.end();
      assert.strictEqual(e, err);
      return
    }

    assert.fail('should have thrown');
  }
});

test('multiple error handlers on a single stream', function(assert) {
  var A = makeReadable();
  var seen = 0;

  A.addPipelineErrorHandler(countError);
  A.addPipelineErrorHandler(countError);
  A.addPipelineErrorHandler(function (ev) {
    ev.handleError();
  });
  A.addPipelineErrorHandler(countError);
  A.addPipelineErrorHandler(countError);

  A.emit('error', new Error('wuh oh'));
  assert.equal(seen, 2);
  assert.end();

  function countError() {
    ++seen;
  }
});
