common = require("../common");
assert = common.assert;
net = require("net");
http = require("http");

var serverResponse = "";
var clientGotEOF = false;

server = http.createServer(function (req, res) {
  console.log('server req');
  assert.equal('/hello', req.url);
  assert.equal('GET', req.method);

  req.pause();

  var timeoutComplete = false;

  req.addListener('data', function (d) {
    console.log('server req data');
    assert.equal(true, timeoutComplete);
    assert.equal(12, d.length);
  });

  req.addListener('end', function (d) {
    console.log('server req end');
    assert.equal(true, timeoutComplete);
    res.writeHead(200);
    res.end("bye\n");
    server.close();
  });

  setTimeout(function () {
    timeoutComplete = true
    req.resume();
  }, 500);
});


server.listen(common.PORT, function () {
  var c = net.createConnection(common.PORT);

  c.setEncoding("utf8");

  c.addListener("connect", function () {
    c.write( "GET /hello HTTP/1.1\r\n"
           + "Content-Type: text/plain\r\n"
           + "Content-Length: 12\r\n"
           + "\r\n"
           + "hello world\n"
           );
    c.end();
  });

  c.addListener("data", function (chunk) {
    serverResponse += chunk;
  });

  c.addListener("end", function () {
    clientGotEOF = true;
  });

  c.addListener("close", function () {
    assert.equal(c.readyState, "closed");
  });
});


process.addListener("exit", function () {
  assert.ok(/bye/.test(serverResponse));
  assert.ok(clientGotEOF);
});
