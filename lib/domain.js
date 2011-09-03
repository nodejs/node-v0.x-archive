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

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var currentDomain = null;
var defaultDomain = new Domain();
var createQueue = [];

var debug;
if (process.env.NODE_DEBUG && /domain/.test(process.env.NODE_DEBUG)) {
  debug = function() { console.error.apply(this, arguments); };
} else {
  debug = function() { };
}


function Domain() {
  this.handles = [];
}
util.inherits(Domain, EventEmitter);



Domain.prototype.enter = function() {
  assert.ok(!currentDomain);
  currentDomain = this;
};


Domain.prototype.kill = function() {
  for (var i = 0; i < this.handles.length; i++) {
    debug("kill handle", this.handles[i]);
    if (this.handles[i].close) {
      this.handles[i].close();
    } else {
      this.handles[i].oncomplete = null;
    }
  }
  this.handles = [];
};


Domain.prototype.exit = function() {
  assert.ok(currentDomain == this);
  currentDomain = null;

  if (this.handles.length == 0) {
    this.emit('exit');
  }
};


exports.pollNewDomains = function() {
  var d;
  while ((d = createQueue.shift())) {
    d.enter();

    try {
      d.cb(d.arg);
    } catch (e) {
      d.emit('error', e);
      d.kill();
    }

    d.cb = null;
    d.arg = null;
    d.exit();
  }
};



exports.add = function(handle) {
  if (process.features.domains) {
    debug("add handle", handle, "to domain", currentDomain);
    currentDomain.handles.push(handle);
    handle.domain = currentDomain;
  }
};


exports.remove = function(handle) {
  if (process.features.domains) {
    // TODO do this in O(1)
    assert.equal(currentDomain, handle.domain);
    var i = currentDomain.handles.indexOf(handle);
    currentDomain.handles.splice(i, 1);
  }
};


exports.create = function(arg, cb) {
  var d = new Domain();
  d.cb = cb;
  d.arg = arg;
  createQueue.push(d);
  return d;
};
