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
var dns = require('dns');
var net = require('net');

var resolverCalled = false;
var connectionOK = false;

var server = net.createServer(function(client) {
  client.end();
  server.close();
});

function simpleResolver(host, options, callback) {
  resolverCalled = true;
  dns.lookup(host, options, callback);
}

server.listen(common.PORT, 'localhost', function() {
  var options = {
    port: common.PORT,
    host: 'localhost',
    resolver: simpleResolver
  };
  net.connect(options).on('connect', function() {
    connectionOK = true;
  });
});

process.on('exit', function() {
  assert(resolverCalled);
  assert(connectionOK);
});
