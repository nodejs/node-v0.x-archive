


## class net.Server

This class is used to create a TCP or UNIX server. A server is a `net.Socket` that can listen for new incoming connections.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/net/net.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





## net.Server@listening()


Emitted when the server has been bound after calling `server.listen`.


 



## net.Server@connection(socket)
- socket (net.Socket): An instance of `net.Socket`

Emitted when a new connection is made.

 


## net.Server@close()

Emitted when the server closes.


 


## net.Server@error(exception)

Emitted when an error occurs.  The `'close'` event is called directly following this event.  See an example in the discussion of [[net.Server.listen `net.Server.listen`]]


 


## net.Server.listen(port [, host] [, listeningListener]) -> Void
net.Server.listen(path [, listeningListener]) -> Void
- port (Number): The port to connect to
- host (String): The name of the host to connect to
- connectionListener (Function): Automatically set as a listener for the [[net.Server@listening `'listening'`]] event

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

<Note>All sockets in Node.js set `SO_REUSEADDR` already.</Note>

 


## net.Server.pause(msecs=1000) -> Void
- msecs (Number): The number of milliseconds to pause for

Stop accepting connections for the given number of milliseconds. This could be useful for throttling new connections against DoS attacks or other oversubscriptions.

 



## net.Server.close() -> Void

Stops the server from accepting new connections. This function is asynchronous, and  the server is finally closed when it emits a `'close' event.






## net.Server.address() -> Object

Returns the bound address and port of the server as reported by the operating system. Useful to find which port was assigned when giving getting an OS-assigned address. 

This returns an object with two properties, like this:

    {"address":"127.0.0.1", "port":2121}`

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/net/net.server.address.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 




## net.Server.maxConnections -> Number

Set this property to reject connections when the server's connection count gets high.






## net.Server.connections -> Number

The number of concurrent connections on the server.


 



