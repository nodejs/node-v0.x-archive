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
var tls = require('tls');

var serverPort = common.PORT;

var serverResults = [];
var clientResults = [];
var connectingIds = [];

var users = {
  UserA: new Buffer("d731ef57be09e5204f0b205b60627028", 'hex'),
  UserB: new Buffer("82072606b502b0f4025e90eb75fe137d", 'hex')
};


var serverOptions = {
  // configure a mixed set of cert and PSK ciphers
  ciphers: 'RC4-SHA:AES128-SHA:AES256-SHA:PSK-AES256-CBC-SHA:PSK-3DES-EDE-CBC-SHA:PSK-AES128-CBC-SHA:PSK-RC4-SHA',
  pskCallback: function(id) {
    connectingIds.push(id);
    if (id in users) {
      return users[id];
    }
  }
};

var clientOptions = [{
  pskIdentity: 'UserA',
  pskKey: users.UserA
},{
  pskIdentity: 'UserB',
  pskKey: users.UserB
},{
  pskIdentity: 'UserC',   // unrecognized user should fail handshake
  pskKey: users.UserB
},{
  pskIdentity: 'UserB',   // recognized user but incorrect secret should fail handshake
  pskKey: new Buffer("025e90eb75fe137d82072606b502b0f4", 'hex')
},{
  pskIdentity: 'UserB',
  pskKey: users.UserB
}];

var server = tls.createServer(serverOptions, function(c) {
  console.log('%s connected', c.pskIdentity);
  serverResults.push(c.pskIdentity + ' ' + (c.authorized ? 'authorized' : 'not authorized'));
  c.once('data', function(data) {
      assert.equal(data.toString(), 'Hi.');
      c.write('Hi ' + c.pskIdentity);
      c.once('data', function(data) {
        assert.equal(data.toString(), 'Bye.');
      });
  });
});
server.listen(serverPort, startTest);

function startTest() {
  function connectClient(options, callback) {
    console.log('connecting as %s', options.pskIdentity);
    var client = tls.connect(serverPort, 'localhost', options, function() {
      clientResults.push(client.pskIdentity + ' ' + (client.authorized ? 'authorized' : 'not authorized'));
      client.write('Hi.');
      client.on('data', function(data) {
        assert.equal(data.toString(), 'Hi ' + options.pskIdentity);
        client.end('Bye.');
      });
      callback();
    });
    client.on('error', function(err) {
      console.log('connection as %s rejected', options.pskIdentity);
      clientResults.push(err.message);
      callback(err);
    });
  }

  function doTestCase(tcnum) {
    if (tcnum >= clientOptions.length) {
      server.close();
    } else {
      connectClient(clientOptions[tcnum], function(err) {
        doTestCase(tcnum+1);
      });
    }
  }
  doTestCase(0);

}

process.on('exit', function() {
  assert.deepEqual(serverResults, ['UserA authorized',
                                   'UserB authorized',
                                   'UserB authorized']);
  assert.deepEqual(clientResults, ['UserA authorized',
                               'UserB authorized',
                               'remote host closed the connection',
                               'remote host closed the connection',
                               'UserB authorized']);
  assert.deepEqual(connectingIds, ['UserA',
                                   'UserB',
                                   'UserC',
                                   'UserB',
                                   'UserB']);
});
