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

var namespaces = Object.create(null);
Object.defineProperty(process,
                      'namespaces',
                      {
                        enumerable: true,
                        writable: false,
                        configurable: false,
                        value: namespaces
                      });

function each(obj, action) {
  var keys = Object.keys(obj);
  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];
    action(key, obj[key]);
  }
}

function wrapContinuations(callback) {
  // get the currently active contexts in all the namespaces.
  var contexts = {};
  each(namespaces, function(name, namespace) {
    contexts[name] = namespace.active;
  });

  // return a callback that enters all the saved namespaces when called.
  return function() {
    each(contexts, function(name, context) {
      namespaces[name].enter(context);
    });
    try {
      return callback.apply(this, arguments);
    } finally {
      each(contexts, function(name, context) {
        namespaces[name].exit(context);
      });
    }
  };
}
Object.defineProperty(process,
                      '_wrapContinuations',
                      {
                        enumerable: true,
                        writable: false,
                        configurable: false,
                        value: wrapContinuations
                      });

function Namespace(name) {
  namespaces[name] = this;

  this.name = name;

  // TODO: by default, contexts nest -- but domains won't
  this._stack = [];

  // every namespace has a default / "global" context
  // FIXME: domains require different behavior to preserve distinction between
  // _makeCallback and _makeDomainCallback, for performance reasons.
  this.active = Object.create(null);
}

Namespace.prototype.set = function(key, value) {
  this.active[key] = value;
  return value;
};

Namespace.prototype.get = function(key) {
  return this.active[key];
};

Namespace.prototype.createContext = function() {
  return Object.create(this.active);
};

Namespace.prototype.run = function(fn) {
  var context = this.createContext();
  this.enter(context);
  fn(context);
  this.exit(context);
  return context;
};

Namespace.prototype.bind = function(fn, context) {
  if (!context)
    context = this.active;

  var self = this;
  return function() {
    self.enter(context);
    var result = fn.apply(this, arguments);
    self.exit(context);
    return result;
  };
};

Namespace.prototype.enter = function(context) {
  assert(context, 'context must be provided for entering');
  this._stack.push(this.active);
  this.active = context;
};

// TODO: generalize nesting via configuration to handle domains
Namespace.prototype.exit = function(context) {
  assert(context, 'context must be provided for exiting');

  // Fast path for most exits that are at the top of the stack
  if (this.active === context) {
    assert(this._stack.length, 'can\'t remove top context');
    this.active = this._stack.pop();
    return;
  }

  // Fast search in the stack using lastIndexOf
  var index = this._stack.lastIndexOf(context);
  assert(index >= 0, 'context not currently entered; can\'t exit');
  assert(index, 'can\'t remove top context');
  this.active = this._stack[index - 1];
  this._stack.length = index - 1;
};

module.exports = {
  createNamespace: function(name) { return new Namespace(name); },
  getNamespace: function(name) { return namespaces[name]; }
};
