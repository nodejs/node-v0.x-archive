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

var assert = require('assert');
var util = require('util');

var undef;

assert.ok(util.isArray([]));
assert.ifError(util.isArray(false));
assert.ifError(util.isArray(new Date()));
assert.ifError(util.isArray(function(){}));
assert.ifError(util.isArray(null));
assert.ifError(util.isArray(123));
assert.ifError(util.isArray({}));
assert.ifError(util.isArray(/[A-Z]/));
assert.ifError(util.isArray("str"));
assert.ifError(util.isArray(undef));

assert.ifError(util.isBoolean([]));
assert.ok(util.isBoolean(false));
assert.ifError(util.isBoolean(new Date()));
assert.ifError(util.isBoolean(function(){}));
assert.ifError(util.isBoolean(null));
assert.ifError(util.isBoolean(123));
assert.ifError(util.isBoolean({}));
assert.ifError(util.isBoolean(/[A-Z]/));
assert.ifError(util.isBoolean("str"));
assert.ifError(util.isBoolean(undef));

assert.ifError(util.isDate([]));
assert.ifError(util.isDate(false));
assert.ok(util.isDate(new Date()));
assert.ifError(util.isDate(function(){}));
assert.ifError(util.isDate(null));
assert.ifError(util.isDate(123));
assert.ifError(util.isDate({}));
assert.ifError(util.isDate(/[A-Z]/));
assert.ifError(util.isDate("str"));
assert.ifError(util.isDate(undef));

assert.ifError(util.isFunction([]));
assert.ifError(util.isFunction(false));
assert.ifError(util.isFunction(new Date()));
assert.ok(util.isFunction(function(){}));
assert.ifError(util.isFunction(null));
assert.ifError(util.isFunction(123));
assert.ifError(util.isFunction({}));
assert.ifError(util.isFunction(/[A-Z]/));
assert.ifError(util.isFunction("str"));
assert.ifError(util.isFunction(undef));

var fn1 = function(){}
var obj1 = new fn1();
var fn2 = function(){};
var obj2 = new fn2();

assert.ok(util.isInstanceOf(obj1, fn1));
assert.ifError(util.isInstanceOf(obj2, fn1));

assert.ifError(util.isNull([]));
assert.ifError(util.isNull(false));
assert.ifError(util.isNull(new Date()));
assert.ifError(util.isNull(function(){}));
assert.ok(util.isNull(null));
assert.ifError(util.isNull(123));
assert.ifError(util.isNull({}));
assert.ifError(util.isNull(/[A-Z]/));
assert.ifError(util.isNull("str"));
assert.ifError(util.isNull(undef));

assert.ifError(util.isNumber([]));
assert.ifError(util.isNumber(false));
assert.ifError(util.isNumber(new Date()));
assert.ifError(util.isNumber(function(){}));
assert.ifError(util.isNumber(null));
assert.ok(util.isNumber(123));
assert.ifError(util.isNumber({}));
assert.ifError(util.isNumber(/[A-Z]/));
assert.ifError(util.isNumber("str"));
assert.ifError(util.isNumber(undef));

assert.ifError(util.isObject([]));
assert.ifError(util.isObject(false));
assert.ifError(util.isObject(new Date()));
assert.ifError(util.isObject(function(){}));
assert.ifError(util.isObject(null));
assert.ifError(util.isObject(123));
assert.ok(util.isObject({}));
assert.ifError(util.isObject(/[A-Z]/));
assert.ifError(util.isObject("str"));
assert.ifError(util.isObject(undef));

assert.ifError(util.isRegExp([]));
assert.ifError(util.isRegExp(false));
assert.ifError(util.isRegExp(new Date()));
assert.ifError(util.isRegExp(function(){}));
assert.ifError(util.isRegExp(null));
assert.ifError(util.isRegExp(123));
assert.ifError(util.isRegExp({}));
assert.ok(util.isRegExp(/[A-Z]/));
assert.ifError(util.isRegExp("str"));
assert.ifError(util.isRegExp(undef));

assert.ifError(util.isString([]));
assert.ifError(util.isString(false));
assert.ifError(util.isString(new Date()));
assert.ifError(util.isString(function(){}));
assert.ifError(util.isString(null));
assert.ifError(util.isString(123));
assert.ifError(util.isString({}));
assert.ifError(util.isString(/[A-Z]/));
assert.ok(util.isString("str"));
assert.ifError(util.isString(undef));

assert.ifError(util.isUndefined([]));
assert.ifError(util.isUndefined(false));
assert.ifError(util.isUndefined(new Date()));
assert.ifError(util.isUndefined(function(){}));
assert.ifError(util.isUndefined(null));
assert.ifError(util.isUndefined(123));
assert.ifError(util.isUndefined({}));
assert.ifError(util.isUndefined(/[A-Z]/));
assert.ifError(util.isUndefined("str"));
assert.ok(util.isUndefined(undef));

assert.equal(util.typeOf(undef), 'undefined');
assert.equal(util.typeOf("str"), 'string');
assert.equal(util.typeOf(/[A-Z]/), 'regexp');
assert.equal(util.typeOf({}), 'object');
assert.equal(util.typeOf(123), 'number');
assert.equal(util.typeOf(null), 'null');
assert.equal(util.typeOf(function(){}), 'function');
assert.equal(util.typeOf(new Date()), 'date');
assert.equal(util.typeOf(false), 'boolean');
assert.equal(util.typeOf([]), 'array');
