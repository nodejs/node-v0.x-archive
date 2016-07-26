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
var http = require('http');

var responseMessage = [
  'HTTP/1.1 200 OK',
  'Transfer-Encoding: chunked',
  '',
  '5',
  'hello',
  '0',
  '',
  '0',
  '',
  '',
].join('\r\n');

var expectedResult = 'hello';
var expectedBuff = new Buffer(responseMessage.slice(responseMessage.length - 5));
var responseError = false;
var requestError = false;
var leftOver = false;
var result = '';

var server = net.createServer(function(conn) {
  conn.end(responseMessage);
  server.close();
}).listen().on('listening', function() {
  var request = http.get({
    path: '/',
    port: server.address().port,
    method: 'GET',
  }, function(response) {
    response.setEncoding('utf8');
    response.on('data', function(d) {
      result += d;
    });
    response.on('error', function(err) {
      responseError = err;
      console.error('response error', err);
      console.error(response);
    });
    // hypothetical interface for 0.12 (maybe 0.10?)
    response.on('chunkedRemainingBytes', function(buff) {
      leftOver = buff;
      console.error('chunkedRemainingBytes', buff);
    });
  }).on('error', function(err) {
    /* This should never run, it's an example how to do this on older 0.10 and before */
    console.error(err);
    leftOver = err;
    requestError = err;
    var res = this.res;
    // backwards compatible way to detect if this is the case
    if (res.headers['transfer-encoding'] === 'chunked' &&
        res.complete === true &&
        err.code === 'HPE_INVALID_CONSTANT') {
      console.error('we have trailing bytes', err.bytesParsed);
    } else {
      console.error('request error', err);
    }
  });
});

process.on('exit', function() {
  assert.strictEqual(result, expectedResult);
  assert.strictEqual(responseError, false);
  assert.strictEqual(requestError, false);
  assert.deepEqual(leftOver, expectedBuff);
});
