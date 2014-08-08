# Tracing

    Stability: 1 - Experimental

The tracing module is designed for instrumenting your Node application. It is
not meant for general purpose use.

***Be very careful with callbacks used in conjunction with this module***

Many of these callbacks interact directly with asynchronous subsystems in a
synchronous fashion. That is to say, you may be in a callback where a call to
`console.log()` could result in an infinite recursive loop.  Also of note, many
of these callbacks are in hot execution code paths. That is to say your
callbacks are executed quite often in the normal operation of Node, so be wary
of doing CPU bound or synchronous workloads in these functions. Consider a ring
buffer and a timer to defer processing.

`require('tracing')` to use this module.

## v8

The `v8` property is an [EventEmitter][], it exposes events and interfaces
specific to the version of `v8` built with node. These interfaces are subject
to change by upstream and are therefore not covered under the stability index.

### Event: 'gc'

`function (before, after) { }`

Emitted each time a GC run is completed.

`before` and `after` are objects with the following properties:

```
{
  type: 'mark-sweep-compact',
  flags: 0,
  timestamp: 905535650119053,
  total_heap_size: 6295040,
  total_heap_size_executable: 4194304,
  total_physical_size: 6295040,
  used_heap_size: 2855416,
  heap_size_limit: 1535115264
}
```

### getHeapStatistics()

Returns an object with the following properties

```
{
  total_heap_size: 7326976,
  total_heap_size_executable: 4194304,
  total_physical_size: 7326976,
  used_heap_size: 3476208,
  heap_size_limit: 1535115264
}
```


## Async Listeners

The `AsyncListener` API is the JavaScript interface for the `AsyncWrap`
class. This allows developers to be notified about key events in the
lifetime of an asynchronous event. Node performs a lot of asynchronous
events internally, and significant use of this API may have a
**significant performance impact** on your application.

**Note**: Running any of these functions within any `AsyncListener`
callback is *undefined behavior*.


### tracing.createAsyncListener(callbacksObj[, userData[, provider]])

* `callbacksObj` {Object} Contains optional callbacks that will fire at
specific times in the life cycle of the asynchronous event.
* `userData` {Value} a default value (i.e. primitive or object) that will be
passed to all callbacks. It can be overwritten by returning a new value from
the `create()` callback.
* `provider` {Number} Types of providers the user wishes to track. These are
provided by `tracing.ASYNC_PROVIDERS`. If the user wishes to pass in a custom
set of providers but no `userData`, then pass `null` to `userData`.

Returns a constructed `AsyncListener` object.

Explanation of function parameters:

**callbacksObj**: An `Object` which may contain several optional fields:

* `create(userData, type)`: A `Function` called when an asynchronous
event is instantiated. Any `userData` value passed when the `AsyncListener`
was created will be passed as the first argument. If a value is returned then
it will overwrite the `userData` value for the specific instance in which it
was run. The `type` argument is the type of `ASYNC_PROVIDERS` where the call
originated.

* `before(context, userData)`: A `Function` that is called immediately
before the asynchronous callback is about to run. It will be passed both
the `context` (i.e. `this`) of the calling function and the `userData`
either returned from `create()` or passed during construction (if
either occurred).

* `after(context, userData)`: A `Function` called immediately after
the asynchronous event's callback has run. Note this will not be called
if the callback throws.

* `error(context, userData, error, handled)`: A `Function` called if any call
threw within the synchronous execution stack of the originating asynchronous
callback. The `context` is that of the original asynchronous function. Not
that of the originating function in the case something threw within a
synchronous call stack. If the `error()` callback returns `true` then Node
will assume the error has been properly handled and resume execution normally.
When multiple `error()` callbacks have been registered only **one** of those
callbacks needs to return `true` for `AsyncListener` to accept that the
error has been handled, but all `error()` callbacks will always be run.
The `context` passed to `error()` is that of the originating function in
the call stack. `handled` is whether a previous AL has already returned that
the error has been handled.

**userData**: A `Value` (i.e. anything) that will, by default, be attached
to all new event instances. This will be overwritten if a `Value` is
returned by `create()`.

Here is an example of overwriting the `userData`:

    var tracing = require('tracing');

    tracing.createAsyncListener({
      create: function listener(value, type) {
        // value === true
        return false;
    }, {
      before: function before(context, value) {
        // value === false
      }
    }, true);

**provider**: A provider, or combination of providers, from `ASYNC_PROVIDERS`.
Here's an example:

    var tracing = require('tracing');
    var tap = tracing.ASYNC_PROVIDERS;

    tracing.createAsyncListener(callbacksObj, null, tap.TCP | tap.PIPE);

Currently callbacks will fire for all `NEXTTICK` providers. As it is currently
impossible to correctly determine their caller's provider. As such `NEXTTICK`
should never be passed as a provider type.

**Note:** The [EventEmitter][], while used to emit status of an asynchronous
event, is not itself asynchronous. So `create()` will not fire when
an EventEmitter is instantiated, and `before()`/`after()` will not fire when
a callback is emitted.


### tracing.addAsyncListener(callbacksObj[, userData[, provider]])
### tracing.addAsyncListener(asyncListener)

Returns a constructed `AsyncListener` instance and immediately adds it to
the listening queue to begin capturing asynchronous events.

To begin capturing asynchronous events pass either the `callbacksObj` or
pass an existing `AsyncListener` instance. The same `AsyncListener` instance
can only be added once to the active queue, and subsequent attempts to add
the instance will be ignored. If a previously instantiated `AsyncListener`
is passed than any value passed to `userData` or `provider` will be ignored.

To stop capturing pass the returned `AsyncListener` instance to
[`tracing.removeAsyncListener()`][]. This does _not_ mean the
`AsyncListener` previously added will stop triggering callbacks. Once
attached to an asynchronous event it will persist with the lifetime of the
asynchronous call stack.

Function parameters can either be the same as
[`tracing.createAsyncListener()`][], or a constructed `AsyncListener`.

Example usage for capturing errors:

    var fs = require('fs');
    var tracing = require('tracing');

    var cntr = 0;
    var key = tracing.addAsyncListener({
      create: function onCreate() {
        return cntr++;
      },
      before: function onBefore(context, uid) {
        console.log('uid: ' + uid + ' is about to run\n');
      },
      after: function onAfter(context, uid) {
        console.log('uid: ' + uid + ' ran\n');
      },
      error: function onError(context, uid, err) {
        // Handle known errors
        if (err.message === 'everything is fine') {
          console.error('handled error just threw:\n');
          console.error(err.stack + '\n');
          return true;
        }
      }
    });

    process.nextTick(function() {
      throw new Error('everything is fine');
    });

    // Output:
    // uid: 0 is about to run
    // handled error just threw:
    // Error: everything is fine
    //     at /tmp/test.js:28:9
    //     at process._tickCallback (node.js:339:11)
    //     at Function.Module.runMain (module.js:492:11)
    //     at startup (node.js:124:16)
    //     at node.js:803:3

When a `ASYNC_PROVIDERS` is passed the callbacks will only be fired when that
provider type is triggered. Again with the exception that all `NEXTTICK`
providers will fire. Here is an example usage:

    var fs = require('fs');
    var tracing = require('tracing');
    var tap = tracing.ASYNC_PROVIDERS;

    tracing.addAsyncListener(tap.TIMER, {
      create: function(stor, type) { }
    });

    // create() will fire for this setImmediate().
    setImmediate(function() {
      // But won't fire for this fs operation.
      fs.stat(__filename, function() {
        // Even so, the stack has been kept in the background and
        // create() will fire again for this setTimeout().
        setTimeout(function() { });
      });
    });

The `error()` callback is unique because it will still fire anywhere
within the call stack, regardless whether the error occurred while in
the stack of the specified provider.

    var fs = require('fs');
    var net = require('net');
    var tracing = require('tracing');

    tracing.addAsyncListener(tracing.ASYNC_PROVIDERS.TCP, {
      create: function(stor, type) { },
      error: function(context, stor, err) {
        // Continue normally
        return true;
      }
    });

    // The TCP connections made from the net module will trigger
    // any create/before/after callbacks.
    net.createServer(function(c) {
      // This FS operation will not.
      fs.stat(__filename, function() {
        // Regardless, this error will still be caught.
        throw new Error('from fs');
      });
    }).listen(8080);

If an `error()` callback throws then there is no allowed recovery. Any
callbacks placed in the [`process` exit event][] will still fire. Though
the user should be careful to check the exit status before doing much
because it's possible to override the actual reason for triggering the
exit. For example:

    var assert = require('assert');
    var tracing = require('tracing');

    process.on('exit', function(status) {
      // Need to check if the exit status is fine before continuing.
      if (status > 0)
        return;

      // Or else a somthing like this will not display why the code
      // actually exited.
      assert.ok(false);
    });

    tracing.addAsyncListener({
      error: function(context, data, err) {
        // Check if we can recover from this error or not.
        if (err.message === 'expected message')
          return true;
      }
    });

    process.nextTick(function() {
      // This error will bubble through because it doesn't match
      // the criterion necessary to recover properly.
      throw new Error('random message');
    });

Note that the `NEXTTICK` `ASYNC_PROVIDERS` will always fire. Because of
the implicit way [`process.nextTick()`][] is called it is impossible to
properly determine the actual provider that initiated the call.

### tracing.removeAsyncListener(asyncListener)

Removes the `AsyncListener` from the listening queue.

Removing the `AsyncListener` from the active queue does _not_ mean the
callbacks will cease to fire on the events they've been registered.
Subsequently, any asynchronous events fired during the execution of a
callback will also have the same `AsyncListener` callbacks attached for
future execution. For example:

    var tracing = require('tracing');

    var key = tracing.createAsyncListener({
      create: function() {
        console.log('You summoned me?');
      }
    });

    // We want to begin capturing async events some time in the future.
    setTimeout(function() {
      tracing.addAsyncListener(key);

      // Perform a few additional async events.
      setTimeout(function() {
        setImmediate(function() {
          process.nextTick(function() { });
        });
      });

      // Removing the listener doesn't mean to stop capturing events that
      // have already been added.
      tracing.removeAsyncListener(key);
    }, 100);

    // Output:
    // You summoned me?
    // You summoned me?
    // You summoned me?
    // You summoned me?

The fact that we logged 4 asynchronous events is an implementation detail
of Node's [Timers][].


[EventEmitter]: events.html#events_class_events_eventemitter
[Timers]: timers.html
[`tracing.createAsyncListener()`]: #tracing_tracing_createasynclistener_asynclistener_callbacksobj_storagevalue
[`tracing.addAsyncListener()`]: #tracing_tracing_addasynclistener_asynclistener
[`tracing.removeAsyncListener()`]: #tracing_tracing_removeasynclistener_asynclistener
[`process.nextTick()`]: process.html#process_process_nexttick_callback
[`util.inspect()`]: util.html#util_util_inspect_object_options
[`process` exit event]: process.html#process_event_exit
