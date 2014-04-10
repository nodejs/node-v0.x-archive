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

// Regex to split a windows path into three parts: [*, device, slash,
// tail] windows-only

/* original:

  var splitDeviceRe =
    /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

*/

var splitDeviceRe =
  /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

// Regex to split the tail part of the above into [*, dir, basename, ext]
var splitTailRe =
  /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

var splitPath = function(filename) {
// Separate device+slash from tail
var result = splitDeviceRe.exec(filename),
    device = (result[1] || '') + (result[2] || ''),
    tail = result[3] || '';
// Split the tail into dir, basename and extension
var result2 = splitTailRe.exec(tail),
    dir = result2[1],
    basename = result2[2],
    ext = result2[3];
return [device, dir, basename, ext];
};

// Test

var assert = require('assert');

assert.equal(splitPath('/path/index.html')[3], '.html');
assert.equal(splitPath('////path/index.html')[3], '.html');
assert.equal(splitPath('///path/index.html')[3], '.html');
assert.equal(splitPath('//path/index.html')[3], '.html');
assert.equal(splitPath('////path////index.html')[3], '.html');
assert.equal(splitPath('//////path/////index.html')[3], '.html');
assert.equal(splitPath('/path/dir/dir/dir/index.html')[3], '.html');
assert.equal(splitPath('root/path/index.html')[3], '.html');