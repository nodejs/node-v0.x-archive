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

// These tests are to make sure that a TCP stream implements all the
// required functions and events of the Stream class
// testing that if the client is paused
// conn.write() will _eventualy_ return false

var hasResume = false;
var hasDrain = false;
var sent = 0;
var client;
var conn;

// next test
setTimeout(function () {
  assert.strictEqual(hasResume, true);
  assert.strictEqual(hasDrain, true);
  assert.strictEqual(sent, 0);
  server.close();
  client.end();
}, 100);

// need a server
var server = net.Server(function(_conn) {
  conn = _conn;
  var data = new Buffer(65536);

  // once the client resumes, conn should emit drain
  // because there was something in the write buffer
  conn.on('drain', function() {
    assert.strictEqual(hasResume, true);
    hasDrain = true;
  });

  (function write() {
    // because the client is paused conn.write should 
    // return false _eventualy_ 
    var ret = conn.write(data);
    sent += data.length;
    if (ret === false) {
      // good, now resume
      hasResume = true;
      client.resume();
    } else {
      // need some kind of halt
      assert.ok(sent < 720896 * 2);
      process.nextTick(write);
    }
  }());

});

server.listen(common.PORT, function() {
  // need a client
  client = net.createConnection(common.PORT, function () {
     // pause client
    client.pause();

    // should recive data after client resumes
    client.on('data', function(chunk) {
      assert.strictEqual(hasResume, true);
      sent -= chunk.length;
      // should never recived more data then was sent
      assert.ok(sent >= 0);
    });
  });
});
