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

/*
 * This test is aimed at making sure that unref timers queued with
 * timers._unrefActive work correctly.
 *
 * Basically, it queues one timer in the unref queue, and then queues
 * it again each time its timeout callback is fired until the callback
 * has been called ten times.
 *
 * At that point, it unenrolls the unref timer so that its timeout callback
 * is not fired ever again.
 *
 * Finally, a ref timeout is used with a delay large enough to make sure that
 * all 10 timeouts had the time to expire.
 */

var timers = require('timers');
var assert = require('assert');

var someObject = {};
var nbTimeouts = 0;

var N = 10;

timers.unenroll(someObject);
timers.enroll(someObject, 1);

someObject._onTimeout = function _onTimeout() {
  ++nbTimeouts;

  if (nbTimeouts === N) timers.unenroll(someObject);

  timers._unrefActive(someObject);
}

function startTimer() { timers._unrefActive(someObject); }

startTimer();

setTimeout(function() {
  assert.equal(nbTimeouts, N);
}, 100);
