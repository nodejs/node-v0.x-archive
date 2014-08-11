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

var ALLOWABLE_ERROR = 5; // [ms]

function nearly(a, b) {
  if (Math.abs(a-b) > ALLOWABLE_ERROR)
    assert.strictEqual(a, b);
}

function test(period, busyTime, expectedDelta, isUnref, next) {
  var res = [];

  var prev = Date.now();
  var interval = setInterval(function() {
    var s = Date.now();
    while (Date.now() - s < busyTime);
    var e = Date.now();

    res.push(s-prev);
    if (res.length === 5) {
      clearInterval(interval);
      done();
    }

    prev = e;
  }, period);

  if (isUnref) {
    interval.unref();
    var blocker = setTimeout(function() {
      assert(false, 'Interval works too long');
    }, Math.max(busyTime, period) * 6);
  }

  function done() {
    if (blocker) clearTimeout(blocker);
    nearly(period, res.shift());
    res.forEach(nearly.bind(null, expectedDelta));
    process.nextTick(next);
  }
}

test(50, 10, 40, false, function() { // ref, simple
  test(50, 10, 40, true, function() { // unref, simple
    test(50, 100, 0, false, function() { // ref, overlay
      test(50, 100, 0, true, function() {}); // unref, overlay
    });
  });
});
