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
var EventEmitter = require('events');
var assert = require('assert');

var handler_log, ee;

var handlers = {
  create: function() {
    handler_log.push('create');
  },
  before: function() {
    handler_log.push('before');
  },
  after: function() {
    handler_log.push('after');
  },
  error: function() {
    handler_log.push('error');
  },
  add: function() {
    handler_log.push('add');
  },
  remove: function() {
    handler_log.push('remove');
  }
};

var observer = EventEmitter.addObserver(handlers);

//
// test detaching an observer mid-flight
//
handler_log = [];
ee = new EventEmitter();
ee.on('done', function() {
  // this event should run without observers
  handler_log.push('done');
});

ee.on('go', function() {
  handler_log.push('go');
  // no more observers should be called
  EventEmitter.detachObserver(ee, observer);
  ee.emit('done');
});
ee.emit('go');
assert.equal(handler_log.pop(), 'done');
assert.equal(handler_log.length, 5); // create, add, add, before, go

//
// test observer runs on pre-existing EEs after being removed globally
//
handler_log = [];
ee = new EventEmitter();
EventEmitter.removeObserver(handlers);
ee.on('go', function() {
  // the observers for this event should run, since the EE was defined
  // while the observer was in play
  handler_log.push('go');
});
ee.emit('go');
assert.equal(handler_log.length, 5); // create, add, before, go, after

// yay everything worked
console.log('ok');
