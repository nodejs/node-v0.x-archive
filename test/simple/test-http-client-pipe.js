var common = require('../common');
var assert = require('assert');
var http = require('http');
var stream = require('stream');
var util = require('util');

function SlowStream() {
  stream.Stream.call(this);
  this.writable = true;
  this.output = '';
}
util.inherits(SlowStream, stream.Stream);

SlowStream.prototype.write = function(buffer) {
  this.output += buffer.toString();
  console.log('wrote data.');
  var self = this;
  this.emit('pause');
  setTimeout(function() {
    self.emit('drain');
  }, 100);
};

SlowStream.prototype.end = function() {
  testServer.close();
};

var chunks = ['hello ', 'world'];

var testServer = new http.Server(function(req, res) {
  res.writeHead(200);
  res.write(chunks[0]);
  process.nextTick(function() {
    res.write(chunks[1]);
    process.nextTick(function() {
      res.end();
    });
  });
});

testServer.listen(common.PORT);

var outputStream = new SlowStream();

var request = http.get({
  host: 'localhost',
  port: common.PORT,
  path: '/',
}, function(response) {
  response.on('data', function() { console.log('got some data'); });
  // If response.readable isn't being properly set to false, this will
  // cause an error, because the final time .resume() is called on the
  // response the underlying socket will already be closed.
  response.pipe(outputStream);
});
request.end();

process.addListener('exit', function() {
  assert.equal(outputStream.output, chunks.join(''));
});
