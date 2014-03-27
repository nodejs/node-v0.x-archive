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
var tracing = require('tracing');

var queue = [];
var actual = 0;
var expected = 0;

var addListener = tracing.addAsyncListener;
var removeListener = tracing.removeAsyncListener;

var callbacks = {
  create: function onCreate() {
    return 'good';
  },
  before: function onBefore(ctx, stor) { },
  after: function onAfter(ctx, stor) {
    assert.ok(stor !== 'bad');
  }
};

var listener = tracing.createAsyncListener(callbacks, 'bad');

process.on('beforeExit', function() {
  if (queue.length > 0)
    runQueue();
});

process.on('exit', function(code) {
  removeListener(listener);

  // Very important this code is checked, or real reason for failure may
  // be obfuscated by a failing assert below.
  if (code !== 0)
    return;

  console.log('ok');
});

setImmediate(function() {
  addListener(listener);

  setImmediate(function() {
    removeListener(listener);
    addListener(listener);
    setImmediate(function() {
      removeListener(listener);
      setImmediate(function() {
        addListener(listener);
      });
    });
  });
});


