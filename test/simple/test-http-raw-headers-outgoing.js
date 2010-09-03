var common = require("../common");
var assert = common.assert;

var http = require('http');
var net = require('net');

var assertions = [], currentAssertion;

assertRawHeaders({
  sent:     [],
  received: ['Connection: close',
             'Transfer-Encoding: chunked']
});

assertRawHeaders({
  sent:     ['Content-Length: 3'],
  received: ['Content-Length: 3',
             'Connection: close']
});

assertRawHeaders({
  sent:     ['Set-Cookie: a=b; path=/; expires=Thu, 02-Sep-2010 21:24:00 GMT',
             'SET-COOKIE: c=d; path=/; expires=Sun, 17-Jan-2038 19:14:07 GMT'],
  received: ['Set-Cookie: a=b; path=/; expires=Thu, 02-Sep-2010 21:24:00 GMT',
             'SET-COOKIE: c=d; path=/; expires=Sun, 17-Jan-2038 19:14:07 GMT',
             'Connection: close',
             'Transfer-Encoding: chunked']
});

assertRawHeaders({
  sent:     ['Set-Cookie: a=b; path=/; expires=Thu, 02-Sep-2010 21:24:00 GMT',
             'Connection: keep-alive',
             'SET-COOKIE: c=d; path=/; expires=Sun, 17-Jan-2038 19:14:07 GMT'],
  received: ['Set-Cookie: a=b; path=/; expires=Thu, 02-Sep-2010 21:24:00 GMT',
             'Connection: keep-alive',
             'SET-COOKIE: c=d; path=/; expires=Sun, 17-Jan-2038 19:14:07 GMT',
             'Transfer-Encoding: chunked'],

  callback: function(req, res) {
    assert.equal(true, res.chunkedEncoding);
  }
});

assertRawHeaders({
  sent:     ['Set-Cookie: a=b; path=/; expires=Thu, 02-Sep-2010 21:24:00 GMT',
             'SET-COOKIE: c=d; path=/; expires=Sun, 17-Jan-2038 19:14:07 GMT',
             'Transfer-Encoding: gzip'],
  received: ['Set-Cookie: a=b; path=/; expires=Thu, 02-Sep-2010 21:24:00 GMT',
             'SET-COOKIE: c=d; path=/; expires=Sun, 17-Jan-2038 19:14:07 GMT',
             'Transfer-Encoding: gzip',
             'Connection: close'],

  callback: function(req, res) {
    assert.equal(true, !res.chunkedEncoding);
  }
});



function assertRawHeaders(options) {
  assertions.push({
    headersForResponse: options.sent.concat("").join("\r\n"),
    shouldEqual: options.received.concat("").join("\r\n"),
    callback: options.callback || function() {}
  });
}

var server = http.createServer(function(req, res) {
  res.rawHeaders = currentAssertion.headersForResponse;
  res.writeHead(200);
  currentAssertion.callback(req, res);
  res.end('EOF');
});

server.listen(common.PORT, function() {
  performNextRequest();
});

function performNextRequest() {
  if (currentAssertion = assertions.shift()) {
    var client = http.createClient(common.PORT, '127.0.0.1');
    var request = client.request('GET', '/');
    request.on("response", function(res) {
      assert.equal(currentAssertion.shouldEqual, res.rawHeaders);
      performNextRequest();
    });
    request.end();

  } else {
    server.close();
  }
}
