// Regression test for GH-1085
// https://github.com/joyent/node/issues/1085
//
// This test works by requestig a small file over HTTP and aborting the request
// into the data listener of the response. The purpose of this test is to make
// an abort call into the response data listner thou shalt not throw assertion
// errors in detachSocket().

var common = require('../common');
var http = require('http');

var opt = {
  host: 'nodejs.org',
  path: '/favicon.ico'
};

var req = http.get(opt, function (res) {
  res.addListener('data', function (chunk) {
    req.abort();
  });
});
