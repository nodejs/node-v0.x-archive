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

var Module = require('module');

var context = {};
var programmatic = new Module('programmatic');
module.initializeInContext(context);

assert.equal(typeof context.require, 'function', '`require` should exist');
assert.ok(context.module, '`module` should exist');
assert.equal(context.require.main, context.module, '`require.main` should reference the initialized `module` object');

var loadedModule = context.require('../fixtures/a.js');
assert.equal(42, loadedModule.number, 'Initialized `require` function should be able to load other modules');

assert.equal(module.__dirname, null, '`__dirname` should be `null` for programmatically-created modules');
assert.equal(module.__filename, null, '`__filename` should be `null` for programmatically-created modules');
