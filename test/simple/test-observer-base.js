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

var ee, ee_created, observer, stor, err;
var events = [];
function empty() {
  events.push('event');
}
var handlers = {
  create: function(context, storage) {
    ee_created = context;
    assert.equal(storage, stor);
    events.push('create');
  },
  before: function(context, storage) {
    assert.equal(context, ee);
    assert.equal(storage, stor);
    events.push('before');
  },
  after: function(context, storage) {
    assert.equal(context, ee);
    assert.equal(storage, stor);
    events.push('after');
  },
  error: function(context, storage, error) {
    assert.equal(context, ee);
    assert.equal(storage, stor);
    assert.equal(error, err);
    events.push('error');
    return true;
  },
  add: function(context, storage) {
    assert.equal(context, ee);
    assert.equal(storage, stor);
    events.push('add');
  },
  remove: function(context, storage) {
    assert.equal(context, ee);
    assert.equal(storage, stor);
    events.push('remove');
  }
};

stor = { tag: 'storage' };
observer = EventEmitter.addObserver(handlers, stor);

ee = new EventEmitter();
assert.equal(ee_created, ee);

ee.addListener('happy', empty);
ee.emit('happy');
ee.removeListener('happy', empty);
ee.emit('error', err = new Error());

assert.equal(events.shift(), 'create');
assert.equal(events.shift(), 'add');
assert.equal(events.shift(), 'before');
assert.equal(events.shift(), 'event');
assert.equal(events.shift(), 'after');
assert.equal(events.shift(), 'remove');
assert.equal(events.shift(), 'error');

console.log('ok');
