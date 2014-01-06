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

// the storage returned by 'create' should be passed to listener
// instances when their observers are called
(function() {
  var storage  = { tag: 'default' };
  var expected;

  var handlers = {
    create: function(emitter, _storage) {
      // should receive the default observer storage here
      assert.equal(storage, _storage);
      return expected = {name: 'default'};
    },

    // should receive instance-specific storage for all these

    before: function(emitter, _storage) {
      assert.equal(expected, _storage);
    },
    after: function(emitter, _storage) {
      assert.equal(expected, _storage);
    },
    error: function(emitter, _storage, error) {
      assert.equal(expected, _storage);
      return true;
    },
    add: function(emitter, _storage) {
      assert.equal(expected, _storage);
    },
    remove: function(emitter, _storage) {
      assert.equal(expected, _storage);
    }
  };

  var observer = EventEmitter.addObserver(handlers, storage);

  var ee, okay;
  function empty() {
    okay = true;
  }

  ee = new EventEmitter();
  ee.addListener('happy', empty);
  ee.emit('happy');
  ee.removeListener('happy', empty);
  ee.emit('error');

  // instance storage should be different from the default storage
  assert.notEqual(storage, expected);
  assert(okay);

  EventEmitter.removeObserver(observer);
})();

// the default storage should propagate through to the individual
// event emitter instances when nothing is returned by 'create'
(function() {
  var storage  = {};

  var handlers = {
    create: function(emitter, _storage) {
      // should receive the default observer storage here
      assert.equal(storage, _storage);
    },

    // should receive default storage for all these

    before: function(emitter, _storage) {
      assert.equal(storage, _storage);
    },
    after: function(emitter, _storage) {
      assert.equal(storage, _storage);
    },
    error: function(emitter, _storage, error) {
      assert.equal(storage, _storage);
      return true;
    },
    add: function(emitter, _storage) {
      assert.equal(storage, _storage);
    },
    remove: function(emitter, _storage) {
      assert.equal(storage, _storage);
    }
  };

  var observer = EventEmitter.addObserver(handlers, storage);

  var ee, okay;
  function empty() {
    okay = true;
  }

  ee = new EventEmitter();
  ee.addListener('happy', empty);
  ee.emit('happy');
  ee.removeListener('happy', empty);
  ee.emit('error');

  EventEmitter.removeObserver(observer);

  assert(okay);
})();

// test that multiple EE instances receive independent
// storage objects when not using default storage
(function() {
  var storage  = { tag: 'default' };
  var last;
  var i = 0;

  var handlers = {
    create: function(emitter, _storage) {
      return {
        id: i++
      }
    },

    // should receive instance-specific storage for all these

    add: function(emitter, _storage) {
      last = _storage;
    },
    error: function(emitter, _storage, error) {
      last = _storage;
      return true;
    }
  };

  var observer = EventEmitter.addObserver(handlers, storage);

  var e1, e2, okay, test;
  function empty() { }

  e1 = new EventEmitter();
  e2 = new EventEmitter();

  // each instance should receive a different storage
  e1.addListener('happy', empty);
  test = last;
  e2.addListener('happy', empty);
  assert.notStrictEqual(test, last);

  // also check error case, because errors are weird
  e1.emit('error');
  test = last;
  e2.emit('error');
  assert.notStrictEqual(test, last);

  EventEmitter.removeObserver(observer);
})();

console.log('ok');
