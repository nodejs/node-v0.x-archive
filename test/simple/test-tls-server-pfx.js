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

var testCases =
    [
     { ca  : ['ca1-cert'],
       pfx: 'agent2',
       clients: [
         { ok: true, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, key: 'agent2-key', cert: 'agent2-cert' },
         { ok: false, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
     { ca  : ['ca2-cert'],
       pfx: 'agent2-ca2',
       clients: [
         { ok: false, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, key: 'agent2-key', cert: 'agent2-cert' },
         { ok: true, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
     { ca  : ['ca1-cert', 'ca2-cert'],
       pfx: 'agent2',
       clients: [
         { ok: true, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, key: 'agent2-key', cert: 'agent2-cert' },
         { ok: true, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
     { pfx: 'agent2-ca1',
       clients: [
         { ok: true, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, key: 'agent2-key', cert: 'agent2-cert' },
         { ok: false, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
     { pfx: 'agent2-ca2',
       clients: [
         { ok: false, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, key: 'agent2-key', cert: 'agent2-cert' },
         { ok: true, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
     { pfx: 'agent2-ca1',
       clients: [
         { ok: true, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, pfx : 'agent2'},
         { ok: false, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
     { pfx: 'agent2-ca2',
       clients: [
         { ok: false, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, pfx : 'agent2'},
         { ok: true, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
     { pfx: 'agent2-ca12',
       clients: [
         { ok: true, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, key: 'agent2-key', cert: 'agent2-cert' },
         { ok: true, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
     { pfx: 'agent2-ca12',
       clients: [
         { ok: true, key: 'agent1-key', cert: 'agent1-cert' },
         { ok: false, pfx : 'agent2'},
         { ok: true, key: 'agent3-key', cert: 'agent3-cert' }
       ]
     },
    ]

var common = require('../common');
var assert = require('assert');
var fs = require('fs');
var tls = require('tls');


function filenamePEM(n) {
  return require('path').join(common.fixturesDir, 'keys',  n + '.pem');
}


function loadPEM(n) {
  return fs.readFileSync(filenamePEM(n));
}

function filenamePFX(n) {
  return require('path').join(common.fixturesDir, 'keys',  n + '.pfx');
}


function loadPFX(n) {
  return fs.readFileSync(filenamePFX(n));
}
var successfulTests = 0;

function testClients(index, clients, serverOptions, cb) {
  var clientOptions = clients[index];
  if (!clientOptions) {
    cb();
    return;
  }

  var ok = clientOptions.ok;

  if (clientOptions.key) {
    clientOptions.key = loadPEM(clientOptions.key);
  }

  if (clientOptions.cert) {
    clientOptions.cert = loadPEM(clientOptions.cert);
  }

  if (clientOptions.pfx) {
    clientOptions.pfx = loadPFX(clientOptions.pfx);
  }

  clientOptions.port = common.PORT;
  serverOptions.requestCert  = true;

  var server = tls.createServer(serverOptions, function(s) {
    console.error('expected: ' + ok + ' authed: ' + s.authorized);
    assert.equal(ok, s.authorized);
    s.end('hello world\n');
  });

  server.listen(common.PORT, function() {
    var b = '';

    console.error('connecting...');
    var client = tls.connect(clientOptions, function() {
      server.close();
    });

    client.on('data', function(d) {
      b += d.toString();
    });

    client.on('end', function() {
      assert.equal('hello world\n', b);
    });

    client.on('close', function() {
      testClients(index + 1, clients, serverOptions, cb);
    });
  });
}


function runTest(testIndex) {
  var tcase = testCases[testIndex];
  if (!tcase) return;

  var serverOptions = {
    port: common.PORT,
    pfx: tcase.pfx ? loadPFX(tcase.pfx) : null,
    key: tcase.key ? loadPEM(tcase.key) : null,
    cert: tcase.cert ? loadPEM(tcase.cert) : null,
    ca: tcase.ca ? tcase.ca.map(loadPEM) : [],
    passphrase : tcase.passphrase
  };


  testClients(0, tcase.clients, serverOptions, function() {
    successfulTests++;
    runTest(testIndex + 1);
  });
}


runTest(0);


process.on('exit', function() {
  console.log('successful tests: %d', successfulTests);
  assert.equal(successfulTests, testCases.length);
});
