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
var common = require('../common.js');
var net = require('net');

// tiny node-tap lookalike.
var tests = [];
function test(name, fn) {
  tests.push([name, fn]);
}

function run() {
  var next = tests.shift();
  if (!next)
    return console.error('ok');

  var name = next[0];
  var fn = next[1];
  console.log('# %s', name);
  fn({
    same: assert.deepEqual,
    equal: assert.equal,
    end: run
  });
}

process.nextTick(run);

/////

test('large read', function(t) {
  var testLength = 1024*1024;

  var server = net.createServer();
  server.on('connection', function(socketIn) {
    readFlow(socketIn, testLength, function(data) {
      assert.notEqual(data, null);
      assert.equal(data.length, testLength);

      server.close();
      socketIn.end();

      t.end();
    });
  });

  server.listen(0, '127.0.0.1', function() {
    var port = server.address().port;

    var socketOut = new net.Socket();
    socketOut.connect(port, '127.0.0.1', function() {
      socketOut.write(new Buffer(testLength), function() {
        socketOut.end();
      });
    });
  });
});

test('late large read', function(t) {
  var testLength = 1024*1024;

  var server = net.createServer();
  server.on('connection', function(socketIn) {
    setTimeout(function() {
      readFlow(socketIn, testLength, function(data) {
        assert.notEqual(data, null);
        assert.equal(data.length, testLength);

        server.close();
        socketIn.end();

        t.end();
      });
    }, 2000);
  });

  server.listen(0, '127.0.0.1', function() {
    var port = server.address().port;

    var socketOut = new net.Socket();
    socketOut.connect(port, '127.0.0.1', function() {
      socketOut.write(new Buffer(testLength), function() {
        socketOut.end();
      });
    });
  });
});

function readFlow(readable, length, callback) {
  var res = readable.read(length);
  if (res) {
    callback(res);
    return;
  }

  readable.once('readable', readFlow.bind(null, readable, length, callback));
}
