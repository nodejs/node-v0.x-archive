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
var net = require('net');
var fs = require('fs');
var dgram = require('dgram');

// Will cause a SEGFAULT if any context variables are not properly inialized
// before all their properties are setup.
process.addAsyncListener({
  create: function onAsync(ctx) {
    for (var i in ctx)
      ctx[i] = ctx[i];
  }
});


var test_list = [];
function register(fn) {
  test_list.push(fn);
}

function next() {
  if (test_list.length > 0)
    test_list.shift()();
}

setImmediate(next);


// These tests are going to cause create() to fire for different scenarios.

// Timers

process.nextTick(function() { });
setTimeout(function() { });
setTimeout(function() { }, 50);
var si = setInterval(function() { clearInterval(si); }, 10);
setImmediate(function() { });


// FS

fs.stat(__filename, function() { });


// NET

register(function() {
  var ns = net.createServer(function() {
    net.connect(common.PORT, function() {
      this.destroy();
      ns.close(next);
    });
  }).listen(common.PORT);
});


// UDP

register(function() {
  var us = dgram.createSocket('udp4');
  us.bind(common.PORT, function() {
    us.send(new Buffer('a'), 0, 0, 1, common.PORT, '', function() {
      us.close();
      next();
    });
  });
});
