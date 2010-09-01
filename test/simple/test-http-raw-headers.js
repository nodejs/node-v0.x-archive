var common = require("../common");
var assert = common.assert;

var http = require('http');
var net = require('net');

var headers = '\
Host: www.example.org\r\n\
Accept-Encoding: gzip, deflate\r\n\
Accept-Language: en-us\r\n\
User-Agent: node test\r\n\
Connection: close\r\n\
';

var server = http.createServer(function(req, res) {
  assert.equal(headers, req.rawHeaders);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('EOF');
  server.close();
});

server.listen(common.PORT, function() {
  var client = net.createConnection(common.PORT);
  client.on('connect', function() {
    client.write('GET / HTTP/1.1\r\n');
    client.write(headers + '\r\n');
    client.end();
  });
});
