var common = require('../common');
var assert = require('assert');

var argumentsLength, firstArg, secondArg;

function callback() {
  argumentsLength = arguments.length;
  firstArg = arguments[0];
  secondArg = arguments[1];
}

process.nextTick(callback, 123, 456);

process.addListener('exit', function() {
  assert.equal(2, argumentsLength);
  assert.equal(123, firstArg);
  assert.equal(456, secondArg);
});
