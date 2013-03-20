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
var mode_sync;
var is_windows = process.platform === 'win32';

// Need to hijack fs.open/close to make sure that things
// get closed once they're opened.
fs._openSync = fs.openSync;
fs.openSync = openSync;
fs._closeSync = fs.closeSync;
fs.closeSync = closeSync;

var openCount = 0;

function openSync() {
  openCount++;
  return fs._openSync.apply(fs, arguments);
}

function closeSync() {
  openCount--;
  return fs._closeSync.apply(fs, arguments);
}

// Rest the umask for testing
var mask = process.umask(0000);

// On Windows chmod is only able to manipulate read-only bit
if (is_windows) {
  mode_sync = 0600;    // read-write
} else {
  mode_sync = 0755;
}

var file1 = path.join(common.tmpDir, 'testWriteFileSync.txt');
var file2 = path.join(common.tmpDir, 'testAppendFileSync.txt');

// Remove the file if it exists
function removeFile(f) {
  try {
    fs.unlinkSync(f);
  } catch(err) {
    if(err && err.code !== 'ENOENT') {
      throw err;
    }
  }  
}

removeFile(file1);
removeFile(file2);

fs.writeFileSync(file1, '123', {mode: mode_sync});

var content = fs.readFileSync(file1, {encoding: 'utf-8'});
assert.equal('123', content);

console.log(fs.statSync(file1).mode);

assert.equal(mode_sync, fs.statSync(file1).mode & 0777);

// Test appendFileSync mode
fs.appendFileSync(file2, 'abc', {mode: mode_sync});

console.log(fs.statSync(file2).mode);

assert.equal(mode_sync, fs.statSync(file1).mode & mode_sync);

process.on('exit', function() {
  assert.equal(0, openCount);
  fs.unlinkSync(file1);
  fs.unlinkSync(file2);
});

