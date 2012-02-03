
### section: http_Module
## class http.Server

A representation of the server within the `http` module. To create an HTTP server, you'll need to first call [[http.createServer `http.createServer()`]], with something like this:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/http/http.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

This object is also an [[eventemitter `EventEmitter`]].

For more information, read [this article on how to create HTTP servers](../nodejs_dev_guide/creating_an_http_server.html).

 

/* 
http.Server@request(request, response)
- request (http.ServerRequest):  An instance of [[http.ServerRequest]]
- response (http.ServerResponse):  An instance of [[http.ServerResponse]]

Emitted each time there is a request. Note that, in the case of keep-alive connections, there may be multiple requests per connection.

 



## http.Server@connection(socket)
- socket (net.Socket): An object of type [[net.Socket `net.Socket`]]

Emitted when a new TCP stream is established. Usually users won't want to access this event. The `socket` can also be accessed at [[http.ServerRequest.connection]].

 


## http.Server@close(socket)
- socket (net.Socket): An object of type [[net.Socket `net.Socket`]]

Emitted when the server closes.
 


## http.Server@checkContinue(request, response)
- request  (http.ServerRequest): An instance of `http.ServerRequest`
- response (http.ServerResponse): An instance of `http.ServerResponse`

Emitted each time a request with an `http Expect: 100-continue` is received. If this event isn't listened for, the server will automatically respond with a `100 Continue` as appropriate.

Handling this event involves calling `response.writeContinue` if the client should continue to send the request body, or generating an appropriate HTTP response (_e.g._ `400 Bad Request`) if the client should not continue to send the request body.

<Note>When this event is emitted and handled, the `request` event is not be emitted.</Note>

 


## http.Server@upgrade(request, socket, head)
- request (http.ServerRequest): The arguments for the http request, as it is in the request event
- socket (Number): The network socket between the server and client
- head (Buffer):  The first packet of the upgraded stream; this can be empty

Emitted each time a client requests a http upgrade. If this event isn't listened for, then clients requesting an upgrade will have their connections closed.

After this event is emitted, the request's socket won't have a `data` event listener, meaning you will need to bind to it in order to handle data sent to the server on that socket.

 


## http.Server@clientError(exception)
- exception (Error): The exception being thrown

If a client connection emits an `'error'` event, it's forwarded here.

 
 



### related to: net.Server.listen
## http.Server.listen(port [, hostname] [, callback()])  -> Void
http.Server.listen(port [, callback()])  -> Void
- port (Number): The port to listen to
- hostname (String):  The hostname to listen to
- callback (Function):  The function to execute once the server has been bound to the port
 
Begin accepting connections on the specified port and hostname. If the hostname is omitted, the server accepts connections directed to any IPv4 address (`INADDR_ANY`). To listen to a Unix socket, supply a filename instead of port and hostname.

This function is asynchronous. The `callback()` is added as a listener for the <a href="net.html#event_listening_">'listening'</a> event.



 
 

### related to: net.Server.close
## http.Server.close() -> Void

Stops the server from accepting new connections.
 

