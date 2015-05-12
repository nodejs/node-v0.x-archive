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
var spawn = require('child_process').spawn;
var net = require('net');

// Node first tries to use IPV6 when the host is not specified
// and then falls back to IPV4 if that fails.  That causes
// the test to fail if IPV6 is not configured as we end up with
// an active handle for each of IPV6 and IPV4.  We will therefore
// bind specifically to the IP4 or IPV6 loopback as appropriate
var loopback = '::1';
if(!common.hasIPv6) {
  loopback = '127.0.0.1';
}

function expect(activeHandles, activeRequests) {
  assert.equal(process._getActiveHandles().length, activeHandles);
  assert.equal(process._getActiveRequests().length, activeRequests);
}

var handles = [];

(function() {
  expect(0, 0);
  var server = net.createServer().listen(loopback, common.PORT);
  expect(1, 0);
  server.close();
  expect(1, 0); // server handle doesn't shut down until next tick
  handles.push(server);
})();

(function() {
  function onlookup() {
    setImmediate(function() {
      assert.equal(process._getActiveRequests().length, 0);
    });
  };

  expect(1, 0);
  var conn = net.createConnection(loopback, common.PORT);
  conn.on('lookup', onlookup);
  conn.on('error', function() { assert(false); });
  expect(2, 1);
  conn.destroy();
  expect(2, 1); // client handle doesn't shut down until next tick
  handles.push(conn);
})();

(function() {
  var n = 0;

  handles.forEach(function(handle) {
    handle.once('close', onclose);
  });
  function onclose() {
    if (++n === handles.length) {
      // Allow the server handle a few loop iterations to wind down.
      // This test is highly dependent on the implementation of handle
      // closing. If this test breaks in the future, it does not
      // necessarily mean that Node is broken.
      setImmediate(function() {
        setImmediate(function() {
          assert.equal(process._getActiveHandles().length, 0);
        });
      });
    }
  }
})();
