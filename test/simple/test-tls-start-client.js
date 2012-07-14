var assert = require('assert');
var net = require('net');
var tls = require('tls');

var client = net.connect(443, 'google.com', function() {
	var encryptedStream = tls.start(client, function() {
		assert.ok(encryptedStream.authorized, "When connected, connection should yield authorized");
		client.end();
	});

});