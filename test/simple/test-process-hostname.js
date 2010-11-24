assert = require('assert');

assert.ok(typeof process.hostname, 'string');
assert.ok(process.hostname.length > 0);

// property should be read-only
hostname = process.hostname, process.hostname = 'foobarbaz42';
assert.equal(process.hostname, hostname);
