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
var net = require('net');

// These tests are to make sure that a TCP Socket implements all the
// required functions and events of the Stream class

var hasResume = false;
var step = 0;

// next test
setTimeout(function () {
  assert.strictEqual(step, 3);
  server.close();
}, 100);

// need a server
var server = net.Server(function(conn) {

   // emit pause to push this up and down the pipe stream
  client.on('pause', function() {
    assert.strictEqual(step, 0);
    step += 1;
  });

  // pause
  conn.pause();

  // write should return false
  assert.strictEqual(conn.write(new Buffer(10)), false);

  // make sure I get a drain after resume
  conn.on('drain', function() {
    assert.strictEqual(step, 1);
    assert.strictEqual(hasResume, true);
    step += 1;
  });

  // resume in a bit
  setTimeout(function() {
    hasResume = true;
    conn.resume();
  },50);
});
server.listen(common.PORT);

//need a client
var client = net.createConnection(common.PORT).
    // the client should not get data until I resume the server
    on('data', function() {
      assert.strictEqual(hasResume, true);
      assert.strictEqual(step, 2);
      step += 1;
    });
