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

var EventEmitter = require('events');
var v8binding, process;

// This needs to be loaded early, and before the "process" object is made
// global. So allow src/node.js to pass the process object in during
// initialization.
exports._nodeInitialization = function nodeInitialization(pobj) {
  process = pobj;
  v8binding = process.binding('v8');

  // Finish setting up the v8 Object.
  v8.getHeapStatistics = v8binding.getHeapStatistics;

  // Part of the AsyncListener setup to share objects/callbacks with the
  // native layer.
  process._setupAsyncListener(asyncFlags,
                              runAsyncQueue,
                              loadAsyncQueue,
                              unloadAsyncQueue);

  // Do a little housekeeping.
  delete exports._nodeInitialization;
};


// v8

var v8 = exports.v8 = new EventEmitter();


function emitGC(before, after) {
  v8.emit('gc', before, after);
}


v8.on('newListener', function(name) {
  if (name === 'gc' && EventEmitter.listenerCount(this, name) === 0) {
    v8binding.startGarbageCollectionTracking(emitGC);
  }
});


v8.on('removeListener', function(name) {
  if (name === 'gc' && EventEmitter.listenerCount(this, name) === 0) {
    v8binding.stopGarbageCollectionTracking();
  }
});


/* --- AsyncListener --- */

// Keep the stack of all contexts that have been loaded in the execution
// chain of asynchronous events.
var contextStack = [];
// The context (i.e. "this") that has been loaded before the user-defined
// callback is fired.
var activeContext;

// Incremental uid for new AsyncListener instances. The uid is used as a
// unique storage location for any data returned from an AsyncListener
// to a given context. Which is stored on the _async.data property.
var alUid = 0;

// Stateful flags shared with Environment for quick JS/C++ communication.
// This object communicates the following things:
//
//  - kActiveAsyncContextType: The ASYNC_PROVIDERS type of the activeContext.
//
//  - kActiveAsyncQueueLength: Length of _async.queue on activeContext.
//
//  - kWatchedProviders: Bitmasks specifying which ASYNC_PROVIDERS are
//    currently being listened for. This value is accumulated on the
//    activeContext._async.watchedProviders property.
//
//  - kInAsyncTick: Whether callbacks from create/before/after are running.
var asyncFlags = {};

// Must be the same as Environment::AsyncListener::Fields in src/env.h.
var kActiveAsyncContextType = 0;
var kActiveAsyncQueueLength = 1;
var kWatchedProviders = 2;
var kInAsyncTick = 3;

// To prevent infinite recursion when an error handler also throws.
var inErrorTick = false;

// Flags to determine what AsyncListener callbacks are available. These
// are set on individual AsyncListener instances, then accumulated on the
// context object for quick check in each load/unload/error phase.
var HAS_NO_CB = 0;
var HAS_CREATE_CB = 1 << 0;
var HAS_BEFORE_CB = 1 << 1;
var HAS_AFTER_CB = 1 << 2;
var HAS_ERROR_CB = 1 << 3;

// Providers that users can watch for. The ASYNC_PROVIDERS names have been
// simplified from what's located in src/async-wrap.h.
var ASYNC_PROVIDERS = {
  // NEXTTICK is not located in async-wrap.h because it is a JavaScript
  // exclusive execution context. This will always fire on all callbacks
  // because it is currently impossible to determine the appropriate
  // provider for the nextTick() call site.
  NEXTTICK: -1,
  NONE: 0,
  CRYPTO: 1 << 0,
  FSEVENT: 1 << 1,
  FS: 1 << 2,
  GETADDRINFO: 1 << 3,
  PIPE: 1 << 4,
  PROCESS: 1 << 5,
  QUERY: 1 << 6,
  SHUTDOWN: 1 << 7,
  SIGNAL: 1 << 8,
  STATWATCHER: 1 << 9,
  TCP: 1 << 10,
  TIMER: 1 << 11,
  TLS: 1 << 12,
  TTY: 1 << 13,
  UDP: 1 << 14,
  ZLIB: 1 << 15
};

// Build a named map for all providers that are passed to create().
var PROVIDER_MAP = {};
for (var i in ASYNC_PROVIDERS)
  PROVIDER_MAP[ASYNC_PROVIDERS[i]] = i;

// _errorHandler is scoped so it's also accessible by _fatalException.
// This will be removed once a reference there is made.
exports._errorHandler = errorHandler;

// Needs to be accessible from src/node.js and lib/timers.js so they know
// when async listeners are currently in queue. They'll be cleaned up once
// references are made.
exports._asyncFlags = asyncFlags;
exports._runAsyncQueue = runAsyncQueue;
exports._loadAsyncQueue = loadAsyncQueue;
exports._unloadAsyncQueue = unloadAsyncQueue;

// Public API.
exports.createAsyncListener = createAsyncListener;
exports.addAsyncListener = addAsyncListener;
exports.removeAsyncListener = removeAsyncListener;
exports.ASYNC_PROVIDERS = ASYNC_PROVIDERS;


function resetGlobalContext() {
  // All the values here are explained in runAsyncQueue().
  activeContext = {
    _async: {
      // data is a sparse array. Do NOT change to basic bracket notation.
      data: new Array(),
      beforeRan: new Array(),
      queue: [],
      watchedProviders: ASYNC_PROVIDERS.NONE,
      providerType: ASYNC_PROVIDERS.NONE,
      callbackFlags: HAS_NO_CB
    }
  };
}
// Initialize the global context.
resetGlobalContext();


// Run all the async listeners attached when an asynchronous event is
// instantiated.
function runAsyncQueue(ctx, provider) {
  // data is a sparse array. Do NOT change to basic bracket notation.
  var data = new Array();
  var beforeRan = new Array();
  var queue = [];
  var ctxQueue = {};
  var providerType = PROVIDER_MAP[provider];
  var acAsync = activeContext._async;
  var acQueue = acAsync.queue;
  var i, item, qItem, value;

  // Set the single _async object that contains all the AL data.
  ctx._async = ctxQueue;

  // Array of all AsyncListeners attached to this context.
  ctxQueue.queue = queue;
  // Object containing passed or returned storageData. The storage index
  // is the same as the AsyncListener instance's uid. If the AsyncListener
  // was set then the value will at least be null. Which means a quick
  // check can be made to see if the AsyncListener exists by checking if
  // the value is undefined.
  ctxQueue.data = data;
  // Make sure the before callback ran before calling the after callback.
  ctxQueue.beforeRan = beforeRan;
  // Attach the numeric ASYNC_PROVIDERS type to set kActiveAsyncContextType
  // when an activeContext is loaded.
  ctxQueue.provider = provider;
  // Specify flags identifying the cumulate of callbacks for all
  // AsyncListeners in the attached _asyncQueue.
  ctxQueue.callbackFlags = acAsync.callbackFlags;
  // The cumulate of all watched providers from all AsyncListeners in
  // the _asyncQueue.
  ctxQueue.watchedProviders = 0;

  asyncFlags[kInAsyncTick] = 1;

  // Regardless whether this context's provider type is being listened for
  // or not, always iterate through the loop and propagate the listener.
  for (i = 0; i < acQueue.length; i++) {
    qItem = acQueue[i];
    queue.push(qItem);
    ctxQueue.watchedProviders |= qItem.watched_providers;
    // Check if the qItem has a create() callback.
    if ((qItem.callback_flags & HAS_CREATE_CB) === 0 ||
        // Check if this provider is being watched.
        (provider & qItem.watched_providers) === 0) {
      data[qItem.uid] = qItem.data;
      continue;
    }
    // Run the create() callback and overwrite the default userData if
    // a value was returned.
    value = qItem.create(qItem.data, providerType);
    data[qItem.uid] = (value === undefined) ? qItem.data : value;
  }

  asyncFlags[kInAsyncTick] = 0;
}


// Add the passed context to the contextStack.
function loadAsyncQueue(ctx) {
  var async = ctx._async;

  // There are specific cases where changing the async_flags_ value is
  // currently impossible (e.g. TimerWrap). In those cases go ahead and
  // return early if this was called with nothing in _async.queue.
  if (async.queue.length === 0)
    return;

  loadContext(ctx);

  // Check if this provider type is being watched or if there are any
  // before() callbacks.
  if ((async.provider & async.watchedProviders) === 0 ||
      ((async.callbackFlags & HAS_BEFORE_CB) === 0 &&
      (async.callbackFlags & HAS_AFTER_CB) === 0))
    return;

  var queue = async.queue;
  var data = async.data;
  var beforeRan = async.beforeRan;
  var i, qItem;

  asyncFlags[kInAsyncTick] = 1;
  for (i = 0; i < queue.length; i++) {
    qItem = queue[i];
    beforeRan[qItem.uid] = true;
    // Check if this provider type is being watched or if it has any
    // before() callbacks.
    if ((async.provider & qItem.watched_providers) !== 0 &&
        (qItem.callback_flags & HAS_BEFORE_CB) !== 0)
      qItem.before(ctx, data[qItem.uid]);
  }
  asyncFlags[kInAsyncTick] = 0;
}


// Load the passed context as the new activeContext, and place the
// current activeContext in the contextStack.
function loadContext(ctx) {
  var async = ctx._async;

  contextStack.push(activeContext);
  activeContext = ctx;

  asyncFlags[kActiveAsyncContextType] = async.provider;
  asyncFlags[kWatchedProviders] = async.watchedProviders;
  asyncFlags[kActiveAsyncQueueLength] = async.queue.length;
}


// Remove the passed context from the contextStack.
function unloadAsyncQueue(ctx) {
  var async = ctx._async;

  // Check if this provider type is being watched or if there are any
  // after() callbacks. There is also the case where all items in the
  // async.queue were removed, but that will be handled by these checks.
  if ((async.provider & async.watchedProviders) === 0 ||
      // Check if any AsyncListeners have an after() callback.
      (async.callbackFlags & HAS_AFTER_CB) === 0) {
    unloadContext();
    return;
  }

  var queue = async.queue;
  var data = async.data;
  var beforeRan = async.beforeRan;
  var i, qItem;

  asyncFlags[kInAsyncTick] = 1;
  for (i = 0; i < queue.length; i++) {
    qItem = queue[i];
    if (beforeRan[qItem.uid] !== true)
      continue;
    // Check if this provider type is being watched or if it has any
    // after() callbacks.
    if ((async.provider & qItem.watched_providers) !== 0 &&
        (qItem.callback_flags & HAS_AFTER_CB) !== 0)
      qItem.after(ctx, data[qItem.uid]);
  }
  asyncFlags[kInAsyncTick] = 0;

  unloadContext();
}


// Unload an activeContext after callbacks have run.
function unloadContext() {
  // If the contextStack has nothing in it then the activeContext is the
  // global context. It should then be reset back to initial state.
  if (contextStack.length > 0)
    activeContext = contextStack.pop();
  else
    resetGlobalContext();

  var async = activeContext._async;

  asyncFlags[kActiveAsyncContextType] = async.provider;
  asyncFlags[kActiveAsyncQueueLength] = async.queue.length;
  asyncFlags[kWatchedProviders] = async.watchedProviders;
}


// This will always be called first from _fatalException. If the activeContext
// has any error handlers then trigger those and check if "true" was
// returned to indicate the error was handled.
//
// The error() callback is unique because it will always fire in any tracked
// call stack regardless whether the provider of the context matches the
// providers being watched.
function errorHandler(er) {
  var async = activeContext._async;

  if (inErrorTick || (async.callbackFlags & HAS_ERROR_CB) === 0)
    return false;

  // Cache whether the error was thrown while processing AL callbacks. Then
  // set that we are so the AsyncWrap constructor will return early and not
  // cause infinite loops.
  var inAsyncTick = asyncFlags[kInAsyncTick];
  var handled = false;
  var data = async.data;
  var queue = async.queue;
  var i, qItem, threw;

  asyncFlags[kInAsyncTick] = 1;

  inErrorTick = true;
  for (i = 0; i < queue.length; i++) {
    qItem = queue[i];
    // Check if the AsyncListener has an error callback.
    if ((qItem.callback_flags & HAS_ERROR_CB) === 0)
      continue;
    try {
      threw = true;
      handled =
          qItem.error(activeContext, data[qItem.uid], er, handled) || handled;
      threw = false;
    } finally {
      // Die quickly if the error callback threw. Only allow exit events
      // to be processed.
      if (threw) {
        process._exiting = true;
        process.emit('exit', 1);
      }
    }
  }
  inErrorTick = false;
  asyncFlags[kInAsyncTick] = inAsyncTick;

  unloadContext();

  return handled && inAsyncTick === 0;
}


// Instance function of an AsyncListener object.
function AsyncListener(callbacks, data, provider) {
  if (typeof callbacks.create === 'function') {
    this.create = callbacks.create;
    this.callback_flags |= HAS_CREATE_CB;
  }
  if (typeof callbacks.before === 'function') {
    this.before = callbacks.before;
    this.callback_flags |= HAS_BEFORE_CB;
  }
  if (typeof callbacks.after === 'function') {
    this.after = callbacks.after;
    this.callback_flags |= HAS_AFTER_CB;
  }
  if (typeof callbacks.error === 'function') {
    this.error = callbacks.error;
    this.callback_flags |= HAS_ERROR_CB;
  }

  this.uid = ++alUid;
  this.data = data === undefined ? null : data;
  this.watched_providers = provider === undefined ? 0xfffffff : provider >>> 0;
}
// Not sure which callbacks will be set, so pre-define all of them.
AsyncListener.prototype.create = undefined;
AsyncListener.prototype.before = undefined;
AsyncListener.prototype.after = undefined;
AsyncListener.prototype.error = undefined;
// Track if this instance has create/before/after/error callbacks.
AsyncListener.prototype.callback_flags = HAS_NO_CB;


// Create new AsyncListener, but don't add it to the activeContext's
// _asyncQueue.
//
// TODO(trevnorris): If an AL is passed, should a new instance be created
// with the new data and provider information?
function createAsyncListener(callbacks, data, providers) {
  if (callbacks instanceof AsyncListener)
    return callbacks;

  if (typeof callbacks !== 'object' || callbacks === null)
    throw new TypeError('Missing expected callbacks object');

  return new AsyncListener(callbacks, data, providers);
}


// Add a listener to the activeContext.
function addAsyncListener(callbacks, data, providers) {
  if (!(callbacks instanceof AsyncListener))
    callbacks = createAsyncListener(callbacks, data, providers);

  // Check if the AsyncListener already exists in the stack.
  for (var i = 0; i < contextStack.length; i++) {
    if (contextStack[i]._async.data[callbacks.uid] !== undefined)
      return;
  }

  // userData values === undefiend mean the AsyncListener does not exist
  // in the _asyncQueue.
  if (activeContext._async.data[callbacks.uid] === undefined) {
    addListenerQueueItem(callbacks);

    // Update Environment::AsyncListener flags.
    asyncFlags[kWatchedProviders] = activeContext._async.watchedProviders;
    asyncFlags[kActiveAsyncQueueLength] = activeContext._async.queue.length;
  }

  return callbacks;
}


function addListenerQueueItem(al) {
  activeContext._async.queue.push(al);
  activeContext._async.data[al.uid] = al.data;
  activeContext._async.callbackFlags |= al.callback_flags;
  activeContext._async.watchedProviders |= al.watched_providers;
}


// Remove the AsyncListener from the stack.
function removeAsyncListener(al) {
  if (!(al instanceof AsyncListener))
    throw new TypeError('argument should be instance of AsyncListener');

  removeAL(activeContext, al);

  // Update Environment::AsyncListener flags.
  asyncFlags[kWatchedProviders] = activeContext._async.watchedProviders;
  asyncFlags[kActiveAsyncQueueLength] = activeContext._async.queue.length;

  var cslen = contextStack.length;
  if (cslen === 0)
    return;

  // Remove the AsyncListener from all contexts in the current stack.
  for (var i = 0; i < cslen; i++)
    removeAL(contextStack[i], al);
}


function removeAL(ctx, al) {
  var async = ctx._async;

  // Return early if the AsyncListener doesn't exist in this context.
  if (async.data[al.uid] === undefined)
    return;

  var data = async.data;
  var queue = async.queue;
  var beforeRan = async.beforeRan;
  var i, tmp;

  async.callbackFlags = HAS_NO_CB;
  async.watchedProviders = ASYNC_PROVIDERS.NONE;
  for (i = 0; i < queue.length; i++) {
    if (queue[i] === al) {
      tmp = queue.splice(i, 1)[0];
      data[tmp.uid] = undefined;
      beforeRan[tmp.uid] = undefined;
      i--;
    } else {
      async.callbackFlags |= queue[i].callback_flags;
      async.watchedProviders |= queue[i].watched_providers;
    }
  }

  // Set async_flags_ = NO_OPTIONS in C++ where possible. In some locations
  // it is impossible to reach the actual context because it is abstracted
  // too far (e.g. TimerWrap).
  if (queue.length === 0 && typeof ctx._removeAsyncQueue === 'function')
    ctx._removeAsyncQueue();
}
