
var common = require('../common');
var assert = require('assert');
var spawn = require('child_process').spawn;

var cat = spawn('cat');

try {
  process.kill(cat.pid, 0);
} catch (err) {
  assert.fail('null signal failed');
}

process.kill(cat.pid, 'SIGTERM');

try {
  process.kill(cat.pid, 0);
  assert.fail('null signal failed');
} catch (err) {
  assert.ok(err);
}