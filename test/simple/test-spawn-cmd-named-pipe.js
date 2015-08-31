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

// This test is intended for Windows only
if (process.platform != 'win32') {
  console.log('Skipping Windows-only test');
  return;
}

var common = require('../common');
var assert = require('assert');

function parent() {
  var net = require('net');
  var spawn = require('child_process').spawn;

  var stdinPipeName = '\\\\.\\pipe\\test.' + process.pid + '.stdin';
  var stdoutPipeName = '\\\\.\\pipe\\test.' + process.pid + '.stdout';

  var stdinPipeServer = net.createServer(function(c) {
    console.log('stdinPipeServer connected');
    c.on('end', function() {
      console.log('stdinPipeServer disconnected');
    });
    c.end('hello');
  });
  stdinPipeServer.listen(stdinPipeName);

  var output = [];
  var gotResponse = false;
  
  var stdoutPipeServer = net.createServer(function(c) {
    console.log('stdoutPipeServer connected');
    c.on('data', function(x) {
      console.log('got data:', x.toString());
      output.push(x);
    });
    c.on('end', function() {
      console.log('stdoutPipeServer disconnected');
      gotResponse = (output.join('') == 'hello');
    });
  });
  stdoutPipeServer.listen(stdoutPipeName);

  var comspec = process.env['comspec'];
  if (!comspec || comspec.length == 0) {
    console.log('Failed to get COMSPEC');
    process.exit(1);
  }

  var args = ['/c', process.execPath, __filename, 'child',
              '<', stdinPipeName, '>', stdoutPipeName];

  var child = spawn(comspec, args);

  child.on('exit', function(exitCode) {
    stdinPipeServer.close();
    stdoutPipeServer.close();
    assert(exitCode == 0);
    assert(gotResponse);
    console.log('ok');
  });
}

function child() {
  process.stdin.pipe(process.stdout);
}

if (!process.argv[2]) {
  parent();
} else {
  child();
}
