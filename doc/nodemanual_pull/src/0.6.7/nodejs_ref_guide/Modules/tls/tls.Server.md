
## class tls.Server

This class is a subclass of [[net.Server `net.Server`]] and has the same methods as it. However, instead of accepting just raw TCP connections, it also accepts encrypted connections using TLS or SSL.




## tls.Server.addContext(hostname, credentials) -> Void
- hostname (String):  The hostname to match
- credentials (Object):  The credentials to use

Add secure context that will be used if client request's SNI hostname is matching passed `hostname` (wildcards can be used). `credentials` can contain `key`, `cert`, and `ca`.

#### Example
		var serverResults = [];

		var server = tls.createServer(serverOptions, function(c) {
		  serverResults.push(c.servername);
		});

		server.addContext('a.example.com', SNIContexts['a.example.com']);
		server.addContext('*.test.com', SNIContexts['asterisk.test.com']);

		server.listen(1337);

 



## tls.Server.address() -> String

Returns the bound address and port of the server as reported by the operating system. 

For more information, see [[net.Server.address `net.Server.address()`]].

 



## tls.Server.close() -> Void


Stops the server from accepting new connections. This function is asynchronous, and the server is finally closed when it emits a `'close'` event.

 



## tls.Server.listen(port, [host], [callback()]) -> Void
- port (Number): The specific port to listen to
- host (String):  An optional host to listen to
- callback (Function):  An optional callback to execute when the server has been bound

Begin accepting connections on the specified `port` and `host`.  If the `host` is omitted, the server will accept connections directed to any IPv4 address (`INADDR_ANY`).

For more information, see [[net.Server `net.Server`]].

 


## tls.Server.pause(msecs=1000) -> Void
- msecs (Number): The number of milliseconds to pause for

Stop accepting connections for the given number of milliseconds. This could be useful for throttling new connections against DoS attacks or other oversubscriptions.

 


## tls.Server.connections -> Number

The number of concurrent connections on the server.






## tls.Server.maxConnections -> Number

Set this property to reject connections when the server's connection count gets high.

 
