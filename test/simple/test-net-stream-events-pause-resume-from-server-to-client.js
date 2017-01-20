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
// here I am testing that if the conn is paused that the
// client.write() will _eventualy_ return false

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
  // pause conn
  conn.pause();

  // should recive data after conn resumes
  conn.on('data', function(chunk) {
    assert.strictEqual(hasResume, true);
    sent -= chunk.length;
    // should never recived more data then was sent
    assert.ok(sent >= 0);
  });

});

server.listen(common.PORT, function() {
  // need a client
  client = net.createConnection(common.PORT, function() {
    var data = new Buffer(65536);

    // once the conn resumes, client should emit drain
    // because there was something in the write buffer
    client.on('drain', function() {
      // this is less acurate then I would like, but...
      if (hasResume) {
        hasDrain = true;
      }
    });

    (function write() {
      // because the conn is paused client.write should
      // return false _eventualy_
      var ret = client.write(data);
      sent += data.length;
      if (ret === false) {
        // good, now resume
        hasResume = true;
        conn.resume();
      } else {
        // need some kind of halt
        assert.ok(sent < 720896 * 2);
        process.nextTick(write);
      }
    }());
  });
});
