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
var path = require('path');
var fs = require('fs');

// These tests are to make sure that a TCP stream implements all the
// required functions and events of the Stream class
// testing that a TCP Socket can pipe a file from a client to a server
// conn and the server conn can pipe to a file

var write_file = path.join(common.tmpDir, 'write_person');
var read_file = path.join(common.fixturesDir, 'person.jpg');

var writeClosed = false;
var readEnded = false;
var readPaused = false;

// next test
setTimeout(function () {
  assert.strictEqual(writeClosed, true);
  assert.strictEqual(readEnded, true);
  //assert.strictEqual(readPaused, true); //TODO (maybe make a bigger file?)

  var actual_file = fs.readFileSync(read_file);
  var expected_file = fs.readFileSync(write_file);
  assert.deepEqual(expected_file, actual_file);

  //TODO make a test that goes the other way (server to client)
  server.close();
}, 500);

// need a server
var server = net.Server(function(conn) {
  var writeStream = fs.createWriteStream(write_file)
  conn.pipe(writeStream);

  // make sure the end from readStream gets to writeStream
  writeStream.on('close', function() {
    writeClosed= true;
  });
});

server.listen(common.PORT, function () {
  // need a client
  var readStream = fs.ReadStream(read_file, {bufferSize:10});

  // make sure the read stream ends
  readStream.on('end', function () {
    readEnded = true;
  });

  readStream.on('pause', function() {
    // make sure that we get a pushback from writeStream
    // at least once
    readPaused = true;
  });

  // readStream will emit end, so the client connection will end
  // it this does not happen the test will not exit becuase the
  // client is still open
  readStream.pipe(net.createConnection(common.PORT));
});

process.addListener('exit', function() {
  fs.unlinkSync(write_file);
});

