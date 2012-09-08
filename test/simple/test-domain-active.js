
var domain = require('domain');
var http = require('http');
var assert = require('assert');
var common = require('../common');

var server = http.createServer(function (req, res) {
  var d = domain.create();
      d.add(req);
      d.add(res);

    d.run(function () {
        d.on('error', function (err) {
            d.dispose();
            domainDisposed = true;
        });
        throw new Error('error in route');
    });
});

var closeEmitted = false;
var domainDisposed = false;

server.listen(common.PORT, '127.0.0.1', function () {
    var href = 'http://127.0.0.1:' + common.PORT;
    var req = http.get(href, function () { });

    req.once('error', function (err) {
        // expect domain.active to be null or undefined
        assert(!domain.active);

        server.close(function () {
            closeEmitted = true;
        });
    });
});

process.once('exit', function () {
  assert(closeEmitted);
  assert(domainDisposed);
});
