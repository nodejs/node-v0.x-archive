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

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var common = require('../common');
var nodePath = process.execPath;
var copyPath = path.join(common.tmpDir, 'node-copy.exe');
var cluster = require('cluster');

if (cluster.isWorker) {
  cluster.worker.send({
    execPath: process.execPath,
  });

} else if (cluster.isMaster) {
  try {
    fs.unlinkSync(copyPath);
  }
  catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  fs.writeFileSync(copyPath, fs.readFileSync(nodePath));
  fs.chmodSync(copyPath, '0755');

  cluster.settings.execPath = copyPath

  // Fork worker
  var worker = cluster.fork();

  // Checks worker execPath
  worker.on('message', function(data) {
    assert.equal(data.execPath, copyPath);
    process.exit(0);
  });

  process.once('exit', function() {
    fs.unlinkSync(copyPath);
  });
}
