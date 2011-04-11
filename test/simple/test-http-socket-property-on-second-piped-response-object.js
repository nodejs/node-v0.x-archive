var net = require('net'), http = require('http'), assert = require('assert');
var gotError = false;
var count = 0;

var server = http.createServer(function(req, res) {
  var id = ++count;
  assert.equal(typeof res.socket, 'object');
  assert.equal(typeof res.connection, 'object');
  setTimeout(function() {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('id: ' + id);
  }, (1 - count) * 1000);
});

server.on('clientError', function(e) {
  gotError = true;
});

server.listen(8080, '127.0.0.1', function() {
  var socket = net.createConnection(8080, '127.0.0.1');
  socket.setEncoding('utf8');
  socket.on('connect', function() {
    socket.write('GET / HTTP/1.1\r\n');
    socket.write('Host: localhost\r\n\r\n');
    socket.flush();
    socket.write('GET / HTTP/1.1\r\n');
    socket.write('Host: localhost\r\n\r\n');
    socket.flush();

    var buf = '';
    socket.on('data', function(data) {      
      buf += data;
    });
    socket.on('end', function() {
      server.close();
      var lines = buf.split('\r\n').filter(function(s) {
        return s.indexOf('id: ') === 0;
      });
      assert.equal(lines.length, 2);
      assert.equal(lines[0], 'id: 1');
      assert.equal(lines[1], 'id: 2');
    });

    setTimeout(function() {
      socket.end();
    }, 1000);
  });
});

process.on('exit', function() {
  assert.ok(!gotError);
});