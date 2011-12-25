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
var assert = require('assert');
var util = require('util');

// test the internal isDate implementation
var Date2 = require('vm').runInNewContext('Date');
var d = new Date2();
var orig = util.inspect(d);
Date2.prototype.foo = 'bar';
var after = util.inspect(d);
assert.equal(orig, after);

// test for sparse array
var a = ['foo', 'bar', 'baz'];
assert.equal(util.inspect(a), "[ 'foo', 'bar', 'baz' ]");
delete a[1];
assert.equal(util.inspect(a), "[ 'foo', , 'baz' ]");
assert.equal(util.inspect(a, true), "[ 'foo', , 'baz', [length]: 3 ]");
assert.equal(util.inspect(new Array(5)), '[ , , , ,  ]');

// test for property descriptors
var getter = Object.create(null, {
  a: {
    get: function() { return 'aaa'; }
  }
});
var setter = Object.create(null, {
  b: {
    set: function() {}
  },
});
var getterAndSetter = Object.create(null, {
  c: {
    get: function() { return 'ccc'; },
    set: function() {}
  }
});
assert.equal(util.inspect(getter, true), "{ [a]: [Getter] }");
assert.equal(util.inspect(setter, true), "{ [b]: [Setter] }");
assert.equal(util.inspect(getterAndSetter, true), "{ [c]: [Getter/Setter] }");

// exceptions should print the error message, not "{}"
assert.equal(util.inspect(new Error()), '[Error]');
assert.equal(util.inspect(new Error('FAIL')), '[Error: FAIL]');
assert.equal(util.inspect(new TypeError('FAIL')), '[TypeError: FAIL]');
assert.equal(util.inspect(new SyntaxError('FAIL')), '[SyntaxError: FAIL]');
try {
  undef();
} catch (e) {
  assert.equal(util.inspect(e), '[ReferenceError: undef is not defined]');
}
var ex = util.inspect(new Error('FAIL'), true);
assert.ok(ex.indexOf('[Error: FAIL]') != -1);
assert.ok(ex.indexOf('[stack]') != -1);
assert.ok(ex.indexOf('[message]') != -1);
assert.ok(ex.indexOf('[arguments]') != -1);
assert.ok(ex.indexOf('[type]') != -1);

// GH-1941
// should not throw:
assert.equal(util.inspect(Object.create(Date.prototype)), '{}');

// GH-1944
assert.doesNotThrow(function() {
  var d = new Date();
  d.toUTCString = null;
  util.inspect(d);
});

assert.doesNotThrow(function() {
  var r = /regexp/;
  r.toString = null;
  util.inspect(r);
});

// GH-2225
var x = { inspect: util.inspect };
assert.ok(util.inspect(x).indexOf('inspect') != -1);


// Constructor detection and formatting
function ctor(){}
assert.equal(util.inspect(ctor), '[Function: ctor]');
assert.equal(util.inspect(ctor.prototype, true), '{ [constructor]: [Function: ctor] }');
ctor.prototype.p = 1;
assert.equal(util.inspect(ctor), '[Constructor: ctor]');
// check redundent constructor is hidden
assert.equal(util.inspect(ctor, true), '{ [Constructor: ctor] [prototype]: { p: 1 } }');


// Complex quoting
assert.equal(util.inspect('""'), '\'""\'');
assert.equal(util.inspect("''"), "\"''\"");
assert.equal(util.inspect('""\''), '"\\"\\"\'"');
assert.equal(util.inspect("''\""), '"\'\'\\""');
assert.equal(util.inspect('\\'), "'\\\\'");

// Property name quoting
assert.equal(util.inspect({ $: 1 }), '{ $: 1 }');
assert.equal(util.inspect({ '$^': 1 }), "{ '$^': 1 }");
assert.equal(util.inspect({ '0': 1 }), "{ '0': 1 }");
assert.equal(util.inspect({ "'q'": 1 }), "{ \"'q'\": 1 }");
assert.equal(util.inspect({ '"q"': 1 }), "{ '\"q\"': 1 }");


// RegExp formatting
assert.equal(util.inspect(new RegExp), '/(?:)/');
var regexp = util.inspect(new RegExp, true);
assert.ok(regexp.indexOf('/(?:)/') != -1);
assert.ok(regexp.indexOf('[lastIndex]') != -1);
assert.ok(regexp.indexOf('[multiline]') != -1);
assert.ok(regexp.indexOf('[global]') != -1);
assert.ok(regexp.indexOf('[source]') != -1);
assert.ok(regexp.indexOf('[ignoreCase]') != -1);


// Accessor formatting
var getter = { get p(){} }
assert.equal(util.inspect(getter), '{ p: \u00ABGetter\u00BB }');
var setter = { set p(){} }
assert.equal(util.inspect(setter), '{ p: \u00ABSetter\u00BB }');
var accessor = { get p(){},	set p(v){} };
assert.equal(util.inspect(accessor), '{ p: \u00ABGetter/Setter\u00BB }');


// Circular references
var circular = {};
circular.p = circular;
assert.equal(util.inspect(circular), '{ p: \u00ABCircular\u00BB }');


// Recurse limit
var depth = { p1: { p2: { p3: { p4: {} } } } };
assert.equal(util.inspect(depth), '{ p1: { p2: { p3: \u00ABMore\u00BB } } }');
assert.equal(util.inspect(depth, null, 3), '{ p1: { p2: { p3: { p4: \u00ABMore\u00BB } } } }');