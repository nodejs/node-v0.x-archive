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
var context = require('vm').runInNewContext;

// isArray
assert.equal(true, util.isArray([]));
assert.equal(true, util.isArray(Array()));
assert.equal(true, util.isArray(new Array()));
assert.equal(true, util.isArray(new Array(5)));
assert.equal(true, util.isArray(new Array('with', 'some', 'entries')));
assert.equal(true, util.isArray(context('Array')()));
assert.equal(false, util.isArray({}));
assert.equal(false, util.isArray({ push: function() {} }));
assert.equal(false, util.isArray(/regexp/));
assert.equal(false, util.isArray(new Error));
assert.equal(false, util.isArray(Object.create(Array.prototype)));

// isRegExp
assert.equal(true, util.isRegExp(/regexp/));
assert.equal(true, util.isRegExp(RegExp()));
assert.equal(true, util.isRegExp(new RegExp()));
assert.equal(true, util.isRegExp(context('RegExp')()));
assert.equal(false, util.isRegExp({}));
assert.equal(false, util.isRegExp([]));
assert.equal(false, util.isRegExp(new Date()));
assert.equal(false, util.isRegExp(Object.create(RegExp.prototype)));

// isDate
assert.equal(true, util.isDate(new Date()));
assert.equal(true, util.isDate(new Date(0)));
assert.equal(true, util.isDate(new (context('Date'))));
assert.equal(false, util.isDate(Date()));
assert.equal(false, util.isDate({}));
assert.equal(false, util.isDate([]));
assert.equal(false, util.isDate(new Error));
assert.equal(false, util.isDate(Object.create(Date.prototype)));

// isError
assert.equal(true, util.isError(new Error));
assert.equal(true, util.isError(new TypeError));
assert.equal(true, util.isError(new SyntaxError));
assert.equal(true, util.isError(new (context('Error'))));
assert.equal(true, util.isError(new (context('TypeError'))));
assert.equal(true, util.isError(new (context('SyntaxError'))));
assert.equal(false, util.isError({}));
assert.equal(false, util.isError({ name: 'Error', message: '' }));
assert.equal(false, util.isError([]));
assert.equal(false, util.isError(Object.create(Error.prototype)));

// isPrimitive
assert.equal(true, util.isPrimitive('a'));
assert.equal(true, util.isPrimitive(5));
assert.equal(true, util.isPrimitive(true));
assert.equal(true, util.isPrimitive(undefined));
assert.equal(true, util.isPrimitive(null));
assert.equal(true, util.isPrimitive(NaN));
assert.equal(true, util.isPrimitive(Infinity));
assert.equal(false, util.isPrimitive([]));
assert.equal(false, util.isPrimitive({}));
assert.equal(false, util.isPrimitive(/abc/));
assert.equal(false, util.isPrimitive(function() {}));
assert.equal(false, util.isPrimitive(new Date()));

// isNaN
assert.equal(true, util.isNaN('a'));
assert.equal(true, util.isNaN(undefined));
assert.equal(true, util.isNaN(NaN));
assert.equal(true, util.isNaN({}));
assert.equal(true, util.isNaN(/abc/));
assert.equal(true, util.isNaN(function() {}));
assert.equal(true, util.isNaN([1,2,3]));
assert.equal(false, util.isNaN([]));
assert.equal(false, util.isNaN(new Date()));
assert.equal(false, util.isNaN(5));
assert.equal(false, util.isNaN('5'));
assert.equal(false, util.isNaN('0xff'));
assert.equal(false, util.isNaN(true));
assert.equal(false, util.isNaN(null));
assert.equal(false, util.isNaN(Infinity));

// toNumber
assert.equal(255, util.toNumber('0xff'));
assert.equal(5, util.toNumber('5'));
assert.equal(5.5, util.toNumber('5.5'));
assert.equal(0, util.toNumber([]));
assert.equal(Infinity, util.toNumber(Infinity));
assert.equal(1, util.toNumber(true));
assert.equal(0, util.toNumber(false));
assert.equal(new Date().getTime(), util.toNumber(new Date()));
assert.ok(util.isNaN(util.toNumber('a')));
assert.ok(util.isNaN(util.toNumber(undefined)));
assert.ok(util.isNaN(util.toNumber(NaN)));
assert.ok(util.isNaN(util.toNumber({})));
assert.ok(util.isNaN(util.toNumber(function() {})));
assert.ok(util.isNaN(util.toNumber([1,2,3])));

// toInt32
assert.equal(255, util.toInt32('0xff'));
assert.equal(-1, util.toInt32(4294967295));
assert.equal(1410065408, util.toInt32(1e10));
assert.equal(5, util.toInt32('5'));
assert.equal(1, util.toInt32(true));
assert.equal(0, util.toInt32([]));
assert.equal(0, util.toInt32(Infinity));
assert.equal(0, util.toInt32(false));
assert.equal(0, util.toInt32(0));
assert.equal(0, util.toInt32(undefined));
assert.equal(0, util.toInt32(NaN));
assert.equal(0, util.toInt32({}));
assert.equal(0, util.toInt32(function() {}));
assert.equal(0, util.toInt32([1,2,3]));

// toUint32
assert.equal(255, util.toUint32('0xff'));
assert.equal(5, util.toUint32('5.5'));
assert.equal(1410065408, util.toUint32(1e10));
assert.equal(4294967291, util.toUint32(-5));
assert.equal(1, util.toUint32(true));
assert.equal(0, util.toUint32([]));
assert.equal(0, util.toUint32(Infinity));
assert.equal(0, util.toUint32(false));
assert.equal(0, util.toUint32(0));
assert.equal(0, util.toUint32(undefined));
assert.equal(0, util.toUint32(NaN));
assert.equal(0, util.toUint32({}));
assert.equal(0, util.toUint32(function() {}));
assert.equal(0, util.toUint32([1,2,3]));


// _extend
assert.deepEqual(util._extend({a:1}),             {a:1});
assert.deepEqual(util._extend({a:1}, []),         {a:1});
assert.deepEqual(util._extend({a:1}, null),       {a:1});
assert.deepEqual(util._extend({a:1}, true),       {a:1});
assert.deepEqual(util._extend({a:1}, false),      {a:1});
assert.deepEqual(util._extend({a:1}, {b:2}),      {a:1, b:2});
assert.deepEqual(util._extend({a:1, b:2}, {b:3}), {a:1, b:3});
