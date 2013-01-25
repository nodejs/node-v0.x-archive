var Timer = require('../lib/bench-timer');
var assert = require('assert');

Timer('sync0', function() { });

Timer('sync1', function() { });

Timer('syncComplete', function() { })
  .oncomplete(function(name, time, args) {
    assert.ok(typeof name === 'string');
    assert.ok(Array.isArray(time));
    assert.ok(Array.isArray(args));
    assert.strictEqual(args[0], 1);
    assert.strictEqual(args[1], true);
  }, [1, true]);
