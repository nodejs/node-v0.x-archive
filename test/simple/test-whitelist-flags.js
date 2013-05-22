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

var common = require('../common');
var assert = require('assert');
var execFile = require('child_process').execFile;
var node = process.execPath;

var normal = ["-e", "console.log(\"ok\");"];
var binding = ["-e", "require(\"http\");"];
var whiteOk = ['--whitelist', 'natives.*;evals.*;process.*;'
    +'buffer.*;tty_wrap.*;pipe_wrap.*;constants.*;timer_wrap.*'
    +';cares_wrap.*;signal_wrap.*;'].concat(normal);
var whiteShow = ['--show-whitelist-err', '--whitelist', whiteOk[1]]
        .concat(binding);
var whiteShowSub = ['--show-whitelist-err', '--whitelist',
    whiteOk[1]+'http_parser.HTTPParser;'].concat(binding);

//Since this is a whitelist test, it relies on which native modules are
//loaded during the startup process. If the startup chain or the
//http_parser value order changes, these tests may need to be updated..

execFile(node, normal, function(er, stdout, stderr) {
  console.error('normal: show normal output');
  assert.equal(er, null);
  assert.equal(stdout, 'ok\n');
  assert.equal(stderr, '');
  console.log('normal ok');
});
execFile(node, whiteOk, function(er, stdout, stderr) {
  console.error('--whitelist: function is whitelisted');
  assert.equal(er, null);
  assert.equal(stdout, 'ok\n');
  assert.equal(stderr, '');
  console.log('whiteok ok');
});
execFile(node, whiteShow, function(er, stdout, stderr) {
  console.error('--show-whitelist-err: identify blacklisted values');
  assert.equal(er, null);
  assert.equal(stdout, '');
  assert.equal(stderr, 'Value http_parser.HTTPParser not in whitelist.\n');
  console.log('whiteshow ok');
});
execFile(node, whiteShowSub, function(er, stdout, stderr) {
  console.error('--show-whitelist-err: whitelist single element');
  console.log(whiteOk[1]+'http_parser.HTTPParser;');
  assert.equal(er, null);
  assert.equal(stdout, '');
  assert.equal(stderr, 'Value http_parser.HTTPParser.REQUEST not in whitelist.\n'+
                       'Value http_parser.HTTPParser.RESPONSE not in whitelist.\n');
  console.log('whiteshowsub ok');
});
