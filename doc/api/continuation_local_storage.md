# Continuation Local Storage

    Stability: 1 - Experimental

Continuation-local storage provides a mechanism similar to thread-local storage
in threaded programming, with closures wrapped around portions of a
continuation chain taking the place of mutable cells bound to thread data
structures. Contexts are created on namespaces and can be be nested.

Every namespace is created with a default context. The currently active
context on a namespace is available via `namespace.active`.

A simple rule of thumb is anywhere where you might have set a property on the
`request` or `response` objects in an HTTP handler, you can (and should) now
use continuation-local storage.

A simple, annotated example:

```javascript
var cls = require('contination_local_storage');

var writer = cls.createNamespace('writer');
writer.set('value', 0);

function requestHandler() {
  writer.run(function(outer) {
    // writer.get('value') returns 0
    // outer.value is 0
    writer.set('value', 1);
    // writer.get('value') returns 1
    // outer.value is 1
    process.nextTick(function() {
      // writer.get('value') returns 1
      // outer.value is 1
      writer.run(function(inner) {
        // writer.get('value') returns 1
        // outer.value is 1
        // inner.value is 1
        writer.set('value', 2);
        // writer.get('value') returns 2
        // outer.value is 1
        // inner.value is 2
      });
    });
  });

  setTimeout(function() {
    // runs with the default context, because nested contexts have ended
    console.log(writer.get('value')); // prints 0
  }, 1000);
}
```

## cls.createNamespace(name)

* return: {Namespace}

Each application wanting to use continuation-local values should create its own
namespace. Reading from (or, more significantly, writing to) namespaces that
don't belong to you is a faux pas.

## cls.getNamespace(name)

* return: {Namespace}

Look up an existing namespace.

## process.namespaces

* return: dictionary of {Namespace} objects

The set of available namespaces.

## Class: Namespace

Application-specific namespaces provide access to continuation-local
properties. Once the execution of a continuation chain begins, creating new
contexts and changing local values is analogous to mutating the value of a
given attribute scoped to that particular continuation chain.

### namespace.active

* return: the currently active context on a namespace

### namespace.set(key, value)

* return: `value`

Set a value on the current continuation context.

### namespace.get(key)

* return: the requested value, or `undefined`

Look up a value on the current continuation context. Recursively searches from
the innermost to outermost nested continuation context for a value associated
with a given key.

### namespace.run(continuation)

* return: the context associated with that continuation

Create a new context on which values can be set or mutated. Run the
continuation in this new scope (passing the new context into the
continuation).

### namespace.bind(callback, [context])

* return: a continuation wrapped up in a context closure

Bind a function to the specified continuation context. Works analagously to
`Function.bind()` or `domain.bind()`. If context is omitted, it will default to
the currently active context in the namespace.

## context

A context is a plain object created using the enclosing context as its prototype.
