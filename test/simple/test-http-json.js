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

// just some random object thing
var expect = {
  'üñîçø∂é': true,
  emojis: [ '1⃣', '☔', '🛃', '😻', '😆' ],
  number: 1,
  null: null,
  child: { foo: 'bar', object: { foo: 'bar' } },
  'qu"\'otes': [ '"', "'" ]
};

var expectLength = Buffer.byteLength(JSON.stringify(expect), 'utf8');

var server = http.createServer(function(req, res) {
  testIncoming(req, function() {
    res.json(expect);
  });

  server.close();
});


server.listen(common.PORT, function() {
  var req = http.request({
    host: 'localhost',
    port: common.PORT,
    path: '/',
    method: 'PUT'
  });

  req.on('response', function(res) {
    testIncoming(res, function() {
      // this is the end.
      console.log('ok');
    });
  });

  req.json(expect);
});


function testIncoming(message, cb) {
  assert.equal(message.headers['content-type'], 'application/json');
  assert.equal(+message.headers['content-length'], expectLength);

  // verify that it's the expected json
  message.setEncoding('utf8');
  var body = '';
  message.on('data', function(chunk) {
    body += chunk;
  });

  message.on('end', function() {
    body = JSON.parse(body);
    assert.deepEqual(body, expect);
    cb();
  });
}
