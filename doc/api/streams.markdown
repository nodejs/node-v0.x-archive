# Status of this Document

This is a proposal.  It does not match the code as of writing.

This describes the minimum contract that Stream objects must adhere to
in order to properly interoperate with pipes.

# Stream Class

The parent class for all stream objects.  Implements the `pipe`
method, and a default "pass-through" no-op filter interface.

Streams that inherit from the Stream base class SHOULD override
methods with their implementation-specific functionality, as
appropriate, but the methods on the base class will provide a bare
minimum amount of functionality.

* `writable=false`, `readable=false`

    The base class is neither writable nor readable by default.  One or
    both of these must be set on the child instances.

* `bool write(chunk, callback=null)`

    The base class write method emits a `data` event with the provided
    chunk, calls the callback function if supplied, and returns true.

    If called after `end()`, then MUST throw.  Otherwise, MUST NOT
    throw.

    The callback function MUST be called asynchronously.

* `bool end(chunk=null, callback=null)`

    Writes the supplied chunk if provided, sets `ended=true`, emits
    `end`, and returns true.

    Calls the supplied callback on nextTick.

    If called more than once, then MUST throw.  Otherwise, MUST NOT
    throw.

    The callback function MUST be called asynchronously.

* `bool flush(callback=null)`

    Returns true, and calls the supplied callback on nextTick.

    If called after `end()` then MUST throw.  Otherwise, MUST NOT throw.

    Note: Calling Stream.flush() does not indicate that an entire pipe
    chain of Streams is flushed, but merely that this particular
    stream's write queue is empty.

    The callback function MUST be called asynchronously.

* `destroy(cb)`

    Emit `destroy`, and then `end`.  Call the supplied callback on
    nextTick.  If called multiple times, does nothing after the first
    call.

    Since `destroy()` may be called multiple times, it MUST be
    idempotent, and do nothing if `destroy()` has already been called on
    the stream.

* `pause()`, `resume()`

    Emits `pause` or `resume`, respectively.

* `pipe()`

    Proxies data and end events from the `this` (readable stream)
    to the writable `dest` stream, managing backpressure and event
    proxying appropriately.

        Event ----------------> Result
        src.on('data') -------> dest.write(data)
        src.on('end') --------> dest.end()
        dest.on('pause') -----> src.pause()
        dest.on('resume') ----> src.resume()
        ! dest.write(c) ------> src.pause()
        dest.on('destroy') ---> src.destroy()
        dest.on('error', e) --> src.emit('error', e)
        src.pipe('dest') -----> dest.emit('pipe', src)

    The `dest` writable stream MUST be returned.


# Writable Streams

Writable Streams SHOULD be an `instanceof` the Stream base class, but
this is optional.

Writable Streams MUST implement the following members and methods:

* `writable=true`

    MUST have a `writable` flag set to `true`.

    After being destroyed or ended, this flag MUST be set to `false`.

* `bool write(chunk, callback=null)`

    If the chunk can be written entirely without buffering, then the
    function SHOULD return true.

    If the chunk must be stored in a write queue, and the upstream
    readable stream should be
    paused, then the `write` method MUST return `false`.  If `write`
    returns `false` then it MUST emit a `drain` event when the queue is
    emptied.

    If a `callback` function is provided, then it MUST be called when
    the chunk has been completely written, and MUST NOT be called prior
    to nextTick.

    If `write` is called after `end`, then it SHOULD throw.

    * "write queue"

        The specifics of queueing or buffering data chunks on writable
        streams is an implementation detail which may vary from stream to
        stream, and need not be any sort of externally visible "queue".

        Semantically, a `false` return from `write()` means "Please do
        not continue to write to this stream, because doing so may have
        adverse affects".  However, it is a strictly advisory message.

* `bool end(chunk=null, callback=null)`

    The `end` method indicates that no more `write` calls will follow.

    If a chunk is passed in as the first argument then it MUST be passed
    to `this.write()`.  If a callback is provided as the last argument,
    then it MUST be called when the stream's write queue is completely
    flushed, or on nextTick.  The return value MUST be `false`
    if there are buffered chunks in the write queue, and SHOULD be
    `true` if the queue is empty.

    If `end()` returns false, then it MUST emit a `drain` event at some
    point in the future.

* `destroy(callback=null)`

    Clean up all worker threads, file descriptors, open sockets, or
    whatever else may be associated with the stream, and immediately emit
    `destroy` to indicate that it is no longer valid.

    Note that `destroy()` is destructive, and should only be called when
    it is acceptable to lose data, for example, to forcibly shut down a
    TCP stream when the response is finished.

    If there is no work for a `destroy` method to perform, then it MUST
    at least emit the `destroy` event.

    If a callback is provided, then it MUST be called when the cleanup
    is complete, but MUST NOT be called before nextTick.

Writable streams SHOULD implement the following functions:

* `bool flush(callback=null)`

    Make a best effort to push out any pending writes, even if doing so
    would degrade performance or be otherwise sub-optimal.

    Return value MUST be `false` if there are still pending writes that
    could not yet be flushed.  Return value SHOULD be `true` if there
    are no additional data chunks waiting to be processed.

    If a callback is provided, then it MUST be called once the write
    queue is emptied, and MUST NOT be called before nextTick.

Writable streams MUST implement the following events:

* `emit('drain')`

    If a `write()` call returns `false`, then a `drain` event MUST
    be emitted when the queue is drained.

* `emit('destroy')`

    Emitted when `destroy()` is called.

Writable Streams SHOULD implement the following events:

* `emit('close')`

    When all the underlying machinery of a stream is completely cleaned
    up, sockets closed, threads completed, file descriptors closed, then
    a writable stream SHOULD emit a `close` event.

# Readable Streams

Readable Streams SHOULD be an `instanceof` the Stream base class, but
this is optional.

Readable Streams MUST implement the following members and methods:

* `readable=true`

    MUST have a `readable` flag set to `true`.

    After being destroyed or ended, this flag MUST be set to `false`.

* `pause()`

    When `pause()` is called, the stream SHOULD stop emitting any `data`
    events.

* `resume()`

    If paused, then `resume()` MUST cause data events to begin emitting
    again.

* `pipe(dest)`

    See above under Stream base class.

    Readable Streams MAY override the `pipe()` method from the Stream
    base class, but SHOULD call `Stream.prototype.pipe.call(this, dest)`
    at some point.

    The `dest` writable stream MUST be returned.

* `destroy(callback=null)`

    Clean up all worker threads, file descriptors, open sockets, or
    whatever else may be associated with the stream.  Stream MUST emit
    `destroy` when the `destroy()` method is called.

    Note that `destroy()` is destructive, and should only be called when
    it is acceptable to lose data, for example, to forcibly shut down a
    TCP stream when the response is finished.

    This method MUST be idempotent, and MUST NOT throw or have other
    deleterious effects when called multiple times on the same object.

    An example `destroy()` method:

        MyReadStream.prototype.destroy = function(callback) {
          this.fd = null;
          this._binding = null;
          Stream.prototype.destroy.call(this, callback);
        };

Readable Strams MUST implement the following events:

* `emit('data', chunk)`

    Whenever data is available, if not paused, then the stream MUST emit
    a data event with the data as an argument.

    `data` events MUST NOT be emitted without a chunk argument.

    `data` events MAY be emitted while paused.

* `emit('end')`

    When no more data is going to be emitted, the stream MUST emit an
    `end` event.

    This event MUST be emitted eventually by all readable streams, even
    in cases where `error` is emitted, or `destroy()` is called.

Readable Streams SHOULD implement the following events:

* `emit('close')`

    When all the underlying machinery of a stream is completely cleaned
    up, sockets closed, threads completed, file descriptors closed, then
    a readable stream SHOULD emit a `close` event.

# Filter Streams

Filter Streams are streams that are both readable and writable, where a
`write()` method call corresponds to a `data` event being emitted at
some later time.

In order to properly proxy the events used by Stream.pipe, Filter
streams SHOULD have the following additions to the ReadableStream and
WritableStream APIs:

* `allowHalfOpen=true`

    The `allowHalfOpen` flag MUST be set to `true` for filter streams.

* `pause()` -> `pause` event

    The `pause()` method, in addition to halting the flow of `data`
    events, SHOULD emit a `pause` event so that upstream writers can be
    paused before the backpressure builds up.

* `resume()` -> `resume` event

    The `resume()` method, in addition to allowing a paused stream to
    begin flowing data events again, SHOULD emit a `resume` event, so
    that upstream writers can begin sending data before the `drain`
    events propagate back.

* `destroy(cb)`

    Filter streams MUST emit the `destroy` event like a writable stream,
    in addition to emitting the `end` event like a readable stream.

    Since `destroy()` may be called multiple times, it MUST be
    idempotent, and do nothing if `destroy()` has already been called on
    the stream.

# Duplex Streams

Duplex Streams are streams that are both readable and writable, where
the `write()` calls are messages *to* another agent, and the `data`
events are messages *from* that same agent.

In these cases, it may make sense to exist in a half-duplex state, where
either the readable or the writable aspect of the stream is preserved,
but the other is destroyed.

* `bool allowHalfOpen`

    The `allowHalfOpen` flag MUST be set to `true` if it supports this.

* `close(chunk=null, callback=null)`

    Semantically, this is sugar for:

        stream.end(chunk, function() {
          stream.destroy(callback);
        });

    However, when it is known that a duplex stream will be completely
    destroyed after the write queue is empty, then the `close()` method
    SHOULD be used, so that implementation-specific optimizations can be
    executed.  For example, a TCP stream could stop reading on the
    socket file descriptor.

* `end(chunk=null, callback=null)`

    On Duplex Streams, the `end()` method means that no more data will
    be written.  However, it does **not** correspond directly to an
    `end` event being emitted, if the stream can exist in a half-open
    state.

    If `allowHalfOpen` is not set to `true`, then this MUST cause the
    stream to be fully destroyed once the write queue is flushed.

* `destroy(cb)`

    The destroy method MUST forcibly shut down both sides of the
    stream, and emit a `destroy` event immediately.  If a callback
    is supplied, then it MUST be called when the stream destruction is
    complete, and MUST NOT be called before nextTick.

    Since `destroy()` may be called multiple times, it MUST be
    idempotent, and do nothing if `destroy()` has already been called on
    the stream.

# Using Streams

Some guidelines and summary information for the Stream code contract:

* Use the `pipe()` method to connect streams.

    This is the best way to ensure that errors and events are handled
    appropriately.

* Errors propagate back up the `pipe()` chain.

    In the case where you have a Readable stream `A`, a
    readable/writable filter `B`, and a writable stream `C`, you'd do
    this:

        A.pipe(B).pipe(C);

    If `C` emits an `error` event, then it will be proxied to the `B`
    object, and then to the A object.  So, the best way to catch all
    errors is to do:

        A.pipe(B).pipe(C);
        A.on('error', handleErrors);

* Readable Streams: `end` MUST be emitted at some point.

    Even if the stream was destroyed, or encountered an error, the `end`
    event must be guaranteed to be emitted at some point in lifetime of
    the stream object.

# Issues

* Event propagation in circular pipe chains

    Consider this Stream.pipe chain:

        A.pipe(B).pipe(C).pipe(A)

    where A is a duplex stream, and B and C are filters.  A more
    realistic situation where this can occur:

        net.createServer(function (socket) {
          socket.pipe(rot13Filter).pipe(GzipFilter).pipe(socket);
        });

    So, the incoming data from the socket is rot13'd, and then gzipped,
    and then sent back to the client.

    Consider what happens when an `error` event is raised in stream C:

    1. `C.emit("error")`
    2. `B.emit("error")`
    3. `A.emit("error")`

    At this point, presumably we catch and handle the error.
    However, according to the `Stream.pipe` semantics, it will
    **still** cause another error event to be emitted by C, since
    `C` is upstream from `A`.

    A similar problem can be seen in a simple
    echo server duplex stream:

        net.createServer(function (socket) {
          socket.pipe(socket);
        });

    Any `error` event on the socket will cause another `error` event to
    be emitted on the same object, and cause a RangeError.

    The same behavior would occur with `destroy` events.  However, the
    semantics are such that the cycle will be broken by the fact that
    calling `stream.destroy()` a second time must do *nothing*, not even
    emit `destroy` again.
