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
// testing that a TCP Socket can proxy write/pause/resume
// across a bidirectional proxy useing Socket.pipe

//TODO test error handling?


var sent = 0;
var client;
var pipe;
var pipeClient;
var conn;
var data = new Buffer(65536);

function write(from, to) {
  (function _write() {
    // because 'to' is paused from.write() will _eventualy_
    // return false
    var ret = from.write(data);
    sent += data.length;
    console.error(sent);
    if (ret === false) {
      // good, now resume
      to.hasResume = true;
      to.resume();
    } else {
      // need some kind of halt
      assert.ok(sent < 720896 * 2);
      process.nextTick(_write);
    }
  }());
}

// next test
setTimeout(function () {
  assert.strictEqual(client.hasResume, true);
  assert.strictEqual(conn.hasResume, true);
  assert.strictEqual(sent, 0);
  server.close();
  pipe.close();
  client.end();
  pipeClient.end();
}, 100);

// need a server
var server = net.Server(function(_conn) {
  conn = _conn;

  // pause
  conn.pause();

  // should only recive data after conn resumes
  conn.on('data', function(chunk) {
    assert.strictEqual(this.hasResume, true);
    sent -= chunk.length;
    // should never recived more data then was sent
    assert.ok(sent >= 0);
  });

  // write to the client until I get false, then resume the client
  write(conn, client);

});

server.listen(common.PORT + 1, function () {
  // need a proxy to send the data over
  pipe = net.Server(function(conn) {
    pipeClient = net.createConnection(common.PORT + 1, function () {
      // make it bi-directional
      pipeClient.pipe(conn).pipe(pipeClient);
    });
  });

  pipe.listen(common.PORT, function () {
    // need a client
    client = net.createConnection(common.PORT, function () {

      // pause
      client.pause();

      // should recive data after client resumes
      client.on('data', function(chunk) {
        assert.strictEqual(this.hasResume, true);
        sent -= chunk.length;
        // should never recived more data then was sent
        assert.ok(sent >= 0);
        if (sent === 0) {
          // write to the conn until I get false, then resume the conn 
          write(client, conn);
        }
      });
    });
  });
});

