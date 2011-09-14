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
var domain = require('domain');

var timerCallbacks = 0;

setTimeout(function() {
  console.error("timer 1");
  timerCallbacks++;

  var d1 = domain.create(null, function() {
    console.error("d1 created");

    setTimeout(function() {
      console.error("timer 2");
      timerCallbacks++;

      setTimeout(function() {
        console.error("timer 3");
        timerCallbacks++;
      }, 1);
    }, 1);

    setTimeout(function() {
      timerCallbacks++;
    }, 1);
  });

}, 1);

setTimeout(function() {
  timerCallbacks++;
  console.error("timer 4");

  var d2 = domain.create(null, function() {
    console.error("d2 created");

    var t1 = setTimeout(function() {
      assert.ok(false, "should not get here");
    }, 1);
    assert.ok(t1.domain);
    assert.equal(t1.domain, d2);
    assert.equal(t1.domain.id, require('domain').getCurrent().id);

    var t2 = setTimeout(function() {
      assert.ok(false, "should not get here");
    }, 1);
    assert.equal(t2.domain, d2);

    this.kill();
  });
}, 1);


process.on('exit', function() {
  assert.equal(5, timerCallbacks);
});
