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

var stream = require('stream');
var assert = require('assert');

// flag to check if 'end' event happened
var ended = false;

// some data
var data = new Buffer('here is some wonderful data\n');

// a readable stream that fetches data synchronously
var reader = new stream.Readable();
reader._read = function (n, cb) {
  if (n > data.length) n = data.length;        // prevent oob
  var read = data.slice(0, n);                 // get n bytes
  data = data.slice(n);                        // resize data source
  cb(null, read);
}

// set the flag
reader.on('end', function () {
  ended = true;
});

// check to see if the test passed
process.on('exit', function () {
  assert.strictEqual(ended, true);
});

// start reading
reader.pipe(process.stdout);
