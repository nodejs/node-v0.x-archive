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
var domains = require('domains');
var net = require('net');

var packets = 0;
 
domains.create(null, function() {
  var domain = this;

  // Each connection to the server infinitely receives 'hello world' lines.
  var server = net.Server(function(connection) {
    setInterval(function() {
      connection.write("hello world\n");
    }, 1);
  });

  function handleData(d) {
    packets++;
    if (packets == 1000) {
      domain.kill();
    }
  }

  server.listen(common.PORT, function() {
    var c1 = net.connect(common.PORT, function() {
      c1.on('data', handleData);
    });

    var c2 = net.connect(common.PORT, function() {
      c2.on('data', handleData);
    });

    var c3 = net.connect(common.PORT, 'localhost', function() {
      c3.on('data', handleData);
    });
  });
});

process.on('exit', function() {
  assert.equal(1000, packets);
});
