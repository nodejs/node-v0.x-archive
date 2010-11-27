common = require("../common");
assert = common.assert

http = require('http');
net = require('net');

server = http.createServer();

server.addListener('upgrade', function (req, socket, upgradeHead) {
  common.error('server got upgrade event');
  // We won't step propagation
  // (not return false)
  // And see - what will happen
  
  process.nextTick(function() {
    // Socket should be destroyed here
    // Because upgrade event wasn't catched
    // (Propagation was not stopped)
    
    assert.ok(socket.fd === null);
    server.close();
  });
});

server.listen(common.PORT, function () {
  var c = net.createConnection(common.PORT);

  c.addListener('connect', function () {
    common.error('client wrote message');
    c.write( "GET /blah HTTP/1.1\r\n"
           + "Upgrade: WebSocket\r\n"
           + "Connection: Upgrade\r\n"
           + "\r\n\r\nhello world"
           );
  });

  c.addListener('end', function () {
    c.end();
  });

  c.addListener('close', function () {
    common.error('client close');    
  });
});

