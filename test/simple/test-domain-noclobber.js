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


// Make sure the EventEmitter#domain is not clobbered by domain module.
// See https://github.com/joyent/node/issues/3922

var common = require('../common');
var assert = require('assert');
var events = require('events');
var util   = require('util');
var EventEmitter = events.EventEmitter;


util.inherits(WebSite, EventEmitter);

function WebSite(domain) {
    EventEmitter.apply(this);
    this.domain = domain;
}


var website = new WebSite("google.com");
website.on("ping", function() {});
website.emit("ping"); // This line must not throw exception.


// Even after require-ing domain module (which have side effects).
require('domain');

var website2 = new WebSite("google.com");
website2.on("ping", function() {});
website2.emit("ping");


process.on('exit', function() {
  console.log('ok');
});
