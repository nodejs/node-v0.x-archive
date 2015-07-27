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

if (!process.versions.openssl) {
  console.error('Skipping because node compiled without OpenSSL.');
  process.exit(0);
}

var common = require('../common');
var assert = require('assert');

var http = require('http');
var https = require('https');

var urlSuffix = 'ccapi-preprod.cleverapps.io/v2/application.wadl';
var contents = {};

function readResponse(protocol, res) {
  var chunks = [];

  res.on('data', function(chunk) {
    chunks.push(chunk);
  });

  res.on('end', function() {
    contents[protocol] = Buffer.concat(chunks).toString('utf-8');
  });
}

http.get('http://' + urlSuffix, function(res) {
  readResponse('http', res);
}).on('error', function(err) {
  console.log(err.message);
  process.exit(1);
});

https.get('https://' + urlSuffix, function(res) {
  readResponse('https', res);
}).on('error', function(err) {
  console.log(err.message);
  process.exit(1);
});


process.on('exit', function() {
  assert.ok(
    typeof contents.http == 'string' &&
    contents.http.length > 0,
    'contents.http should be a non-empty string'
  );

  assert.ok(
    typeof contents.https == 'string' &&
    contents.https.length > 0,
    'contents.https should be a non-empty-string'
  );

  assert.equal(
    contents.http,
    contents.https,
    'contents.http and contents.https should be equal'
  );
});
