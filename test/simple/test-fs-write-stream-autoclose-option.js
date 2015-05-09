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
var path = require('path');
var fs = require('fs');

var file = path.join(common.tmpDir, 'write-autoclose-opt1.txt');
var stream = fs.createWriteStream(file, {flags: 'w+', autoClose: false});
stream.write('Test1');
stream.end();
stream.on('finish', function() {
  process.nextTick(function() {
    assert(!stream.closed);
    assert(stream.fd);
    next();
  });
});

function next() {
  // This will tell us if the fd is usable again or not
  stream = fs.createWriteStream(null, {fd: stream.fd, start:0 });
  stream.write('Test2');
  stream.end();
  stream.on('finish', function() {
    assert(stream.closed);
    assert(!stream.fd);
    process.nextTick(next2);
  });
}

function next2() {
  //This will test if after reusing the fd data is written properly
  fs.readFile(file, function(err, data) {
    assert(!err);
    assert.equal(data, 'Test2');
    process.nextTick(next3);
  });
}

function next3() {
  //This is to test success scenario where autoClose is true
  var stream = fs.createWriteStream(file, {autoClose: true});
  stream.write('Test3');
  stream.end();
  stream.on('finish', function() {
    process.nextTick(function() {
      assert(stream.closed);
      assert(!stream.fd);
    });
  });
}
