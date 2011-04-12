var common = require('../common');
var assert = require('assert');
var http = require('http');

var testServer = new http.Server(function(req, res) {
  res.writeHead(200);
  res.write('Hello world');
  res.end();
});

testServer.listen(common.PORT);

var request = http.get({
  host: 'localhost',
  port: common.PORT,
  path: '/',
}, function(response) {
  assert.equal(response.readable, true, 'response.readable initially true');
  response.on('end', function() {
    assert.equal(response.readable, false,
		 'response.readable set to false after end');
    testServer.close();
  });
});