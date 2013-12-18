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
var events = require('events');

// Check observers are created correctly.
var obs = events.createObserver({
  create: function(context, storage) {
    assert.equal(storage, 'test storage');
  }
}, 'test storage');

assert.equal(typeof obs.create, 'function');
assert.equal(obs.flags, 1);
assert.equal(obs.storage, 'test storage');
assert.equal(typeof obs.uid, 'number');

events.addObserver(obs);

var ee = new events();

assert.ok(ee._observers);
assert.equal(ee._observers.length, 1);
assert.equal(ee._observers[0], obs);
assert.equal(ee._storage[obs.uid], obs.storage);

var item = ee._observers[0];
assert.equal(typeof item.create, 'function');
assert.equal(item.flags, 1);
assert.equal(item.storage, 'test storage');
assert.equal(ee._storage[obs.uid], item.storage);


// Check the observer is removed properly.
events.removeObserver(obs);

var ee = new events();

assert.ok(!ee._observers);
assert.ok(!ee._storage);


// Check the storage value can be overridden, and the observer
// is properly created on addObserver.
var obs = events.addObserver({
  create: function(context, storage) {
    context.testValue = true;
    return 'this works';
  }
}, 'remove me');

var ee = new events();

assert.ok(ee._observers);
assert.equal(ee._observers.length, 1);
assert.equal(ee._observers[0], obs);
assert.equal(ee._storage[obs.uid], 'this works');
assert.ok(ee.testValue);

var item = ee._observers[0];
assert.equal(typeof item.create, 'function');
assert.equal(item.flags, 1);
assert.equal(item.storage, 'remove me');


// Check the same observer can only be added once.
events.addObserver(obs);

var ee = new events();

assert.ok(ee._observers);
assert.equal(ee._observers.length, 1);


// Check the storage value isn't overridden if observer was
// previously created.
events.removeObserver(obs);
events.addObserver(obs, 'not existent');

assert.equal(obs.storage, 'remove me');
