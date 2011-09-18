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

var domainIds = 0;
var allowBadHandleAccess = false;


var debug;
if (process.env.NODE_DEBUG && /domain/.test(process.env.NODE_DEBUG)) {
  debug = function() { console.error.apply(this, arguments); };
} else {
  debug = function() { };
}


function Domain() {
  this.id = ++domainIds;
  this.handles = [];
  this.callerDomain = null;
}
util.inherits(Domain, EventEmitter);


var defaultDomain = new Domain();
exports.defaultDomain = defaultDomain;
var currentDomain = defaultDomain;
var createQueue = [];

exports.getCurrent = function getCurrent() {
  return currentDomain;
};


Domain.prototype.inspect = function() {
  return "#<Domain id=" + this.id +
      " handles.length=" + this.handles.length +
      ">";
};


Domain.prototype.enter = function() {
  assert.ok(this != currentDomain || currentDomain == defaultDomain,
      "Node should not recursively enter the same domain");
  this.callerDomain = currentDomain;
  currentDomain = this;
};


Domain.prototype.kill = function() {
  var handle;
  console.error("this.handles.length=" + this.handles.length);
  while (handle = this.handles.shift()) {
    console.error("shift");
    debug("kill handle", handle);
    debugger;

    if (handle._onTimeout || handle.ontimeout) {
      // We may be calling domain.remove(handle) on a domain which is not our
      // own. This is because the timers sometimes share a handle
      // in JavaScript land.
      allowBadHandleAccess = true;
      clearTimeout(handle);
      allowBadHandleAccess = false;

      handle._onTimeout = null
      handle.ontimeout = null
    } else {
      handle.close();
      handle.oncomplete = null;
    }
  }
};


Domain.prototype.exit = function() {
  assert.ok(currentDomain == this);
  assert.ok(this.callerDomain == defaultDomain || this.callerDomain == null);
  currentDomain = this.callerDomain;

  if (this.handles.length == 0) {
    this.emit('exit');
  }
};


exports.pollNewDomains = function() {
  if (currentDomain != defaultDomain) {
    return;
  }

  var d;
  while ((d = createQueue.shift())) {
    d.enter();
    assert.ok(currentDomain);
    assert.equal(d, currentDomain);

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
    assert.ok(!handle.domain);
    handle.domain = currentDomain;
  }
};


exports.addDefaultDomain = function(handle) {
  if (process.features.domains) {
    debug("add handle", handle, "to defaultDomain");
    defaultDomain.handles.push(handle);
    assert.ok(!handle.domain);
    handle.domain = defaultDomain;
  }
};


exports.remove = function(handle) {
  if (process.features.domains) {
    // TODO do this in O(1)
    debug(currentDomain, "remove", handle);
    
    if (handle.domain) {
      if (!allowBadHandleAccess && currentDomain != handle.domain) {
        console.error("(node) Attempting to access a handle outside of the " + 
                      "current domain. Thiis is not allowed. handle =", handle);
        throw new Error("bad handle access");
        // We should not reach here.
        process.exit(-10);
      }

      var i = handle.domain.handles.indexOf(handle);
      handle.domain.handles.splice(i, 1);
      handle.domain = null;
    } else {
      assert.equal(currentDomain, defaultDomain);
    }

  }
};


exports.create = function(arg, cb) {
  var d = new Domain();
  d.cb = cb;
  d.arg = arg;
  createQueue.push(d);
  return d;
};
