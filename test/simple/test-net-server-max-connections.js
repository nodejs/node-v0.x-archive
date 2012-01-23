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

// This test creates MAX + EX connections to a server and sets the server's
// maxConnections property to MAX. The first MAX connections make it through
// and the last EX connections are rejected.
//
// It also tests that the server can accept more connections after it reaches
// its maximum and some are closed.

var MAX = 100;
var EX = MAX;
var ex = EX;
var count = 0;
var waits = [];
var close = false;
var closes = 0;
var some;


var server = net.createServer(function(connection) {
  console.log('connections: %d', server.connections);
  count++;
  connection.write('hey');
  waits.push(function() { connection.end(); });
});

server.maxConnections = MAX;

server.listen(common.PORT, function() {
  makeConnections(MAX + EX);
});


function makeConnections(num) {
  for (var i = 0; i < num; i++) {
    setTimeout(function() {

      var c = net.createConnection(common.PORT);
      var gotData = false;

      c.on('end', function() { c.end(); });

      c.on('data', function(b) {
        gotData = true;
        assert.ok(0 < b.length);
      });

      c.on('error', function(e) {
        console.error('error: %s', e);
      });

      c.on('close', function() {
        closes++;

        if (!gotData) {
          assert.equal(server.connections, MAX);
          if (!--ex || close) { closeConnections(); }
        }

        if (gotData && (--count === (MAX - some)) && !close) {
          close = true;

          // make sure the connections are closed
          var back = 1;
          (function backoff() {
            back *= 2;
            if (server.connections > count) {
              setTimeout(backoff, back);
            } else {
              makeConnections(MAX - count + 1);
            }
          }());

        }

      });

    }, i);
  }
}

function closeConnections() {
  if (!close) {
    assert.equal(waits.length, MAX);
    some = Math.floor(Math.random() * (MAX - 1) + 1);
    console.error('closing %d connections', some);
    for (var i = 0; i < some; i++) { (waits.shift())(); }
  } else {
    var cb;
    while (cb = waits.shift()) { cb(); }
    server.close();
  }
}

process.on('exit', function() {
  assert.equal(MAX + EX + some + 1, closes);
});
