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

var domain;
var util = require('util');

// Queue of all active observers.
var observerQueue = [];
var observerFlags = 0;
var obsUid = 0;

// Flags to help quickly determine what observers are available.
var HAS_CREATE_OBS = 1 << 0;

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._observers = undefined;
EventEmitter.prototype._maxListeners = undefined;
EventEmitter.prototype._storage = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    domain = domain || require('domain');
    if (domain.active && !(this instanceof domain.Domain)) {
      this.domain = domain.active;
    }
  }
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;

  if (observerFlags & HAS_CREATE_OBS > 0)
    execCreators(this, observerQueue);
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!util.isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error' && !this._events.error) {
    er = arguments[1];
    if (this.domain) {
      if (!er)
        er = new Error('Uncaught, unspecified "error" event.');
      er.domainEmitter = this;
      er.domain = this.domain;
      er.domainThrown = false;
      this.domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      throw Error('Uncaught, unspecified "error" event.');
    }
    return false;
  }

  handler = this._events[type];

  if (util.isUndefined(handler))
    return false;

  if (util.isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (util.isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              util.isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (util.isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (util.isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!util.isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (util.isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (util.isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (util.isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (Array.isArray(listeners)) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (util.isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (util.isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};


// The "create" callback is unique because if a value is returned then
// it will override the "storage" value on the ObserverInst instance.
function execCreators(context, list) {
  var item, storage;
  context._storage = [];
  for (var i = 0; i < list.length; i++) {
    item = list[i];
    if (typeof item.create === 'function') {
      storage = item.create(context, item.storage);

      if (storage)
        context._storage[item.uid] = storage;
      else
        context._storage[item.uid] = item.storage;
    }
  }
  context._observers = list;
}


// type - type of callback to execute (e.g. before/after/etc.)
// context - "this" of the event emitter instance
// list - the array that contains list of callbacks
function execObservers(type, context, list) {
  var item;
  for (var i = 0; i < list.length; i++) {
    item = list[i];
    if (typeof item[type] === 'function') {
      item[type](context, context._storage);
    }
  }
}


function ObserverInst(obj, storage) {
  if (!obj)
    return;

  if (typeof obj.create === 'function') {
    this.create = obj.create;
    this.flags |= HAS_CREATE_OBS;
  }
  // TODO(trevnorris): add before/after/error/add/remove callbacks.

  this.uid = ++obsUid;
  this.storage = storage;
}
ObserverInst.prototype.create = undefined;
ObserverInst.prototype.storage = undefined;
ObserverInst.prototype.uid = undefined;
ObserverInst.prototype.flags = 0;


EventEmitter.createObserver = function(obj, storage) {
  if (!(obj instanceof ObserverInst))
    return new ObserverInst(obj, storage);
  else
    return obj;
};


// TODO(trevnorris): Currently if an observer is pre-created then passing
// a storage value will be ignored on addObserver. By allowing the
// storage value to be overridden it would also require creating a new
// observer instance. I believe this would complicate the API.
EventEmitter.addObserver = function(obj, storage) {
  if (!(obj instanceof ObserverInst))
    obj = new ObserverInst(obj, storage);

  // Check observer has callbacks and that it doesn't exist in the queue.
  if (obj.flags === 0 || observerQueue.indexOf(obj) >= 0)
    return obj;

  observerQueue.push(obj);
  observerFlags |= obj.flags;

  return obj;
};


EventEmitter.removeObserver = function(obj) {
  if (!(obj instanceof ObserverInst) || observerQueue.length === 0)
    return;

  var idx = observerQueue.indexOf(obj);

  if (idx < 0)
    return;

  observerQueue.splice(idx, 1);
  observerFlags = 0;

  // Rebuild flags from all queued observers.
  for (var i = 0; i < observerQueue.length; i++)
    observerFlags |= observerQueue[i].flags;
};


EventEmitter.attachObserver = function(ee, obj, storage) {
  if (!(ee instanceof EventEmitter))
    throw new TypeError('argument ee must be instance of EventEmitter');
  if (!(obj instanceof ObserverInst))
    throw new TypeError('argument obj must be an observer');

  if (!ee._observers)
    ee._observers = [];
  else if (ee._observers.indexOf(obj) >= 0)
    return;

  ee._observers.push(obj);

  if (storage == null)
    storage = obj.storage;
  if (!ee._storage)
    ee._storage = [];

  ee._storage[obj.uid] = storage;
};
