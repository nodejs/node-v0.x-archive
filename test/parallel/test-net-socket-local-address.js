'use strict';
var common = require('../common');
var assert = require('assert');
var net = require('net');

var conns = 0;
var clientLocalPorts = [];
var serverRemotePorts = [];

var server = net.createServer(function(socket) {
  serverRemotePorts.push(socket.remotePort);
  conns++;
});

var client = new net.Socket();

server.on('close', function() {
  assert.deepEqual(clientLocalPorts, serverRemotePorts,
                   'client and server should agree on the ports used');
  assert.equal(2, conns);
});

server.listen(0, testConnect);

function testConnect() {
  if (conns == 2) {
    return server.close();
  }
  client.connect(server.address().port, server.address().addr, function() {
    clientLocalPorts.push(this.localPort);
    this.once('close', function() {
      setTimeout(testConnect, common.platformTimeout(100));
    });
    this.destroy();
  });
}
