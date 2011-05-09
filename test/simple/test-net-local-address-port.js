var common = require('../common');
var assert = require('assert');

var net = require('net');

var conns = 0;

var server = net.createServer(function(socket) {
  conns++;
	assert.equal('127.0.0.1', socket.remoteAddress);
	assert.equal(common.MYPORT, socket.remotePort);
});

server.listen(common.PORT, 'localhost', function() {
	var connector = function(paraclient, completed) {
		client = net.createConnection.apply(net.createConnection, paraclient);	
		client.on('error', function(e) {
			for(var i in paraclient) {
				if (typeof paraclient[i] == 'object') {
					paraclient[i].bind.port = ++(common.MYPORT);	
//console.log("RESTART:"+e+":"+common.MYPORT);
					connector(paraclient, completed);
				}
			}
		})
		client.on('connect', function() {
      assert.equal('127.0.0.1', client.remoteAddress);
			assert.equal(common.PORT, client.remotePort);
      assert.equal('127.0.0.1', client.localAddress);
			assert.equal(common.MYPORT, client.localPort);
			client.end();
		});
		completed && client.on('end', completed);
		return client;
	}
//console.log('DDDD');
  var client = connector([common.PORT, 'localhost', { bind: { host: "localhost", port: common.MYPORT } }],
	  function() {
			common.MYPORT++;
//console.log('AAAA');
  		connector([common.PORT, { bind: { host: "localhost", port: common.MYPORT } }], 
				function() {
					common.MYPORT++;
//console.log('BBBB');
  				connector([common.PORT, 'localhost', { bind: { host: "localhost", port: common.MYPORT } }, function() { conns++; }], 
						function() {
							common.MYPORT++;
//console.log('CCCC');
							connector([common.PORT, { bind: { host: "localhost", port: common.MYPORT } }, function() { conns++; }], function() {
								common.MYPORT++;
								server.close();
							})
						})
				})	
    });
});

//console.log('XXXXXXXXXX'+conns);
process.exit(function() {
  assert.equal(6, conns);
});
