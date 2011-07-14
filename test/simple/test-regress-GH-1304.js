// Regression test for GH-1304
// https://github.com/joyent/node/issues/1304
//
// This test works by creating a HTTPS connection to a server, then aborting
// it. The purpose of this test is to have a tls module thou shalt not fail if
// the request is aborted.

var common = require('../common');
var https = require('https');

var opt = {
  host: 'encrypted.google.com',
  path: '/'
};

var req = https.get(opt, function (res) {
});

req.abort();
