var common = require('../common');
var assert = require('assert');
var http = require('http');

var gotEnd = false;

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.write('a');

  res.on('end', function() {
    gotEnd = true;
  });
});
server.listen(common.PORT);

server.addListener('listening', function() {
  http.get({
    port: common.PORT
  }, function(res) {
    res.on('data', function(data) {
      res.destroy();
      server.close();
    });
  });
});

process.on('exit', function() {
  assert.ok(gotEnd);
});
