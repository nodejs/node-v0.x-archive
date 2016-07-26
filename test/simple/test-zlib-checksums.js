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

var common = require('../common.js');
var assert = require('assert');
var zlib = require('zlib');

// checksum functions

assert.equal(zlib.crc32('Test123'), 1072274215);
assert.equal(zlib.adler32('Test123'), 166330935);

assert.equal(zlib.crc32(new Buffer('Test123')), 1072274215);
assert.equal(zlib.adler32(new Buffer('Test123')), 166330935);

// stream interface should produce the same result.

var crc = zlib.createCRC32();
crc.write('Te');
crc.write('st');
crc.write('123');
crc.end();
assert.equal(crc.read(), 1072274215);

var adler = zlib.createAdler32();
adler.write('Te');
adler.write('st');
adler.write('123');
adler.end();
assert.equal(adler.read(), 166330935);
