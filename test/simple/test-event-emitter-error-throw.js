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
var EE = require('events').EventEmitter;

var errorCatched = false;

(function testZeroListenerErrorThrow() {
  var e = new EE();

  assert.equal(EE.listenerCount(e, 'error'), 0);
  assert.throws(function() {
    e.emit('error');
  });
})();

(function testListenerErrorEmitNotThrow() {
  var errorEmitted = 0;
  var e = new EE();

  e.once('error', function(er) {
    errorEmitted++;
  });

  assert.equal(EE.listenerCount(e, 'error'), 1);
  e.emit('error');

  // now test that it still throws when listener is gone
  assert.equal(EE.listenerCount(e, 'error'), 0);
  assert.throws(function() {
    e.emit('error');
  });

  process.on('exit', function() {
    assert.equal(errorEmitted, 1);
  });
})();
