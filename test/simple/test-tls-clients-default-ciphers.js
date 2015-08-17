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

/*
 * This is a regression test that highlights a problem where tls.connect would
 * not use the default ciphers suite when no ciphers was passed.
 *
 * This test makes sure that when connecting to a server that uses only the RC4
 * cipher, which was removed recently from the default ciphers suite, calls to
 * tls.connect that don't pass any ciphers fail to connect properly.
 */

var common = require('../common');
var assert = require('assert');
var tls = require('tls');
var https = require('https');
var path = require('path');
var fs = require('fs');

var KEYPATH = path.join(common.fixturesDir, 'keys', 'agent2-key.pem');
var KEY = fs.readFileSync(KEYPATH).toString();

var CERTPATH = path.join(common.fixturesDir, 'keys', 'agent2-cert.pem');
var CERT = fs.readFileSync(CERTPATH).toString();

var SERVER_OPTIONS = {
  key: KEY,
  cert: CERT,
  // RC4 was removed recently from the default ciphers list
  // due to security vulnerabilities. Set the server to only use this
  // cipher so that this test can make sure that tls clients
  // can't connect to it when they use default ciphers.
  ciphers: 'RC4-MD5',
};

/*
 * Uses "clientFn" with default ciphers to connect to TLS/HTTPS server
 * on port "port". Calls "callback" with an object as parameter
 * that has one property "allClientsFailed" that is true
 * if all clients connections/requests failed, false otherwise.
 */
function testClientWithDefaultCiphers(clientFn, port, callback) {
  // Use different forms of passing default ciphers to
  // tls connect: no 'ciphers' property, 'ciphers' with value 'null' and
  // 'ciphers' with value 'undefined'. Although we would think that these
  // semantically similar ways of passing no ciphers would trigger the same
  // behavior, in reality the implementation behaves differently, and
  // thus we need to keep all these forms in the test.
  var CLIENT_OPTIONS = [
    {
      rejectUnauthorized: false,
      ciphers: null
    },
    {
      rejectUnauthorized: false,
      ciphers: undefined
    },
    {
      rejectUnauthorized: false,
    }
  ];

  var nbClientErrors = 0;
  var callbackCalled = false;

  CLIENT_OPTIONS.forEach(function(clientOptionsObject) {
    clientOptionsObject.port = port;

    var conn = clientFn(clientOptionsObject, function onConnect() {
      callbackCalled = true;
      return callback({ allClientsFailed: false });
    });

    conn.on('error', function onClientError(err) {
      ++nbClientErrors;
      if (nbClientErrors === CLIENT_OPTIONS.length && !callbackCalled) {
        callbackCalled = true;
        return callback({ allClientsFailed: true });
      }
    });
  });
}

// Test that tls.connect uses default ciphers on the client properly
var tlsServer = new tls.Server(SERVER_OPTIONS);
tlsServer.listen(common.PORT, function () {
  testClientWithDefaultCiphers(tls.connect, common.PORT, function onTestsDone(results) {
    assert(results.allClientsFailed,
           'All TLS clients using default ciphers to server only ' +
           'supporting RC4 cipher should have failed');
    tlsServer.close();
  });
});

// Test that https.get uses default ciphers on the client properly
var httpsServer = new https.Server(SERVER_OPTIONS);
httpsServer.listen(common.PORT + 1, function () {
  testClientWithDefaultCiphers(https.get, common.PORT + 1, function onTestsDone(results) {
    assert(results.allClientsFailed,
           'All HTTPS clients using default ciphers to server only ' +
           'supporting RC4 cipher should have failed');
    httpsServer.close();
  });
});
