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

// Check observer can be added after creation.
var obs = events.createObserver({
  create: function(context, storage) {
    assert.equal(storage, 'test storage');
  }
}, 'test storage');

var ee = new events();

events.attachObserver(ee, obs);

assert.ok(ee._observers);
assert.equal(ee._observers.length, 1);
assert.equal(ee._observers[0], obs);
assert.equal(ee._storage[obs.uid], obs.storage);

var item = ee._observers[0];
assert.equal(typeof item.create, 'function');
assert.equal(item.flags, 1);
assert.equal(item.storage, 'test storage');
assert.equal(ee._storage[obs.uid], item.storage);


// Check observer can be added after creation and storage changed.
var obs = events.createObserver({
  create: function(context, storage) { }
}, 'test storage');

var ee = new events();

events.attachObserver(ee, obs, 'new storage');

assert.ok(ee._observers);
assert.equal(ee._observers.length, 1);
assert.equal(ee._observers[0], obs);

var item = ee._observers[0];
assert.equal(typeof item.create, 'function');
assert.equal(item.flags, 1);
assert.equal(ee._storage[obs.uid], 'new storage');
