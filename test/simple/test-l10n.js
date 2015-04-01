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

var bundle = require('_bundle');
var assert = require('assert');

// right now we only support english

if (bundle.icu) {
// ICU is present, the strings will be localized
assert.equal('English Testing',
             bundle('TEST', 'Foo'));

assert.equal('ROOT abc 1',
             bundle('TEST2', 'Foo', "abc", 1));

assert.equal('Fallback',
             bundle('TEST3', 'Fallback'));

} else {
// ICU is not present, the fallbacks will be used
assert.equal('Foo',
             bundle('TEST', 'Foo'));

assert.equal('Foo abc 1',
            bundle('TEST2', 'Foo', "abc", 1));

assert.equal('Fallback',
            bundle('TEST3', 'Fallback'));
}
