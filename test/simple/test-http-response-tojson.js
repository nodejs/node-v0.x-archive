
var common = require('../common');
var assert = require('assert');
var http = require('http');

var server = http.createServer(function(req, res){
  res.statusCode = 400;
  res.setHeader('Content-Length', '5');
  res.setHeader('Content-Type', 'text/plain');

  var obj = JSON.parse(JSON.stringify(res));

  assert.deepEqual(obj, {
    statusCode: 400,
    headers: {
      'content-length': '5',
      'content-type': 'text/plain'
    }
  });
  
  process.exit(0);
});

server.listen(common.PORT);

http.get({
  port: common.PORT,
  path: '/something'
});