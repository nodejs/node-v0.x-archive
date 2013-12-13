var dtls = require('dtls');
var fs = require('fs');
var util = require('util');

// ..\openssl.exe s_client -connect localhost:8000 -dtls1
// set NODE_DEBUG=cluster,dgram,net,http,fs,tls,dtls,module,timers node
var options = {
  key: fs.readFileSync('c:\\temp\\dtls-key.pem'),
  cert: fs.readFileSync('c:\\temp\\dtls-cert-self-signed.pem'),
  secureProtocol: "DTLSv1_server_method"
  // This is necessary only if using the client certificate authentication.
  //requestCert: true,

  // This is necessary only if the client uses the self-signed certificate.
  // ca: [ fs.readFileSync('client-cert.pem') ]
};

var server = dtls.createServer(options, function(cleartextStream) {
  console.log('server connected', cleartextStream.authorized ? 'authorized' : 'unauthorized');
  //cleartextStream.write("welcome!\n");
  //cleartextStream.setEncoding('utf8');
  //cleartextStream.pipe(cleartextStream);
});

// TODO:
// Change the handle.owner to the server ?
//
server.socket.on('message', function (msg, rinfo) {
  console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
  var answer = new Buffer("pong - " + msg);  
  server.socket.send(answer, 0, answer.length, rinfo.port, rinfo.address, function(err, bytes) {
	console.log("answer sent");
  });
});

console.log(util.inspect(server, false, null));

server.bind(8000, function() {
  console.log('server bound : port 8000');
});