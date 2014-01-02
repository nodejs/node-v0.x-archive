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

// Queue of all active observers.
var observerQueue = [];
var observerFlags = 0;
var observerUid = 0;

// Flags to help quickly determine what observers are available.
var HAS_CREATE_OBS = 1 << 0;
var HAS_BEFORE_OBS = 1 << 1;
var HAS_AFTER_OBS = 1 << 2;
var HAS_ERROR_OBS = 1 << 3;
var HAS_ADD_OBS = 1 << 4;
var HAS_REMOVE_OBS = 1 << 5;

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;
EventEmitter.prototype.__observers = undefined;
EventEmitter.prototype.__storage = undefined;
EventEmitter.prototype.__flags = 0;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  if (typeof this._events !== 'object')
    this._events = {};

  if (observerFlags > 0)
    runCreateObservers(this);
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
  var er, handler, len, args, i, j, listeners, item;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error' && !this._events.error) {
    er = arguments[1] || new Error('Uncaught, unspecified "error" event.');
    if ((this.__flags & HAS_ERROR_OBS) > 0)
      runErrorObservers(this, er);
    else
      throw er; // Unhandled 'error' event
    return false;
  }

  handler = this._events[type];

  if (util.isUndefined(handler))
    return false;

  if (util.isFunction(handler)) {
    if ((this.__flags & HAS_BEFORE_OBS) > 0)
      runBeforeObservers(this);

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

    if ((this.__flags & HAS_AFTER_OBS) > 0)
      runAfterObservers(this);

  } else if (util.isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++) {
      if ((this.__flags & HAS_BEFORE_OBS) > 0)
        runBeforeObservers(this);

      listeners[i].apply(this, args);

      if ((this.__flags & HAS_AFTER_OBS) > 0)
        runAfterObservers(this);
    }
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var i, item;

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

  if ((this.__flags & HAS_ADD_OBS) > 0)
    runAddObservers(this, type, listener);

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
  var list, position, length, i, j, item;

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

    if ((this.flags & HAS_REMOVE_OBS) > 0)
      runRemoveObservers(this, type, listener);

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

    if ((this.flags & HAS_REMOVE_OBS) > 0)
      runRemoveObservers(this, type, listener);
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


function ObserverInst(obj, storage) {
  if (!obj)
    return;

  if (typeof obj.create === 'function') {
    this.create = obj.create;
    this.flags |= HAS_CREATE_OBS;
  }
  if (typeof obj.before === 'function') {
    this.before = obj.before;
    this.flags |= HAS_BEFORE_OBS;
  }
  if (typeof obj.after === 'function') {
    this.after = obj.after;
    this.flags |= HAS_AFTER_OBS;
  }
  if (typeof obj.error === 'function') {
    this.error = obj.error;
    this.flags |= HAS_ERROR_OBS;
  }
  if (typeof obj.add === 'function') {
    this.add = obj.add;
    this.flags |= HAS_ADD_OBS;
  }
  if (typeof obj.remove === 'function') {
    this.remove = obj.remove;
    this.flags |= HAS_REMOVE_OBS;
  }

  this.uid = ++observerUid;
  this.storage = storage;
}
ObserverInst.prototype.create = undefined;
ObserverInst.prototype.before = undefined;
ObserverInst.prototype.after = undefined;
ObserverInst.prototype.error = undefined;
ObserverInst.prototype.add = undefined;
ObserverInst.prototype.remove = undefined;
ObserverInst.prototype.storage = undefined;
ObserverInst.prototype.uid = undefined;
ObserverInst.prototype.flags = 0;
ObserverInst.prototype.refs = 0;


// These functions are not DRY, but they're much faster than accessing
// the object properties via a passed string.
function runCreateObservers(context) {
  var item, i, storage;

  for (i = 0; i < observerQueue.length; i++) {
    item = observerQueue[i];
    attachObserver(context, item);
    if ((observerFlags & HAS_CREATE_OBS) > 0 &&
        (item.flags & HAS_CREATE_OBS) > 0) {
      storage = item.create(context, item.storage);
      if (typeof storage !== 'undefined')
        context.__storage[item.uid] = storage;
    }
  }
}


function runBeforeObservers(context) {
  var item, i;

  for (i = 0; i < context.__observers.length; i++) {
    item = context.__observers[i];
    if ((item.flags & HAS_BEFORE_OBS) > 0)
      item.before(context, context.__storage[item.uid]);
  }
}


function runAfterObservers(context) {
  var item, i;

  for (i = 0; i < context.__observers.length; i++) {
    item = context.__observers[i];
    if ((item.flags & HAS_AFTER_OBS) > 0)
      item.after(context, context.__storage[item.uid]);
  }
}


function runErrorObservers(context, er) {
  var item, i;

  for (i = 0; i < context.__observers.length; i++) {
    item = context.__observers[i];
    if ((item.flags & HAS_ERROR_OBS) > 0)
      item.error(context, context.__storage[item.uid], er);
  }
}


function runAddObservers(context, type, listener) {
  var item, i;

  for (i = 0; i < context.__observers.length; i++) {
    item = context.__observers[i];
    if ((item.flags & HAS_ADD_OBS) > 0)
      item.add(context, context.__storage[item.uid], type, listener);
  }
}


function runRemoveObservers(context, type, listener) {
  var item, i;

  for (i = 0; i < context.__observers.length; i++) {
    item = context.__observers[i];
    if ((item.flags & HAS_REMOVE_OBS) > 0)
      item.remove(context, context.__storage[item.uid], type, listener);
  }
}


EventEmitter.createObserver = function(obj, storage) {
  if (!(obj instanceof ObserverInst))
    return new ObserverInst(obj, storage);
  else
    return obj;
};


// The same observer can only be added and executed once.
// If the observer is pre-created then any storage value passed will be
// ignored.
EventEmitter.addObserver = function(obj, storage) {
  if (!(obj instanceof ObserverInst))
    obj = new ObserverInst(obj, storage);

  // Check observer has callbacks or that it doesn't exist in the queue.
  if (obj.flags === 0 || ++obj.refs > 1)
    return obj;

  observerQueue.push(obj);
  observerFlags |= obj.flags;

  return obj;
};


EventEmitter.removeObserver = function(obj) {
  if (!(obj instanceof ObserverInst) || observerQueue.length === 0)
    return;

  var idx = observerQueue.indexOf(obj);

  if (idx < 0 || --obj.refs > 0)
    return;

  observerQueue.splice(idx, 1);
  observerFlags = 0;

  // Rebuild flags from all queued observers.
  for (var i = 0; i < observerQueue.length; i++)
    observerFlags |= observerQueue[i].flags;
};


// TODO(trevnorris): Possibility of adding the same observer multiple
// times and allowing one of the following:
//    1) Keep a reference count and only allow the callbacks to run once.
//    2) Continue to add them, knowing the "storage" can't change after
//    the instance has been instantiated and the "create" callback has run.
function attachObserver(ee, obj, storage) {
  if (!ee.__observers)
    ee.__observers = [obj];
  else if (ee.__observers.indexOf(obj) === -1)
    ee.__observers.push(obj);
  else
    return;

  if (typeof storage === 'undefined')
    storage = obj.storage;
  if (!ee.__storage)
    ee.__storage = new Array();

  ee.__storage[obj.uid] = storage;
  ee.__flags |= obj.flags;
}


// The same observer can only be attached once.
EventEmitter.attachObserver = function _attachObserver(ee, obj, storage) {
  if (!(ee instanceof EventEmitter))
    throw new TypeError('argument ee must be instance of EventEmitter');
  if (!(obj instanceof ObserverInst))
    throw new TypeError('argument obj must be an observer');

  attachObserver(ee, obj, storage);
};


EventEmitter.detachObserver = function _detachObserver(ee, obj) {
  if (!(ee instanceof EventEmitter))
    throw new TypeError('argument ee must be instance of EventEmitter');
  if (!(obj instanceof ObserverInst))
    throw new TypeError('argument obj must be an observer');

  if (!ee.__observers)
    return;

  var idx = ee.__observers.indexOf(obj);

  if (idx < 0) {
    return;
  } else if (ee.__observers.length === 1) {
    ee.__observers = undefined;
    ee.__flags = 0;
    return;
  }

  ee.__observers.splice(idx, 1);
  ee.__flags = 0;

  for (var i = 0; i < ee.__observers.length; i++)
    ee.__flags |= ee.__observers[i].flags;
};


EventEmitter.observers = function _observers() {
  return observerQueue.slice(0);
};
