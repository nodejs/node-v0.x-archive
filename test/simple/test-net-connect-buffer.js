var common = require('../common');
var assert = require('assert');
var net = require('net');

var tcpPort = common.PORT;
var fooWritten = false;
var connectHappened = false;

var tcp = net.Server(function(s) {
  tcp.close();

  console.log('tcp server connection');

  var buf = '';
  s.on('data', function(d) {
    buf += d;
  });

  s.on('end', function() {
    assert.equal('foobar', buf);
    console.log('tcp socket disconnect');
    s.end();
  });

  s.on('error', function(e) {
    console.log('tcp server-side error: ' + e.message);
    process.exit(1);
  });
});

tcp.listen(common.PORT, function () {
  var socket = net.Stream();

  console.log('Connecting to socket');

  socket.connect(tcpPort, function() {
    console.log('socket connected');
    connectHappened = true;
  });

  assert.equal('opening', socket.readyState);

  var r = socket.write('foo', function () {
    fooWritten = true;
    assert.ok(connectHappened);
    console.error("foo written");
  });

  assert.equal(false, r);
  socket.end('bar');

  assert.equal('opening', socket.readyState);
});

process.on('exit', function () {
  assert.ok(connectHappened);
  assert.ok(fooWritten);
});
