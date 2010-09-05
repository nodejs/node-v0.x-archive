var common = require("../common");
var assert = common.assert;
var http = require("http");

var requestHeaders = '\
Host: www.example.org\r\n\
Connection: close\r\n\
User-Agent: node test\r\n';

var responseHeaders = '\
Connection: close\r\n\
Transfer-Encoding: chunked\r\n\
Set-Cookie: session=123; path=/; expires=Sun, 17-Jan-2038 19:14:07 GMT\r\n\
Content-Type: text/plain\r\n\
Set-Cookie: remember_me=1; path=/; expires=Sun, 17-Jan-2038 19:14:07 GMT\r\n';

var innerServer = http.createServer(function(req, res) {
  res.writeHead(200, responseHeaders);
  res.end('EOF');
  innerServer.close();
});

innerServer.listen(common.PORT+1, function() {
  var proxyServer = http.createServer(function(req, res) {
    assert.equal(requestHeaders, req.rawHeaders);

    var proxyClient = http.createClient(common.PORT+1);
    var proxyRequest = proxyClient.request(req.method, req.url, req.rawHeaders);

    proxyRequest.on('response', function(response) {
      res.writeHead(response.statusCode, response.rawHeaders);
      res.end('EOF');
      proxyServer.close();
    });

    proxyRequest.end();
  });

  proxyServer.listen(common.PORT, function() {
    var testClient = http.createClient(common.PORT);
    var testRequest = testClient.request('GET', '/', requestHeaders);

    testRequest.on('response', function(response) {
      assert.equal(responseHeaders, response.rawHeaders);
    });

    testRequest.end();
  });
});
