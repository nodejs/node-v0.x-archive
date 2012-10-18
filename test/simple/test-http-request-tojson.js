
var common = require('../common');
var assert = require('assert');
var http = require('http');

var server = http.createServer(function(req, res){
  var obj = JSON.parse(JSON.stringify(req));

  assert.deepEqual(obj, {
    method: 'GET',
    url: '/something',
    headers: { host: 'localhost:' + common.PORT, connection: 'keep-alive' },
    httpVersion: '1.1'
  });

  process.exit(0);
});

server.listen(common.PORT);

http.get({
  port: common.PORT,
  path: '/something'
});