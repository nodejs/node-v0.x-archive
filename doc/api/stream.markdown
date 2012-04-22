## streams

    Stability: 2 - Unstable

A stream is an abstract interface implemented by various objects in Node.js. For example, a request to an HTTP server is a stream, as is stdout. Streams can be readable, writable, or both. All streams are instances of [[eventemitter `EventEmitter`]].

For more information, see [this article on understanding streams](../nodejs_dev_guide/understanding_streams.html).

#### Example: Printing to the console
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/streams/streams.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: Reading from the console

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/streams/streams.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

## streams.ReadableStream



### streams.ReadableStream@close()

Emitted when the underlying file descriptor has been closed. Not all streams emit this.  For example, an incoming HTTP request don't emit `close`.

 


### streams.ReadableStream@data(data)
- data {Buffer | String}   The data being emitted

The `data` event emits either a `Buffer` (by default) or a string if `setEncoding()` was previously used on the stream.

 


### streams.ReadableStream@end()

Emitted when the stream has received an EOF (FIN in TCP terminology). Indicates that no more `data` events will happen. If the stream is also writable, it may be possible to continue writing.

 


### streams.ReadableStream@error()

Emitted if there was an error receiving data.
 


### streams.ReadableStream@pipe(src)
- src {streams.ReadableStream}  The readable stream

Emitted when the stream is passed to a readable stream's pipe method.

 


### streams.ReadableStream.destroy()

Closes the underlying file descriptor. The stream will not emit any more events.
 


### streams.ReadableStream.destroySoon()

After the write queue is drained, close the file descriptor.

 


### streams.ReadableStream.pause()

Pause any incoming `'data'` events.




### streams.ReadableStream.pipe(destination [, options]), streams
- destination {streams.WritableStream}   The WriteStream to connect to
- options {Object}   Any optional commands to send

This is the `Stream.prototype()` method available on all `Stream` objects. It connects this read stream to a `destination`. Incoming data on this stream is then written to `destination`. The destination and source streams are kept in sync by Node.js pausing and resuming as necessary.

This function returns the `destination` stream.

By default, `end()` is called on the destination when the source stream emits `end`, so that `destination` is no longer writable. Pass `{ end: false }` into `options` to keep the destination stream open.

#### Example 

Emulating the Unix `cat` command:

    process.stdin.resume(); // process.stdin is paused by default, so we need to start it up
    process.stdin.pipe(process.stdout); // type something into the console & watch it repeat

This keeps `process.stdout` open so that "Goodbye" can be written at the end.

    process.stdin.resume();

    process.stdin.pipe(process.stdout, { end: false });

    process.stdin.on("end", function() {
      process.stdout.write("Goodbye\n");
    });

 
 

/** related to: streams.ReadableStream.data
streams.ReadableStream.setEncoding(encoding)
- encoding {String}  The encoding to use; this can be `'utf8'`, `'ascii'`, or `'base64'`.

Makes the `data` event emit a string instead of a `Buffer`.

 


### streams.ReadableStream.resume()

Resumes the incoming `'data'` events after a `pause()`. 

 

## streams.WritableStream

 

### streams.WritableStream.writable, Boolean

A boolean that is `true` by default, but turns `false` after an `error` event occurs, the stream comes to an `'end'`, or if `destroy()` was called.



### streams.WritableStream@close()


Emitted when the underlying file descriptor has been closed.

 



### streams.WritableStream@drain()

After a `write()` method returns `false`, this event is emitted to indicate that it is safe to write again.

 


### streams.WritableStream@error(exception)
- exception {Error}  The exception that was received

Emitted when there's an error with the exception `exception`.

 


### streams.WritableStream.destroy()

Closes the underlying file descriptor. The stream doesn't emit any more events. Any queued write data is not sent.




### streams.WritableStream.destroySoon()

After the write queue is drained, this closes the file descriptor. `destroySoon()` can still destroy straight away, as long as there is no data left in the queue for writes.


 

### streams.WritableStream.end()
### streams.WritableStream.end(string, encoding)
### streams.WritableStream.end(Buffer)
- string {String}  The message to send
- encoding {String}  The encoding to use
- buffer {Buffer}   The buffer to send

Terminates the stream with EOF or FIN. This call send queued write data before closing the stream.

For `streams.WritableStream.end(string, encoding)`, a `string` with the given `encoding` is sent. This is useful to reduce the number of packets sent.

For `streams.WritableStream.end(Buffer)`, a `buffer` is sent.




### streams.WritableStream.write(string, encoding='utf8' [, fd])
### streams.WritableStream.write(Buffer)
- string {String}   The string to write
- encoding {String}   The encoding to use; defaults to `utf8`
- fd {Number}   An optional file descriptor to pass
- buffer {Buffer}  The buffer to write to

Writes `string` with the given `encoding` to the stream, or write `buffer`.  Returns `true` if the string has been flushed to the kernel buffer.  Returns `false` to indicate that the kernel buffer is full, and the data will be sent out in the future. The `drain` event indicates when the kernel buffer is empty again.

If `fd` is specified, it's interpreted as an integral file descriptor to be sent over the stream. This is only supported for UNIX streams, and is ignored otherwise. When writing a file descriptor in this manner, closing the descripton before the stream drains risks sending an invalid (closed) FD.

 


