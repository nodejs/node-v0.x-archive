var assert = require('assert');
var test = require('./build/Release/test');
var obj = new test.MyClass();
var obj2 = new test.MyClass();

assert.equal(obj.sayHello(), "hello");

// Is 'value' properly in the prototype?
assert.equal('value' in obj, true);
assert.equal(obj.hasOwnProperty('value'), false);

// Does it work?
obj.value = 123;
assert.equal(obj.value, 123);

// Can we probe the prototype method without crashing?
// (crashes if you don't ensure object is wrapped in accessor)
assert.equal(typeof test.MyClass.prototype.value, "undefined");

// Ensure value storage is indeed local
obj.value = 111;
obj2.value = 222;
assert.equal(obj.value, 111);
assert.equal(obj2.value, 222);
