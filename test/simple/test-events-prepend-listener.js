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

var assert = require('assert');
var events = require('events');

var e = new events.EventEmitter();

var orderAdded = [];

e.on('newListener', function (event, listener) {
  orderAdded.push(listener);
});

var originalFirst = function () {};
var newFirst = function () {};

assert.notEqual(originalFirst, newFirst);

e.addListener('event', originalFirst);
e.prependListener('event', newFirst);

process.on('exit', function () {
  var orderCalled = e.listeners('event');
  assert.equal(orderCalled[0], newFirst);
  assert.equal(orderCalled[1], originalFirst);
  assert.equal(orderAdded[0], orderCalled[1]);
  assert.equal(orderAdded[1], orderCalled[0]);
});
