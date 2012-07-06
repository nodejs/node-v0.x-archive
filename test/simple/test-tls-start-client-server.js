var assert = require('assert');
var net = require('net');
var common = require('../common');
var fs = require('fs');
var tls = require('tls');

function filenamePEM(n) {
  return require('path').join(common.fixturesDir, 'keys', n + '.pem');
}

function loadPEM(n) {
  return fs.readFileSync(filenamePEM(n));
}

var serverOptions = {
  key: loadPEM('agent2-key'),
  cert: loadPEM('agent2-cert')
};


var serverSecurelyConnected = false;
var clientSecurelyConnected = false;

net.createServer(function(socket) {
  var encryptedStream = tls.start(socket, serverOptions, true, function() {
    serverSecurelyConnected = true;
  });
}).listen(9999);



var client = net.connect(9999, function() {
  var encryptedStream = tls.start(client, function() {
    clientSecurelyConnected = true;
    if(serverSecurelyConnected) {
      process.exit(0);
    }
    assert.fail("Client connected securely to the server but server does "
                + "not know this", "Both client and server should be "
                + "connected", "tls.start failed");
	});
});

setTimeout(function() {
  assert.fail("tls.start failed, client has not been able to upgrade connection");
}, 100);