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

// test reading from a zlib stream using string encoding.

var common = require('../common.js');
var assert = require('assert');
var zlib = require('zlib');
var path = require('path');

var gunzip = zlib.createGunzip({encoding:'hex'});

var fs = require('fs');

var fixture = path.resolve(common.fixturesDir, 'person.jpg.gz');
var unzippedFixture = path.resolve(common.fixturesDir, 'person.jpg');
var expect = fs.readFileSync(unzippedFixture, 'hex');
var actual = '';

var inp = fs.createReadStream(fixture).pipe(gunzip);

inp.on('data', function(data) {
  assert.equal(typeof data, 'string', 'data should be a string');
  actual += data;
});

process.on('exit', function() {
  assert(actual.length > 0, 'data should have been read');
  assert.equal(actual, expect, 'encoded file strings should match');
});
