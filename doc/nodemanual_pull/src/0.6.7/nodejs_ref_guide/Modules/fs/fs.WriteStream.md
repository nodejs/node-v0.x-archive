/**
class fs.WriteStream

This is a [Writable Stream](streams.WritableStream.html), created from the function [[fs.createWriteStream `fs.createWriteStream()`]].

For more information, see [the documentation on the `stream` object](streams.html).

**/ 

/**
fs.WriteStream@open(fd) -> Void
- fd (Number):  The file descriptor used by the `WriteStream`

Emitted when a file is opened for writing.

**/ 


/**
fs.WriteStream.bytesWritten -> Number

The number of bytes written so far. This doesn't include data that is still queued for writing.
**/

