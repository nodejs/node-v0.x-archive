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
// testing that a TCP Socket pipe a file to a client and from a server

var write_file = path.join(common.tmpDir, 'write_person');
var read_file = path.join(common.fixturesDir, 'person.jpg');

var writeEnded = false;
var readEnded = false;

// next test
setTimeout(function () {
  assert.strictEqual(writeEnded, true);
  assert.strictEqual(readEnded, true);
  //TODO read the file, make sure it all got there
  //TODO make a test that goes the other way (server to client)
  //TODO make sure that we get a pause/drain cycle
  server.close();
}, 1000);

// need a server
var server = net.Server(function(conn) {
  var writeStream = fs.createWriteStream(write_file)
  conn.pipe(writeStream);

  conn.on('close', function(){
    // no close -> end?
    writeStream.end();
  })
  writeStream.on('end', function() {
    writeEnded = true;
  });
});

server.listen(common.PORT, function () {
  // need a client
  var readStream = fs.ReadStream(read_file, {bufferSize:10});
  readStream.on('end', function () {
    readEnded = true;
  });
  // Will this work?  Are there timeing problems in the real world?
  // do I have to wait for connect?  How is that accomplished?
  readStream.pipe(net.createConnection(common.PORT));
});

