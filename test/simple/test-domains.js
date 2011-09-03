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
var domain = require('domain');

var timerCalled = false;
var connectCallbackCalled = false;

console.log("default domain");

var d = domain.create({ hello: "world" }, function(a) {
  console.log("inside the domain");
  assert.deepEqual(a, { hello: "world" });

  setTimeout(function() {
    timerCalled = true;
  }, 1000);

  var socket = require('net').connect(80, "google.com", function() {
    connectCallbackCalled = true;
  });

  // It actually returned a socket.
  assert.ok(socket);

  throw new Error("synthetic error");
});


d.on("error", function(e) {
  assert.equal(e.message, "synthetic error");
  console.log("domain exited");
});


process.on('exit', function() {
  assert.equal(false, timerCalled);
  assert.equal(false, connectCallbackCalled);
});
