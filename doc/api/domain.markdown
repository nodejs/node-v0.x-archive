# Domain

    Stability: 1 - Experimental

Domains provide a way to handle multiple different IO operations as a
single group.  If any of the event emitters or callbacks registered to a
domain emit an `error` event, or throw an error, then the domain object
will be notified, rather than causing the node program to exit.

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

## domain.create()

* return: {Domain}

Returns a new Domain object.

## Class: Domain

The Domain class encapsulates the functionality of routing errors and
uncaught exceptions to the active Domain object.

Domain is a child class of EventEmitter.  To handle the errors that it
catches, listen to its `error` event.

### domain.add(emitter)

* `emitter` {EventEmitter} The emitter that is added to the domain

Adds an emitter to the domain.  If any event handlers called by the
emitter throw an error, or if the emitter emits an `error` event, it
will be routed to the domain's `error` event.

### domain.bind(cb)

* `cb` {Function} The callback function
* return: {Function} The bound function

The returned function will be a wrapper around the supplied callback
function.  When the returned function is called, any errors that are
thrown will be routed to the domain's `error` event.  Additionally, if
the returned function is called with an `Error` object as its first
argument, then it will go to the domain's `error` event instead.

#### Example

    var d = domain.create();

    function readSomeFile(filename, cb) {
      fs.readFile(filename, d.bind(function(er, data) {
        // can assume that er will always be null.
        // no need for `if (er) return cb(er)`

        // if this throws, it will also be passed to the domain
        data = JSON.parse(data)

        return cb(null, data)
      }));
    }

    d.on('error', function(er) {
      // an error occurred somewhere.
      // if we throw it now, it will crash the program
      // with the normal line number and stack message.
    });
