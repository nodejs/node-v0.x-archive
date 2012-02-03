
### section: Streams
## class streams.WritableStream

 


## streams.WritableStream.writable -> Boolean

A boolean that is `true` by default, but turns `false` after an `error` event occurs, the stream comes to an `'end'`, or if `destroy()` was called.




## streams.WritableStream@close()


Emitted when the underlying file descriptor has been closed.

 




## streams.WritableStream@drain()

After a `write()` method returns `false`, this event is emitted to indicate that it is safe to write again.

 



## streams.WritableStream@error(exception)
- exception (Error): The exception that was received

Emitted when there's an error with the exception `exception`.

 



## streams.WritableStream.destroy() -> Void

Closes the underlying file descriptor. The stream doesn't emit any more events. Any queued write data is not sent.





## streams.WritableStream.destroySoon() -> Void

After the write queue is drained, this closes the file descriptor. `destroySoon()` can still destroy straight away, as long as there is no data left in the queue for writes.


 


## streams.WritableStream.end() -> Void
streams.WritableStream.end(string, encoding) -> Void
streams.WritableStream.end(Buffer) -> Void
- string (String): The message to send
- encoding (String): The encoding to use
- buffer (Buffer):  The buffer to send

Terminates the stream with EOF or FIN. This call send queued write data before closing the stream.

For `streams.WritableStream.end(string, encoding)`, a `string` with the given `encoding` is sent. This is useful to reduce the number of packets sent.

For `streams.WritableStream.end(Buffer)`, a `buffer` is sent.





## streams.WritableStream.write(string, encoding='utf8' [, fd]) -> Void
streams.WritableStream.write(Buffer) -> Void
- string (String):  The string to write
- encoding (String):  The encoding to use; defaults to `utf8`
- fd (Number):  An optional file descriptor to pass
- buffer (Buffer): The buffer to write to

Writes `string` with the given `encoding` to the stream, or write `buffer`.  Returns `true` if the string has been flushed to the kernel buffer.  Returns `false` to indicate that the kernel buffer is full, and the data will be sent out in the future. The `drain` event indicates when the kernel buffer is empty again.

If `fd` is specified, it's interpreted as an integral file descriptor to be sent over the stream. This is only supported for UNIX streams, and is ignored otherwise. When writing a file descriptor in this manner, closing the descripton before the stream drains risks sending an invalid (closed) FD.

 


