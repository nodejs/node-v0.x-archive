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

fs.stat('.', function(err, stats) {
  if (err) {
    got_error = true;
  } else {
    console.dir(stats);
    assert.ok(stats.mtime instanceof Date);
    success_count++;
  }
  assert(this === global);
});

fs.stat('.', function(err, stats) {
  if (err) {
    got_error = true;
  } else {
    console.dir(stats);
    assert.ok(stats.mtime instanceof Date);
    success_count++;
  }
  assert(this === global);
}, true);

fs.stat('nonexisting_file', function(err, stats) {
  if (err) {
    assert.ok(err instanceof Error);
    success_count++;
  } else {
    got_error = true;
  }
  assert(this === global);
});

fs.stat('nonexisting_file', function(err, stats) {
  assert.equal(true, err);
  assert.equal(false, stats);
  assert(this === global);
  success_count++;
}, true);

fs.lstat('.', function(err, stats) {
  if (err) {
    got_error = true;
  } else {
    console.dir(stats);
    assert.ok(stats.mtime instanceof Date);
    success_count++;
  }
  assert(this === global);
});

// fstat
fs.open('.', 'r', undefined, function(err, fd) {
  assert.ok(!err);
  assert.ok(fd);

  fs.fstat(fd, function(err, stats) {
    if (err) {
      got_error = true;
    } else {
      console.dir(stats);
      assert.ok(stats.mtime instanceof Date);
      success_count++;
      fs.close(fd);
    }
    assert(this === global);
  });

  assert(this === global);
});

// fstatSync
fs.open('.', 'r', undefined, function(err, fd) {
  var stats;
  try {
    stats = fs.fstatSync(fd);
  } catch (err) {
    got_error = true;
  }
  if (stats) {
    console.dir(stats);
    assert.ok(stats.mtime instanceof Date);
    success_count++;
  }
  fs.close(fd);
});

console.log('stating: ' + __filename);
fs.stat(__filename, function(err, stats) {
  if (err) {
    got_error = true;
  } else {
    console.dir(stats);
    success_count++;

    console.log('isDirectory: ' + JSON.stringify(stats.isDirectory()));
    assert.equal(false, stats.isDirectory());

    console.log('isFile: ' + JSON.stringify(stats.isFile()));
    assert.equal(true, stats.isFile());

    console.log('isSocket: ' + JSON.stringify(stats.isSocket()));
    assert.equal(false, stats.isSocket());

    console.log('isBlockDevice: ' + JSON.stringify(stats.isBlockDevice()));
    assert.equal(false, stats.isBlockDevice());

    console.log('isCharacterDevice: ' + JSON.stringify(stats.isCharacterDevice()));
    assert.equal(false, stats.isCharacterDevice());

    console.log('isFIFO: ' + JSON.stringify(stats.isFIFO()));
    assert.equal(false, stats.isFIFO());

    console.log('isSymbolicLink: ' + JSON.stringify(stats.isSymbolicLink()));
    assert.equal(false, stats.isSymbolicLink());

    assert.ok(stats.mtime instanceof Date);
  }
});

process.on('exit', function() {
  assert.equal(8, success_count);
  assert.equal(false, got_error);
});
