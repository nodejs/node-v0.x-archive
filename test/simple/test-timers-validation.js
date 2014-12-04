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
var timers = require('timers');

// Verify that invalid delays throw
var noop = function() {};
var obj = {};
var nonNumericDelays = ['100', true, false, undefined, null, '', {}, noop, []];
var badRangeDelays = [-0.001, -1, -Infinity, Infinity, NaN];
var validDelays = [0, 0.001, 1, 1e6];

for (var i = 0; i < nonNumericDelays.length; i++) {
  assert.throws(function() {
    timers.enroll(obj, nonNumericDelays[i]);
  }, TypeError);

  assert.throws(function() {
    setTimeout(noop, nonNumericDelays[i]);
  }, TypeError);

  assert.throws(function() {
    setInterval(noop, nonNumericDelays[i]);
  }, TypeError);
}

for (var i = 0; i < badRangeDelays.length; i++) {
  assert.throws(function() {
    timers.enroll(obj, badRangeDelays[i]);
  }, RangeError);

  assert.throws(function() {
    setTimeout(noop, badRangeDelays[i]).unref();
  }, RangeError);

  assert.throws(function() {
    setInterval(noop, badRangeDelays[i]).unref();
  }, RangeError);
}

for (var i = 0; i < validDelays.length; i++) {
  assert.doesNotThrow(function() {
    timers.enroll(obj, validDelays[i]);
  });

  assert.doesNotThrow(function() {
    setTimeout(noop, validDelays[i]).unref();
  });

  assert.doesNotThrow(function() {
    setInterval(noop, validDelays[i]).unref();
  });
}
