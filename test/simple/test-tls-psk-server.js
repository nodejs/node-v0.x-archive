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
  console.error("Skipping because node compiled without OpenSSL.");
  process.exit(0);
}
if (parseInt(process.versions.openssl[0]) < 1) {
  console.error("Skipping because node compiled with old OpenSSL version.");
  process.exit(0);
}


var common = require('../common');
var assert = require('assert');

var join = require('path').join;
var net = require('net');
var fs = require('fs');
var crypto = require('crypto');
var tls = require('tls');
var spawn = require('child_process').spawn;

var connections = 0;
var pskey = "d731ef57be09e5204f0b205b60627028";
var identity = 'TestUser';

var PSKCiphers = 'PSK-AES256-CBC-SHA:PSK-3DES-EDE-CBC-SHA:PSK-AES128-CBC-SHA:PSK-RC4-SHA';

function log(a) {
  console.error('***server*** ' + a);
}

var server = net.createServer(function(socket) {
  connections++;
  log('connection fd=' + socket.fd);

  var sslcontext = crypto.createCredentials({});
  sslcontext.context.setCiphers(PSKCiphers);

  function serverCallback(id) {
    if (id == identity) {
      return new Buffer(pskey, 'hex');
    }
    return null;
  }
  sslcontext.context.setPskServerCallback(serverCallback);

  var pair = tls.createSecurePair(sslcontext, true);

  assert.ok(pair.encrypted.writable);
  assert.ok(pair.cleartext.writable);

  pair.encrypted.pipe(socket);
  socket.pipe(pair.encrypted);

  log('i set it secure');

  pair.on('secure', function() {
    log('connected+secure!');
    pair.cleartext.write('hello\r\n');
    log(pair.cleartext.getPeerCertificate());
    log(pair.cleartext.getCipher());
  });

  pair.cleartext.on('data', function(data) {
    log('read bytes ' + data.length);
    pair.cleartext.write(data);
  });

  socket.on('end', function() {
    log('socket end');
  });

  pair.cleartext.on('error', function(err) {
    log('got error: ');
    log(err);
    log(err.stack);
    socket.destroy();
  });

  pair.encrypted.on('error', function(err) {
    log('encrypted error: ');
    log(err);
    log(err.stack);
    socket.destroy();
  });

  socket.on('error', function(err) {
    log('socket error: ');
    log(err);
    log(err.stack);
    socket.destroy();
  });

  socket.on('close', function(err) {
    log('socket closed');
  });

  pair.on('error', function(err) {
    log('secure error: ');
    log(err);
    log(err.stack);
    socket.destroy();
  });
});

var gotHello = false;
var sentWorld = false;
var gotWorld = false;
var opensslExitCode = -1;

server.listen(common.PORT, function() {
  var client = spawn('openssl', ['s_client',
                                 '-connect', '127.0.0.1:' + common.PORT,
                                 '-psk', pskey,
                                 '-cipher', PSKCiphers,
                                 '-psk_identity', identity]);

  var out = '';

  client.stdout.setEncoding('utf8');
  client.stdout.on('data', function(d) {
    out += d;

    if (!gotHello && /hello/.test(out)) {
      gotHello = true;
      client.stdin.write('world\r\n');
      sentWorld = true;
    }

    if (!gotWorld && /world/.test(out)) {
      gotWorld = true;
      client.stdin.end();
    }
  });

  client.stdout.pipe(process.stdout, { end: false });
  client.stderr.pipe(process.stderr, { end: false });

  client.on('exit', function(code) {
    opensslExitCode = code;
    server.close();
  });
});

process.on('exit', function() {
  assert.equal(1, connections);
  assert.ok(gotHello);
  assert.ok(sentWorld);
  assert.ok(gotWorld);
  assert.equal(0, opensslExitCode);
});
