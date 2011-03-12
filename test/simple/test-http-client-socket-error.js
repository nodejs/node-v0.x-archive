var common = require('../common');
var assert = require('assert');
var http = require('http');
var net = require("net");

var server = http.createServer(function(req, resp) {
  // TODO is there a better way to force a socket error?
  var options = {
    host: "localhost",
    port: -1,
    url: req.url,
    headers: req.headers,
    method: req.method
  };
  var req2 = http.request(options, function(backendResp) {});

  // capture the error to prevent a hard crash
  req2.on("error", function(exc) {});
});
server.listen(common.PORT, function() {
    var n = 0;
    var nmax = 2;

    for (var i = 0; i < nmax; i++) {
      setTimeout(function() {
        var sck = net.createConnection(common.PORT);
        sck.write("GET / HTTP/1.0\r\n\r\n");
        sck.end();
        sck.on("close", function() {
          if (++n == nmax) server.close();
        });
      }, 250 * i); // important! necessary to reuse pooled HTTPParser.
    };
});

