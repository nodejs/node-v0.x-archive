var assert = require('assert');
var Timer = require('../lib/bench-timer');

console.log('test passing arguments to complete');

Timer('testSync', function() { })
  .oncomplete(function(name, time, args) {
    assert.ok(Array.isArray(args));
    assert.strictEqual(args[0], true);
    assert.strictEqual(args[1], 1);
  }, [true, 1]);

Timer('testSyncNull', function() { })
  .oncomplete(function(name, time, args) {
    assert.strictEqual(args, null);
  });

Timer('testAsync')
  .onend(function(name, time, iter, args) {
    assert.ok(Array.isArray(args));
    assert.strictEqual(args[0], true);
    assert.strictEqual(args[1], 1);
  }, [true, 1]).end();

Timer('testAsyncNull')
  .onend(function(name, time, iter, args) {
    assert.strictEqual(args, null);
  }).end();
