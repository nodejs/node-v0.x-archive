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

var tests = [];
var nor = 0;
var activeContext;

var callbacksObj = {
  error: function(ctx) {
    process._rawDebug('Checking activeContext');
    assert.equal(ctx, activeContext);
    setImmediate(next);
    return true;
  }
};

function next() {
  if (tests.length > 0) {
    nor--;
    tests.pop()();
  }
}
setImmediate(next);

process.on('exit', function(code) {
  tracing.removeAsyncListener(listener);
  if (code !== 0)
    return;
  assert.equal(nor, 0);
  process._rawDebug('ok');
});

var listener = tracing.addAsyncListener(callbacksObj);


tests.push(function() {
  activeContext = setTimeout(function() {
    throw new Error('error');
  });
});


tests.push(function() {
  activeContext = setTimeout(function() {
    (function a() {
      throw new Error('error');
    }());
  });
});


tests.push(function() {
  setImmediate(function() {
    activeContext = setInterval(function() {
      throw new Error('error');
    });
  });
});


nor = tests.length;
