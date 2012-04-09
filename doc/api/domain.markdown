# Domain

    Stability: 1 - Experimental

Domains provide a way to handle multiple different IO operations as a
single group.  If any of the event emitters or callbacks registered to a
domain emit an `error` event, or throw an error, then the domain object
will be notified, rather than causing the node program to exit.

This feature is new in Node version 0.8.  It is a first pass, and is
expected to change significantly in future versions.  Please use it and
provide feedback.

## Additions to Error objects

<!-- type=misc -->

Any time an Error object is routed through a domain, a few extra fields
are added to it.

* `error.domain` The domain that first handled the error.
* `error.domain_emitter` The event emitter that emitted an 'error' event
  with the error object.
* `error.domain_bound` The callback function which was bound to the
  domain, and passed an error as its first argument.
* `error.domain_thrown` A boolean indicating whether the error was
  thrown, emitted, or passed to a bound callback function.

## Implicit Binding

<!--type=misc-->

If domains are in use, then all new EventEmitter objects (including
Stream objects, requests, responses, etc.) will be bound to the active
domain at the time of their creation.

In order to prevent excessive memory usage, Domain objects themselves
are not implicitly added as children of the active domain.  If they
were, then it would be too easy to prevent request and response objects
from being properly garbage collected.

If you would want to nest Domain objects as children of a parent Domain,
then you must explicitly add them, and then dispose of them later.

## domain.create()

* return: {Domain}

Returns a new Domain object.

## Class: Domain

The Domain class encapsulates the functionality of routing errors and
uncaught exceptions to the active Domain object.

Domain is a child class of EventEmitter.  To handle the errors that it
catches, listen to its `error` event.

### domain.members

* {Array}

An array of timers and event emitters that have been added to the
domain.

### domain.add(emitter)

* `emitter` {EventEmitter | Timer} emitter or timer to be added to the domain

Adds an emitter to the domain.  If any event handlers called by the
emitter throw an error, or if the emitter emits an `error` event, it
will be routed to the domain's `error` event.

This also works with timers that are returned from `setInterval` and
`setTimeout`.  If their callback function throws, it will be caught by
the domain 'error' handler.

### domain.remove(emitter)

* `emitter` {EventEmitter | Timer} emitter or timer to be removed from the domain

The opposite of `domain.add(emitter)`.  Removes domain handling from the
specified emitter.

### domain.bind(cb)

* `cb` {Function} The callback function
* return: {Function} The bound function

The returned function will be a wrapper around the supplied callback
function.  When the returned function is called, any errors that are
thrown will be routed to the domain's `error` event.

#### Example

    var d = domain.create();

    function readSomeFile(filename, cb) {
      fs.readFile(filename, d.bind(function(er, data) {
        // if this throws, it will also be passed to the domain
        return cb(er, JSON.parse(data));
      }));
    }

    d.on('error', function(er) {
      // an error occurred somewhere.
      // if we throw it now, it will crash the program
      // with the normal line number and stack message.
    });

### domain.intercept(cb)

* `cb` {Function} The callback function
* return: {Function} The intercepted function

This method is almost identical to `domain.bind(cb)`.  However, in
addition to catching thrown errors, it will also intercept `Error`
objects sent as the first argument to the function.

In this way, the common `if (er) return cb(er);` pattern can be replaced
with a single error handler in a single place.

#### Example

    var d = domain.create();

    function readSomeFile(filename, cb) {
      fs.readFile(filename, d.bind(function(er, data) {
        // if this throws, it will also be passed to the domain
        // additionally, we know that 'er' will always be null,
        // so the error-handling logic can be moved to the 'error'
        // event on the domain instead of being repeated throughout
        // the program.
        return cb(er, JSON.parse(data));
      }));
    }

    d.on('error', function(er) {
      // an error occurred somewhere.
      // if we throw it now, it will crash the program
      // with the normal line number and stack message.
    });

### domain.dispose()

The dispose method destroys a domain, and makes a best effort attempt to
clean up any and all IO that is associated with the domain.  Streams are
aborted, ended, closed, and/or destroyed.  Timers are cleared.  Bound
callbacks are no longer called.

The intention of calling `dispose` is generally to prevent cascading
errors when a critical part of the Domain context is found to be in an
error state.

Note that IO might still be performed.  However, to the highest degree
possible, once a domain is disposed, further errors from the emitters in
that set will be ignored.  So, even if some remaining actions are still
in flight, Node.js will not communicate further about them.
