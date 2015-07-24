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

// Make sure we test 0ms timers, since they would had always wanted to run on
// the current tick, and greater than 0ms timers, for scenarios where the
// outer timer takes longer to complete than the delay of the nested timer.
// Since the process of recreating this is identical regardless of the timer
// delay, these scenarios are in one test.
var scenarios = [0, 100];

scenarios.forEach(function (delay) {
  var nestedCalled = false;

  setTimeout(function A() {
    // Create the nested timer with the same delay as the outer timer so that it
    // gets added to the current list of timers being processed by
    // listOnTimeout.
    setTimeout(function B() {
      nestedCalled = true;
    }, delay);

    // Busy loop for the same timeout used for the nested timer to ensure that
    // we are in fact expiring the nested timer.
    common.busyLoop(delay);

    // The purpose of running this assert in nextTick is to make sure it runs
    // after A but before the next iteration of the libuv event loop.
    process.nextTick(function() {
      assert.ok(!nestedCalled);
    });

    // Ensure that the nested callback is indeed called prior to process exit.
    process.on('exit', function onExit() {
      assert.ok(nestedCalled);
    });
  }, delay);
});
