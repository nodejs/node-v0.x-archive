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
var http = require('http');

var req_count = 0;

var server = http.createServer(function(req, res) {
  if (req.url === '/1.0') {
    assert.equal('1.0', req.httpVersion);
  }
  else {
    assert.equal('1.1', req.httpVersion);
  }

  req.on('end', function() {
    res.end();
    req_count++;
    if (req_count === 2) {
      server.close();
    }
  });
});
server.listen(common.PORT);

server.on('listening', function() {
  var req10 = http.request({
    port: common.PORT,
    method: 'GET',
    path: '/1.0',
    version: '1.0'
  });
  req10.write('\n');
  req10.end();

  var req11 = http.request({
    port: common.PORT,
    method: 'GET',
    path: '/1.1'
  });
  req11.write('\n');
  req11.end();
});
