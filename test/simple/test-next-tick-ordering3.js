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
var util = require('util');

if (!util.isFunction(Object.observe) && !util.isFunction(Promise)) {
  console.error('Skipping because node does not support Object.observe and Promise');
  process.exit(0);
}

var results = {};


function Test1() {
  var order = results['Test1'] = [];
  var obj = {};
  Object.observe(obj, function(changeRecord) {
    order.push('Object.observe');
  });
  process.nextTick(function() {
    order.push('nextTick');
  });
  obj.a = 1;
}


function Test2() {
  var order = results['Test2'] = [];
  var obj = {};
  Object.observe(obj, function(changeRecord) {
    order.push('Object.observe');
  });
  setTimeout(function() {
    process.nextTick(function() {
      order.push('nextTick');
    });
    obj.a = 1;
  }, 0);
}


function Test3() {
  var order = results['Test3'] = [];
  var obj = {};

  var promise = new Promise(function(onFulfilled, onRejected) {
    onFulfilled();
  });

  process.nextTick(function() {
    order.push('nextTick');
  });

  promise.then(function() {
    order.push('Promise.onFullfilled');
  }, null);
}


function Test4() {
  var order = results['Test4'] = [];
  var obj = {};

  setTimeout(function() {
    var promise = new Promise(function(onFulfilled, onRejected) {
      onFulfilled();
    });

    process.nextTick(function() {
      order.push('nextTick');
    });

    promise.then(function() {
      order.push('Promise.onFullfilled');
    }, null);
  }, 0);
}

Test1();
Test2();
Test3();
Test4();

process.on('exit', function() {
  assert.deepEqual(results.Test1, ['Object.observe', 'nextTick']);
  assert.deepEqual(results.Test2, ['Object.observe', 'nextTick']);
  assert.deepEqual(results.Test3, ['Promise.onFullfilled', 'nextTick']);
  assert.deepEqual(results.Test4, ['Promise.onFullfilled', 'nextTick']);
});
