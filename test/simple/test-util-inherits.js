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

// Classes Ready
function SuperClass() {
  this._flag = 'super';
}

SuperClass.prototype.beep = function() {
  this._beep = 'super';
}

// test case 1
function SubClassA() {
  this._flag = 'subA';
}
util.inherits(SubClassA, SuperClass);

SubClassA.prototype.beep = function() {
  this._beep = 'subA';
}

// test case 2
function SubClassB() {
  this._flag = 'subB';
}

SubClassB.prototype.beep = function() {
  this._beep = 'subB';
}
util.inherits(SubClassB, SuperClass);

// start to assert
var sup = new SuperClass();
sup.beep();
assert.equal(sup._flag, 'super');
assert.equal(sup._beep, 'super');

var subA = new SubClassA();
subA.beep();
assert.equal(subA._flag, 'subA');
assert.equal(subA._beep, 'subA');

var subB = new SubClassB();
subB.beep();
assert.equal(subB._flag, 'subB');
assert.equal(subB._beep, 'subB');

