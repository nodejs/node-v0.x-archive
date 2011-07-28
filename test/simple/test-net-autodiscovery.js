var common = require('../common');
var assert = require('assert');
var net = require('net');

server1 = net.createServer();
server2 = net.createServer({autoDiscovery: true});

var i = 0;
function check() {
  i++;
  if (i != 2) {
    return;
  }
  
  var addr1 = server1.address();
  var addr2 = server2.address();
  
  server1.close();
  server2.close();
  
  assert.equal(addr1.port, common.PORT);
  assert.notEqual(addr2, null);
  assert.notEqual(addr2.port, common.PORT);
  
}

server1.on('listening', check);
server2.on('listening', check);

server1.on('error', function(err) {
  assert.ifError(err);
  
  if(server1.fd) server1.close();
  if(server2.fd) server2.close();
});
server2.on('error', function(err) {
  assert.ifError(err);
  
  if(server1.fd) server1.close();
  if(server2.fd) server2.close();
});

server1.listen(common.PORT);
server2.listen(common.PORT);
