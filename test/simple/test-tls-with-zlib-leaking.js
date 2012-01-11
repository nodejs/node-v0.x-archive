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
var fs = require('fs');
var tls = require('tls');
var zlib = require('zlib');


function filenamePEM(n) {
  return require('path').join(common.fixturesDir, 'keys', n + '.pem');
}


function loadPEM(n) {
  return fs.readFileSync(filenamePEM(n));
}

var port = common.PORT,
    options = {
      key: loadPEM('agent2-key'),
      cert: loadPEM('agent2-cert')
    };

var server = tls.createServer(options, function(socket) {
  var deflate = zlib.createDeflate();

  deflate.write('123');
  socket.write('123');
  socket.destroy();
});

server.listen(port, function() {
  batch(100000, 300, function() {
    server.close();
  });
});

function request(done) {
  var socket = tls.connect(port, function() {
    socket.once('data', function() {
      done();
      socket.destroy();
    });
  });

  // Ignore errors
  socket.on('error', function() {});
}

function batch(num, parallel, done) {
  var started = 0,
      ended = 0;

  for (var i = 0; i < parallel; i++) {
    run(i);
  }

  function run(i) {
    if (++started >= num) return;

    request(function() {
      ended++;
      if (ended === num) done();
      if (ended > num) return;
      run(i);
    });
  }
}
