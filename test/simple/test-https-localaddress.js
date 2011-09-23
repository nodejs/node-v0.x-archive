
var common = require('../common');

var https = require('https'),
    fs = require('fs'),
    assert = require('assert');
    
    
var options = {
  key: fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
  cert: fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem')
};

var server = https.createServer(options, function (req, res) {
    console.log("Connect from: " + req.connection.socket.remoteAddress);
    assert.equal('127.0.0.2', req.connection.socket.remoteAddress);
    
    req.on('end',function(){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('You are from: ' + req.connection.remoteAddress);
    });
});

server.listen(common.PORT, "127.0.0.1",function(){
    var options = {
	host: 'localhost',
	port: common.PORT,
	path: '/',
	method: 'GET',
	localAddress: '127.0.0.2'
    };

    var req = https.request(options, function(res) {
	res.on('end',function(){
	    server.close();
	    process.exit();
	});
    });
    req.end();
});
