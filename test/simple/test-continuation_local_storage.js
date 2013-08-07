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


// basic tests of continuation-local storage

require('../common');
var assert = require('assert');

var run = 0;
var expectRun = 0;

// don't expose namespaces until module is loaded.
assert(!process.namespaces);
assert(!process._wrapContinuations);

var cls = require('continuation_local_storage');

// now they should be exposed
assert(process.namespaces);
assert(process._wrapContinuations);

// namespaces can't be removed from process
assert(!(delete process.namespaces));
assert(process.namespaces);

// nor can its helper function
assert(!(delete process._wrapContinuations));
assert(process._wrapContinuations);

// namespaces aren't writable
var original = process.namespaces;
process.namespaces = 'ham';
assert.equal(process.namespaces, original);

// ...nor is the helper function
original = process._wrapContinuations;
process._wrapContinuations = 'ham';
assert.equal(process._wrapContinuations, original);

process.on('exit', function() {
  console.error('exit', run, expectRun);
  assert.equal(run, expectRun, 'ran the expected number of continuations');
  console.log('ok');
});

var namespace = cls.createNamespace('test');
assert(cls.getNamespace('test'));

namespace.set('value', 1);

// run synchronously
expectRun++;
namespace.run(function() {
  assert(cls.getNamespace('test'));
  assert.equal(namespace.get('value'), 1);

  namespace.set('value', 2);
  namespace.set('synchronous', true);

  assert.equal(namespace.get('value'), 2);

  assert(namespace.get('synchronous'));
  assert(!namespace.get('process.nextTick'));
  assert(!namespace.get('setImmediate'));
  assert(!namespace.get('setTimeout'));
  assert(!namespace.get('setInterval'));

  run++;
});

assert.equal(namespace.get('value'), 1);

// process.nextTick
expectRun++;
namespace.run(function() {
  assert(cls.getNamespace('test'));
  assert.equal(namespace.get('value'), 1);

  namespace.set('value', 3);
  namespace.set('process.nextTick', true);
  process.nextTick(function() {
    assert.equal(namespace.get('value'), 3);

    assert(!namespace.get('synchronous'));
    assert(namespace.get('process.nextTick'));
    assert(!namespace.get('setImmediate'));
    assert(!namespace.get('setTimeout'));
    assert(!namespace.get('setInterval'));

    run++;
  });
});

assert.equal(namespace.get('value'), 1);

// setImmediate
expectRun++;
namespace.run(function() {
  assert(cls.getNamespace('test'));
  assert.equal(namespace.get('value'), 1);

  namespace.set('value', 4);
  namespace.set('setImmediate', true);
  setImmediate(function() {
    assert.equal(namespace.get('value'), 4);

    assert(!namespace.get('synchronous'));
    assert(!namespace.get('process.nextTick'));
    assert(namespace.get('setImmediate'));
    assert(!namespace.get('setTimeout'));
    assert(!namespace.get('setInterval'));

    run++;
  });
});

assert.equal(namespace.get('value'), 1);

// setTimeout
expectRun++;
namespace.run(function() {
  assert(cls.getNamespace('test'));
  assert.equal(namespace.get('value'), 1);

  namespace.set('value', 5);
  namespace.set('setTimeout', true);
  setTimeout(function() {
    assert.equal(namespace.get('value'), 5);

    assert(!namespace.get('synchronous'));
    assert(!namespace.get('process.nextTick'));
    assert(!namespace.get('setImmediate'));
    assert(namespace.get('setTimeout'));
    assert(!namespace.get('setInterval'));

    run++;
  }, 0);
});

assert.equal(namespace.get('value'), 1);

// setInterval
expectRun++;
namespace.run(function() {
  assert(cls.getNamespace('test'));
  assert.equal(namespace.get('value'), 1);

  namespace.set('value', 6);
  namespace.set('setInterval', true);
  var ref = setInterval(function() {
    clearInterval(ref);

    assert.equal(namespace.get('value'), 6);

    assert(!namespace.get('synchronous'));
    assert(!namespace.get('process.nextTick'));
    assert(!namespace.get('setImmediate'));
    assert(!namespace.get('setTimeout'));
    assert(namespace.get('setInterval'));

    run++;
  }, 0);
});

assert.equal(namespace.get('value'), 1);
