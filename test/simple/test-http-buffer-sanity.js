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
var util = require('util');

var bufferSize = 5 * 1024 * 1024;
var measuredSize = 0;

var buffer = Buffer(bufferSize);
for (var i = 0; i < buffer.length; i++) {
  buffer[i] = i % 256;
}


var web = http.Server(function(req, res) {
  web.close();

  console.log(req.headers);

  var i = 0;

  req.on('data', function(d) {
    process.stdout.write(',');
    measuredSize += d.length;
    for (var j = 0; j < d.length; j++) {
      assert.equal(buffer[i], d[j]);
      i++;
    }
  });


  req.on('end', function() {
    res.writeHead(200);
    res.write('thanks');
    res.end();
    console.log('response with \'thanks\'');
  });

  req.connection.on('error', function(e) {
    console.log('http server-side error: ' + e.message);
    process.exit(1);
  });
});

var gotThanks = false;

web.listen(common.PORT, function() {
  console.log('Making request');

  var req = http.request({
    port:    common.PORT,
    method:  'GET',
    path:    '/',
    headers: { 'content-length': buffer.length }
  }, function(res) {
    console.log('Got response');
    res.setEncoding('utf8');
    res.on('data', function(string) {
      assert.equal('thanks', string);
      gotThanks = true;
    });
  });
  req.end(buffer);
});


process.on('exit', function() {
  assert.equal(bufferSize, measuredSize);
  assert.ok(gotThanks);
});
