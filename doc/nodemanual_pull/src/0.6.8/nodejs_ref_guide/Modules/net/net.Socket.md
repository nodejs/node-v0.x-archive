

## class net.Socket

This object is an abstraction of a TCP or UNIX socket. `net.Socket` instances implement a duplex Stream interface.  They can be created by the user and used as a client (with `connect()`) or they can be created by Node.js and passed to the user through the `'connection'` event of a server.






## new net.Socket([options])
- options (Object): An object of options you can pass

Constructs a new socket object.

`options` is an object with the following defaults:

    { 
      fd: null
      type: null
      allowHalfOpen: false
    }

where

* `fd` allows you to specify the existing file descriptor of socket. 
* `type` specifies the underlying protocol. It can be `'tcp4'`, `'tcp6'`, or `'unix'`.
* `allowHalfOpen` is a boolean indicating how the socket should end. For more information, see the [[net.Socket.createServer `createServer()`]] method and the [[net.Socket@end `'end'`]] event.

 



## net.Socket.connect(port [, host=localhost] [, connectListener])
- port (Number): The port to connect to
- host (String): The name of the host to connect to; it's entirely optional, as you can just use `(port, connectListener)` if you wish
- connectionListener (Function): Automatically set as a listener for the [[net.Server@connection `'connection'`]] event

Opens the connection for a given socket. If `port` and `host` are given, then the socket is opened as a TCP socket. If a `path` is given, the socket is opened as a Unix socket to that path.

Normally this method isn't needed, as `net.createConnection()` opens the socket. Use this only if you are implementing a custom Socket or if a Socket is closed and you want to reuse it to connect to another server.

This function is asynchronous. When the `'connect'` event is emitted the socket is established. If there is a problem connecting, the `'connect'` event  isn't emitted,  and the `'error'` event is emitted with the exception.

 



## net.Socket.bufferSize -> Number

`net.Socket` has the property that `socket.write()` always works. This is to help users get up and running quickly. The computer can't always keep up with the amount of data that is written to a socket&mdash;the network connection simply might be too slow. Node.js will internally queue up the data written to a socket and send it out over the wire whenever it's possible. (Internally, it's polling on the socket's file descriptor for being writable.)

The consequence of this internal buffering is that memory may grow. This property shows the number of characters currently buffered to be written.  The number of characters is approximately equal to the number of bytes to be written, but the buffer may contain strings, and the strings are lazily encoded, so the _exact_ number of bytes is not known.

<Note>Users who experience a large or growing `bufferSize` should attempt to "throttle" the data flows in their program with `pause()` and `resume()`.</Note>




## net.Socket.setEncoding([encoding=null]) -> Void
- encoding (String): The encoding to use (either `'ascii'`, `'utf8'`, or `'base64'`)

Sets the encoding for data that is received.

 


### deprecated: 0.3.0
## net.Socket.setSecure()

This function was used to upgrade the connection to SSL/TLS. See the [[tls TLS]] section for the new API.





## net.Socket.write(data [, encoding='utf8'] [, callback()]) -> Boolean
- data (String): The data to write
- enocding (String): The encoding to use
- callback (Function): The callback to execute once the write is finished

Sends data on the socket. The second parameter specifies the encoding in the case of a string&mdash;it defaults to UTF8 encoding.

Returns `true` if the entire data was flushed successfully to the kernel buffer. Returns `false` if all or part of the data was queued in user memory. `'drain'` is emitted when the buffer is again free.

 



## net.Socket.end([data] [, encoding]) -> Void
- data (String): The data to write first
- encoding (String):  The encoding to use

Half-closes the socket, _i.e._, it sends a FIN packet. It is possible the server can still send some data.

If `data` is specified, it's equivalent to calling `socket.write(data, encoding)` followed by `socket.end()`.

 



## net.Socket.destroy() -> Void

Ensures that no more I/O activity happens on this socket. Only necessary in case of errors (like with a parse error).




## net.Socket.pause() -> Void

Pauses the reading of data. That is, `'data'` events are no longer emitted. Useful to throttle back an upload.


 


## net.Socket.resume() -> Void

Resumes reading after a call to `pause()`.

 


## net.Socket.setTimeout(timeout, [callback()]) -> Void
- timeout (Number): The timeout length (in milliseconds)
- callback (Function):  The function to execute as a one time listener for the `'timeout'` event.

Sets the socket to timeout after `timeout` milliseconds of inactivity on the socket. By default `net.Socket` don't have a timeout.

When an idle timeout is triggered the socket will receive a `'timeout'` event but the connection will not be severed. The user must manually `end()` or `destroy()` the socket.

If `timeout` is 0, then the existing idle timeout is disabled.

 



## net.Socket.setNoDelay([noDelay=true]) -> Void
- noDelay (Boolean): If `true`, immediately fires off data each time `socket.write()` is called.

Disables [the Nagle algorithm](http://en.wikipedia.org/wiki/Nagle's_algorithm). By default TCP connections use the Nagle algorithm, they buffer data before sending it off. 

 



## net.Socket.setKeepAlive([enable=false] [, initialDelay=0]) -> Void
- enable (Boolean): Enables or disables whether to stay alive
- initialDelay (Number):  The delay (in milliseconds) between the last data packet received and the first keepalive probe

Enable and disable keep-alive functionality, and optionally set the initial delay before the first keepalive probe is sent on an idle socket.

Setting `initialDelay` to 0 for leaves the value unchanged from the default (or previous) setting.


#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/net/net.server.address.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 





## net.Socket.address() -> Object

Returns the bound address and port of the socket as reported by the operating system. Returns an object with two properties that looks like this:

		{"address":"192.168.57.1", "port":62053}
 



## net.Socket.remoteAddress -> String


The string representation of the remote IP address. For example, `'74.125.127.100'` or `'2001:4860:a005::68'`.

 



## net.Socket.remotePort -> Number


The numeric representation of the remote port. For example, `80` or `21`.

 



## net.Socket.bytesRead -> Number


The amount of received bytes.

 



## net.Socket.bytesWritten -> Number


The amount of bytes sent.

 



## net.Socket@connect()


Emitted when a socket connection is successfully established. For more information, see [[net.Socket.connect `connect()`]].

 



## net.Socket@data(data)
- data (Buffer | String): A `Buffer` or `String`, depending on what it is

Emitted when data is received. The encoding of `data` is set by `socket.setEncoding()`.

For more information, see the [[streams.ReadableStream ReadableStream]] section.

 



## net.Socket@end()

By default (when `allowHalfOpen == false`), the socket destroys its file descriptor once it has written out its pending write queue. However, by setting `allowHalfOpen == true` the socket won't automatically `end()` its side, allowing the user to write arbitrary amounts of data, with the caveat that the user is required to `end()` their side now.

Emitted when the other end of the socket sends a FIN packet.

 


### related to: net.Socket.setTimeout
## net.Socket.timeout() -> Void

Emitted if the socket times out from inactivity. This is only to notify that the socket has been idle. The user must manually close the connection.


 


### related to: net.Socket.write
## net.Socket.drain() -> Void

Emitted when the write buffer becomes empty. Can be used to throttle uploads.


 



## net.Socket.error(exception)
- exception (Error): Any exceptions encountered

Emitted when an error occurs.  The `'close'` event is called directly following this event.

 



## net.Socket.close(had_error)
- had_error (Boolean): A `true` boolean if the socket was closed due to a transmission error

Emitted once the socket is fully closed.

 