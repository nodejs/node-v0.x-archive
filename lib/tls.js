// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var util = require('util');

var tls_common = require('_tls_common');
debugger;

for (var attr in tls_common) {
	exports[attr] = tls_common[attr];
}

exports.DEFAULT_CIPHERS =
    'ECDHE-RSA-AES128-SHA256:AES128-GCM-SHA256:' + // TLS 1.2
    'RC4:HIGH:!MD5:!aNULL:!EDH';                   // TLS 1.0

// Public API
exports.TLSSocket = require('_tls_wrap').TLSSocket;
exports.Server = require('_tls_wrap').Server;
exports.createServer = require('_tls_wrap').createServer;
exports.connect = require('_tls_wrap').connect;

// Legacy API
exports.__defineGetter__('createSecurePair', util.deprecate(function() {
  return require('_tls_legacy').createSecurePair;
}, 'createSecurePair() is deprecated, use TLSSocket instead'));