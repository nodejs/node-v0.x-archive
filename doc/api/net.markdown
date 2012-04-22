## net

    Stability: 3 - Stable
    
The `net` module provides you with an asynchronous network wrapper. It contains methods for creating both servers and clients (called streams). You can include this module in your code with `require('net');`


#### Example

Here is an example of a echo server which listens for connections on port 8124:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/net/net.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

You can test this by using `telnet`:

    telnet localhost 8124

To listen on the socket `/tmp/echo.sock` the third line from the last would just be changed to

    server.listen('/tmp/echo.sock', function() { //'listening' listener

You can use `nc` to connect to a UNIX domain socket server:

    nc -U /tmp/echo.sock

### net.createServer([options = {allowHalfOpen: false}] [, connectionListener])
- options {Object}   An object with any options you want to include
- connectionListener {Function}  Automatically set as a listener for the [[net.Server@connection `'connection'`]] event

Creates a new TCP server. 

If `allowHalfOpen` is `true`, then the socket won't automatically send FIN packet when the other end of the socket sends a FIN packet. The socket becomes non-readable, but still writable. You should call the `end()` method explicitly. See ['end'](#event_end_) event for more information.



### net.connect(port, [host='localhost'] [, connectionListener()])
### net.connect(port, [,connectionListener()])
- port {Number}  The port to connect to
- host {String}  The name of the host to connect to
- connectionListener {Function}  Automatically set as a listener for the [[net.Server@connection `'connection'`]] event
(alias of: createConnection)

Construct a new socket object and opens a socket to the given location. When the socket is established, the `'connect'` event is emitted.

The arguments for these methods change the type of connection. For example, if you include `host`, you create a TCP connection to `port` on `host`. If you don't include it, you create a unix socket connection to `path`.

### net.createConnection(port, [host='localhost'] [, connectionListener()])
### net.createConnection(port, [,connectionListener()])
- port {Number}  The port to connect to
- host {String}  The name of the host to connect to
- connectionListener {Function}  Automatically set as a listener for the [[net.Server@connection `'connection'`]] event

Construct a new socket object and opens a socket to the given location. When the socket is established, the `'connect'` event is emitted.

The arguments for these methods change the type of connection. For example, if you include `host`, you create a TCP connection to `port` on `host`. If you don't include it, you create a unix socket connection to `path`.

### net.isIP(input), String
- input {String}  The data to check against

Tests if `input` is an IP address. Returns `0` for invalid strings, returns `4` for IP version 4 addresses, and returns `6` for IP version 6 addresses.


### net.isIPv4(input), String
- input {String}  The data to check against

Returns `true` if input is a version 4 IP address.

### net.isIPv6(input), String
- input {String}  The data to check against

Returns `true` if input is a version 6 IP address. 

## net.Server

This class is used to create a TCP or UNIX server. A server is a `net.Socket` that can listen for new incoming connections.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/net/net.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### net.Server@listening()


Emitted when the server has been bound after calling `server.listen`.


### net.Server@connection(socket)
- socket {net.Socket}  An instance of `net.Socket`

Emitted when a new connection is made.

### net.Server@close()

Emitted when the server closes.


### net.Server@error(exception)

Emitted when an error occurs.  The `'close'` event is called directly following this event.  See an example in the discussion of [[net.Server.listen `net.Server.listen`]]


### net.Server.listen(port [, host] [, listeningListener])
### net.Server.listen(path [, listeningListener])
- port {Number}  The port to connect to
- host {String}  The name of the host to connect to
- connectionListener {Function}  Automatically set as a listener for the [[net.Server@listening `'listening'`]] event

Begin accepting connections on the specified `port` and `host`.  If the `host` is omitted, the server accepts connections directed to any IPv4 address (`INADDR_ANY`). A port value of zero will assign a random port.

This function is asynchronous.  When the server has been bound, the `'listening'` event is emitted.

One issue some users run into is getting `EADDRINUSE` errors. This means that another server is already running on the requested port. One way of handling this would be to wait a second and then try again. This can be done with

    server.on('error', function (e) {
      if (e.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(function () {
          server.close();
          server.listen(PORT, HOST);
        }, 1000);
      }
    });

Note: All sockets in Node.js set `SO_REUSEADDR` already.


### net.Server.pause(msecs=1000)
- msecs {Number}  The number of milliseconds to pause for

Stop accepting connections for the given number of milliseconds. This could be useful for throttling new connections against DoS attacks or other oversubscriptions.

### net.Server.close()

Stops the server from accepting new connections. This function is asynchronous, and  the server is finally closed when it emits a `'close' event.


### net.Server.address(), Object

Returns the bound address and port of the server as reported by the operating system. Useful to find which port was assigned when giving getting an OS-assigned address. 

This returns an object with two properties, like this:

    {"address":"127.0.0.1", "port":2121}`

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/net/net.server.address.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>


### net.Server.maxConnections, Number

Set this property to reject connections when the server's connection count gets high.


### net.Server.connections, Number

The number of concurrent connections on the server.

## net.Socket

This object is an abstraction of a TCP or UNIX socket. `net.Socket` instances implement a duplex Stream interface.  They can be created by the user and used as a client (with `connect()`) or they can be created by Node.js and passed to the user through the `'connection'` event of a server.


### new net.Socket([options])
- options {Object}  An object of options you can pass

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
* `allowHalfOpen` is a boolean indicating how the socket should end. For more information, see the [[net.createServer `createServer()`]] method and the [[net.Socket@end `'end'`]] event.


### net.Socket.connect(port [, host=localhost] [, connectionListener()])
- port {Number}  The port to connect to
- host {String}  The name of the host to connect to; it's entirely optional, as you can just use `(port, connectListener)` if you wish
- connectionListener {Function}  Automatically set as a listener for the [[net.Server@connection `'connection'`]] event

Opens the connection for a given socket. If `port` and `host` are given, then the socket is opened as a TCP socket. If a `path` is given, the socket is opened as a Unix socket to that path.

Normally this method isn't needed, as `net.createConnection()` opens the socket. Use this only if you are implementing a custom Socket or if a Socket is closed and you want to reuse it to connect to another server.

This function is asynchronous. When the `'connect'` event is emitted the socket is established. If there is a problem connecting, the `'connect'` event  isn't emitted,  and the `'error'` event is emitted with the exception.


### net.Socket.bufferSize, Number

`net.Socket` has the property that `socket.write()` always works. This is to help users get up and running quickly. The computer can't always keep up with the amount of data that is written to a socket—the network connection simply might be too slow. Node.js will internally queue up the data written to a socket and send it out over the wire whenever it's possible. (Internally, it's polling on the socket's file descriptor for being writable.)

The consequence of this internal buffering is that memory may grow. This property shows the number of characters currently buffered to be written.  The number of characters is approximately equal to the number of bytes to be written, but the buffer may contain strings, and the strings are lazily encoded, so the _exact_ number of bytes is not known.

Note: Users who experience a large or growing `bufferSize` should attempt to "throttle" the data flows in their program with `pause()` and `resume()`.


### net.Socket.setEncoding([encoding=null])
- encoding {String}  The encoding to use (either `'ascii'`, `'utf8'`, or `'base64'`)

Sets the encoding for data that is received.

### net.Socket.setSecure()
(deprecated: 0.3.0)

This function was used to upgrade the connection to SSL/TLS. See the [[tls TLS]] section for the new API.


### net.Socket.write(data [, encoding='utf8'] [, callback()]), Boolean
- data {String}  The data to write
- enocding {String}  The encoding to use
- callback {Function}  The callback to execute once the write is finished

Sends data on the socket. The second parameter specifies the encoding in the case of a string—it defaults to UTF8 encoding.

Returns `true` if the entire data was flushed successfully to the kernel buffer. Returns `false` if all or part of the data was queued in user memory. `'drain'` is emitted when the buffer is again free.

### net.Socket.end([data] [, encoding])
- data {String}  The data to write first
- encoding {String}   The encoding to use

Half-closes the socket, _i.e._, it sends a FIN packet. It is possible the server can still send some data.

If `data` is specified, it's equivalent to calling `socket.write(data, encoding)` followed by `socket.end()`.

### net.Socket.destroy()

Ensures that no more I/O activity happens on this socket. Only necessary in case of errors (like with a parse error).

### net.Socket.pause()

Pauses the reading of data. That is, `'data'` events are no longer emitted. Useful to throttle back an upload.


### net.Socket.resume()

Resumes reading after a call to `pause()`.

### net.Socket.setTimeout(timeout, [callback()])
- timeout {Number}  The timeout length (in milliseconds)
- callback {Function}   The function to execute as a one time listener for the `'timeout'` event.

Sets the socket to timeout after `timeout` milliseconds of inactivity on the socket. By default `net.Socket` don't have a timeout.

When an idle timeout is triggered the socket will receive a `'timeout'` event but the connection will not be severed. The user must manually `end()` or `destroy()` the socket.

If `timeout` is 0, then the existing idle timeout is disabled.

### net.Socket.setNoDelay([noDelay=true])
- noDelay {Boolean}  If `true`, immediately fires off data each time `socket.write()` is called.

Disables [the Nagle algorithm](http://en.wikipedia.org/wiki/Nagle's_algorithm). By default TCP connections use the Nagle algorithm, they buffer data before sending it off. 

### net.Socket.setKeepAlive([enable=false] [, initialDelay=0])
- enable {Boolean}  Enables or disables whether to stay alive
- initialDelay {Number}   The delay (in milliseconds) between the last data packet received and the first keepalive probe

Enable and disable keep-alive functionality, and optionally set the initial delay before the first keepalive probe is sent on an idle socket.

Setting `initialDelay` to 0 for leaves the value unchanged from the default (or previous) setting.


#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/net/net.server.address.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>


### net.Socket.address(), Object

Returns the bound address and port of the socket as reported by the operating system. Returns an object with two properties that looks like this:

		{"address":"192.168.57.1", "port":62053}

### net.Socket.remoteAddress, String


The string representation of the remote IP address. For example, `'74.125.127.100'` or `'2001:4860:a005::68'`.

### net.Socket.remotePort, Number


The numeric representation of the remote port. For example, `80` or `21`.

### net.Socket.bytesRead, Number


The amount of received bytes.

### net.Socket.bytesWritten, Number


The amount of bytes sent.

### net.Socket@connect()


Emitted when a socket connection is successfully established. For more information, see [[net.Socket.connect `connect()`]].

### net.Socket@data(data)
- data {Buffer | String}  A `Buffer` or `String`, depending on what it is

Emitted when data is received. The encoding of `data` is set by `socket.setEncoding()`.

For more information, see the [[streams.ReadableStream ReadableStream]] section.

### net.Socket@end()

By default (when `allowHalfOpen == false`), the socket destroys its file descriptor once it has written out its pending write queue. However, by setting `allowHalfOpen == true` the socket won't automatically `end()` its side, allowing the user to write arbitrary amounts of data, with the caveat that the user is required to `end()` their side now.

Emitted when the other end of the socket sends a FIN packet.

### net.Socket.timeout()
(related to: net.Socket.setTimeout)

Emitted if the socket times out from inactivity. This is only to notify that the socket has been idle. The user must manually close the connection.


### net.Socket.drain()
(related to: net.Socket.write)

Emitted when the write buffer becomes empty. Can be used to throttle uploads.


### net.Socket.error(exception)
- exception {Error}  Any exceptions encountered

Emitted when an error occurs.  The `'close'` event is called directly following this event.

### net.Socket.close(had_error)
- had_error {Boolean}  A `true` boolean if the socket was closed due to a transmission error

Emitted once the socket is fully closed.
