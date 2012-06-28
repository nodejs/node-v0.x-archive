
var assert = require('assert');

try {
  require('../fixtures/invalid.json');
} catch (err) {
  var i = err.message.indexOf('test/fixtures/invalid.json: Unexpected string')
  assert(-1 != i, 'require() json error should include path');
}