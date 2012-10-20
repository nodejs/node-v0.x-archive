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
var fs = require('fs');
var got_error = false;
var success_count = 0;

if (!'statvfs' in fs) {
    process.exit(0);
}

// statvfs
fs.statvfs('.', function(err, stats) {
  if (err) {
    got_error = true;
  } else {
    console.dir(stats);
    success_count++;
  }
  assert(this === global);
});

// statvfsSync
var stats = fs.statvfsSync('.');
assert.ok('bfree' in stats);

// fstatvfs
fs.open('.', 'r', undefined, function(err, fd) {
  assert.ok(!err);
  assert.ok(fd);

  fs.fstatvfs(fd, function(err, stats) {
    if (err) {
      got_error = true;
    } else {
      console.dir(stats);
      success_count++;
      fs.close(fd);
    }
    assert(this === global);
  });

  assert(this === global);
});

// fstatvfsSync
fs.open('.', 'r', undefined, function(err, fd) {
  var stats;
  try {
    stats = fs.fstatvfsSync(fd);
  } catch (err) {
    got_error = true;
  }
  if (stats) {
    console.dir(stats);
    success_count++;
  }
  fs.close(fd);
});

process.on('exit', function() {
  assert.equal(3, success_count);
  assert.equal(false, got_error);
});

