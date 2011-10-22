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

// This tests for a variant of GH 892 which occurs when the HTTPS client
// request is fed data via a Stream's pipe() method. The request emits a
// 'pause' event but no subsequent 'drain' event, stalling the transmission.

var common = require('../common');
var assert = require('assert');

var https = require('https');
var fs = require('fs');
var path = require('path');

// create a blob of data to send over tls
// write it to a file so we can make a readStream out of it
var bytesToSend = 500000;
var testblob = new Buffer(bytesToSend);

var tlsOpts = {
  key: fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
  cert: fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem')
};

var port = 12122;

var bytesReceived = 0;
var timeout;

// open a tls server that will receive the data blob and report
// on the progress of the transfer
var server = https.createServer(tlsOpts, function (req, res) {
  res.writeHead(200);

  req.on('data', function(chunk) {
    bytesReceived += chunk.length;
    res.write(bytesReceived+'');
  });

  req.on('end', function() {
    assert.equal(bytesReceived, bytesToSend);
    clearTimeout(timeout);
    res.end();
  });

});

server.listen(port, function() {
  // POST the data blob to the server

  var reqopts = {
    host: 'localhost',
    port: port,
    path: '/',
    method: 'POST'
  };

  var req = https.request(reqopts, function(res) {
    res.on('end', function(chunk) {
      server.close();
    });
  });

  // listen for an error (although we don't expect one)
  req.on('error', function(e) {
    assert.fail(e);
  });

  // make a readable stream out of our test blob
  var testfile = path.join(common.fixturesDir, 'test.txt');
  fs.writeFileSync(testfile, testblob);
  process.on('exit', function() {
    fs.unlinkSync(testfile);
  });


  var fileStream = fs.createReadStream(testfile);

  // pipe the file stream into the TLS request
  fileStream.pipe(req);

  // detect stall with a timeout
  timeout = setTimeout(function() {
    fs.unlinkSync(testfile);
    assert.fail('TLS client POST stalled after '+bytesReceived+' of '+bytesToSend+' bytes');
  }, 1000);

});

