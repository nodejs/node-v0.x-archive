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

var fs = require('fs');
var assert = require('assert');
var path = require('path');
var spawn = require('child_process').spawn;

var common = require('../common');

var file = path.join(common.tmpDir, 'read_stream_fifo.fifo');
var input = '1';
var output = '';

var mkfifoProcess = spawn('mkfifo',  [file]);
mkfifoProcess.on('exit', function (code) {
  if (code !== 0)
    // error just means that the test can't run on this system
    return console.error('failed to create fifo');

  process.on('exit', function() {
    fs.unlinkSync(file);
  });
  
  var W = fs.createWriteStream(file);
  W.write(input);

  var R = fs.createReadStream(file);
  R.on('data', function(data) {
    assert.equal(data, input);
    W.end();
  });
});
