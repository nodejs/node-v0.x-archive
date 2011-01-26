(function() {
  var assert = require('assert'),
      common = require('../common');

  var test = require(common.fixturesDir + '/test-json-require');
  assert.equal(typeof test, 'object');
  assert.equal(test.foo, "bar");
  assert.equal(Array.isArray(test.baz), true);
  assert.equal(test.baz.length, 1);
  assert.equal(test.baz[0], 1337);
  
  var testOrder = require(common.fixturesDir + '/test-json-extorder');
  assert.equal(testOrder, 'JS', '.js was suppose to load by default but did not');
  var testJSON = require(common.fixturesDir + '/test-json-extorder.json');
  assert.equal(testJSON, 'JSON', '.json was suppose to load by explicit extension but did not');

})();
