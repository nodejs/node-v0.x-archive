common = require("../common");
assert = common.assert;
net  = require('net');
http = require('http');

server = http.createServer(function (req, res) {
  assert.equal(req.method, "M-SEARCH");
  assert.equal(req.url, "*");

  res.writeHead(200, { Connection : 'close' });
  res.end();
});
server.listen(common.PORT, function () {

  stream = net.createConnection(common.PORT);
  body = "";
  stream.setEncoding("ascii");
  stream.on("data", function (chunk) { body += chunk; });
  stream.on("end", function () {
    server.close();
  });
  stream.write(
    'M-SEARCH * HTTP/1.1\r\n'+
    'HOST: 239.255.255.250:1900\r\n'+
    'MAN: "ssdp:discover"\r\n'+
    'MX: 3\r\n'+
    'ST: urn:schemas-upnp-org:device:InternetGatewayDevice:1\r\n'+
    '\r\n'
  );
});
