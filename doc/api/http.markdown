## http

    Stability: 3 - Stable
    
The HTTP interfaces in Node.js are designed to support many features of the protocol which have been traditionally difficult to use. In particular, large, possibly chunk-encoded, messages. The interface is careful to never buffer entire requests or responses—the user is always able to stream data. To use the HTTP server and client, add `require('http')` to your code.

HTTP message headers are represented by an object like this:

    { 'content-length': '123',
      'content-type': 'text/plain',
      'connection': 'keep-alive',
      'accept': 'text/plain' }

Keys are lowercased, and values are not modifiable.

In order to support the full spectrum of possible HTTP applications, Node's HTTP API is very low-level. It deals with stream handling and message parsing only. It parses a message into headers and body but it does not parse the actual headers or the body.


For more information, read [this article on how to create HTTP servers](../nodejs_dev_guide/creating_an_http_server.html).

#### Example: The famous hello world

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/http/http.js?&linestart=3&lineend=0&showlines=false' defer='defer'></script>






### http.get(options, callback())
- options {Object}  Options to pass to the request
- callback {Function}   The callback to execute once the method finishes 

Since most requests are GET requests without bodies, Node.js provides this convenience method. The only difference between this method and [[http.request `http.request()`]] is that it sets the method to GET and calls `req.end()` automatically.

#### Example

    var options = {
      host: 'www.google.com',
      port: 80,
      path: '/index.html'
    };

    http.get(options, function(res) {
      console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });

 


### http.createServer(requestListener(options, requestListener)), http.Server
- requestListener {Function}  A function that is automatically added to the `'request'` event
- options {Object}   Any options you want to pass to the server
- requestListener {Function}  An optional listener

Returns a new web server object.

 


### http.globalAgent, http.Agent

This is the global instance of [[http.Agent `http.Agent`]] which is used as the default for all HTTP client requests.

 


### http.globalAgent.requests, Object

An object which contains queues of requests that have not yet been assigned to  sockets. **Don't modify this!**




### http.request(options, callback(response)), http.ClientRequest
- options {Object}  Options to pass to the request
- callback {Function}   The callback to execute once the method finishes
- response {http.ClientRequest}  The server's response, including headers and status code

Node.js maintains several connections per server to make HTTP requests. This function allows one to transparently issue requests.  

The `options` align with the return value of [[url.parse `url.parse()`]]:

- `host`: a domain name or IP address of the server to issue the request to. Defaults to `'localhost'`.
- `hostname`: To support `url.parse()`, `hostname` is preferred over `host`
- `port`: the port of the remote server. Defaults to `80`.
- `socketPath`: the Unix Domain Socket (in other words, use either `host:port` or `socketPath`)
- `method`: a string specifying the HTTP request method. Defaults to `'GET'`.
- `path`: the request path. Defaults to `'/'`. This should include a query string (if any) For example, `'/index.html?page=12'`
- `headers`: an object containing request headers
- `auth`: used for basic authentication. For example, `'user:password'` computes an Authorization header.
- `agent`: this controls [[http.Agent `http.Agent`]] behavior. When an Agent is used, the request defaults to `Connection: keep-alive`. The possible values are:
 -- `undefined`: uses [the global Agent](http.html#globalAgent) for this host
   and port (default).
 -- `Agent` object: explicitly use the passed in `Agent`
 -- `false`: opt out of connection pooling with an `Agent`, and default the request to `Connection: close`.

There are a few special headers that should be noted.

* Sending a `'Connection: keep-alive'` notifies Node.js that the connection to the server should be persisted until the next request.

* Sending a `'Content-length'` header disables the default chunked encoding.

* Sending an 'Expect' header immediately sends the request headers.
  Usually, when sending `'Expect: 100-continue'`, you should both set a timeout
  and listen for the `continue` event. For more information, see [RFC2616 Section 8.2.3](http://tools.ietf.org/html/rfc2616#section-8.2.3).

* Sending an Authorization header overrides using the `auth` option to compute basic authentication.

#### Example

    var options = {
      host: 'www.google.com',
      port: 80,
      path: '/upload',
      method: 'POST'
    };

    var req = http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();

Note that in the example, `req.end()` was called. With `http.request()` one must always call `req.end()` to signify that you're done with the request—even if there is no data being written to the request body.

#### Returns

An instance of the `http.ClientRequest` class. The `ClientRequest` instance is a writable stream. If one needs to upload a file with a POST request, then write it to the `ClientRequest` object.

If any error is encountered during the request (be that with DNS resolution, TCP level errors, or actual HTTP parse errors) an `'error'` event is emitted on the returned request object.

  



## http.Agent

Starting with Node.js version 0.5.3, there's a new implementation of the HTTP Agent which is used for pooling sockets used in HTTP client requests.

Previously, a single agent instance help the pool for single host+port. The current implementation now holds sockets for any number of hosts.

The current HTTP Agent also defaults client requests to using `Connection:keep-alive`. If no pending HTTP requests are waiting on a socket to become free ,the socket is closed. This means that Node's pool has the benefit of keep-alive when under load but still does not require developers to manually close the HTTP clients using keep-alive.

Sockets are removed from the agent's pool when the socket emits either a `'close'` event or a special `'agentRemove'` event. This means that if you intend to keep one HTTP request open for a long time and don't want it to stay in the pool you can do something along the lines of:

    http.get(options, function(res) {
      // Do stuff
    }).on("socket", function (socket) {
      socket.emit("agentRemove");
    });

Alternatively, you could just opt out of pooling entirely using `agent:false`:


    http.get({host:'localhost', port:80, path:'/', agent:false}, function (res) {
      // Do stuff
    });






### http.Agent.maxSockets, Number

Determines how many concurrent sockets the agent can have open per host. By default, this is set to 5. 




### http.Agent.sockets, Number

An object which contains arrays of sockets currently in use by the Agent. **Don't modify this!**

 

## http.Server

A representation of the server within the `http` module. To create an HTTP server, you'll need to first call [[http.createServer `http.createServer()`]], with something like this:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/http/http.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

This object is also an [[eventemitter `eventemitter`]].

For more information, read [this article on how to create HTTP servers](../nodejs_dev_guide/creating_an_http_server.html).

 
### http.Server@request(request, response)
- request {http.ServerRequest} An instance of [[http.ServerRequest]]
- response {http.ServerResponse} An instance of [[http.ServerResponse]]

Emitted each time there is a request. Note that, in the case of keep-alive connections, there may be multiple requests per connection.


### http.Server@connection(socket)
- socket {net.Socket}  An object of type [[net.Socket `net.Socket`]]

Emitted when a new TCP stream is established. Usually users won't want to access this event. The `socket` can also be accessed at [[http.ServerRequest.connection]].

 


### http.Server@close(socket)
- socket {net.Socket}  An object of type [[net.Socket `net.Socket`]]

Emitted when the server closes.
 


### http.Server@checkContinue(request, response)
- request  {http.ServerRequest} An instance of `http.ServerRequest`
- response {http.ServerResponse}  An instance of `http.ServerResponse`

Emitted each time a request with an `http Expect: 100-continue` is received. If this event isn't listened for, the server will automatically respond with a `100 Continue` as appropriate.

Handling this event involves calling `response.writeContinue` if the client should continue to send the request body, or generating an appropriate HTTP response (_e.g._ `400 Bad Request`) if the client should not continue to send the request body.

Note: When this event is emitted and handled, the `request` event is not be emitted.

 


### http.Server@upgrade(request, socket, head)
- request {http.ServerRequest}  The arguments for the http request, as it is in the request event
- socket {Number}  The network socket between the server and client
- head {Buffer}   The first packet of the upgraded stream; this can be empty

Emitted each time a client requests a http upgrade. If this event isn't listened for, then clients requesting an upgrade will have their connections closed.

After this event is emitted, the request's socket won't have a `data` event listener, meaning you will need to bind to it in order to handle data sent to the server on that socket.

 


### http.Server@clientError(exception)
- exception {Error}  The exception being thrown

If a client connection emits an `'error'` event, it's forwarded here.

 
 

### http.Server.listen(port [, hostname] [, callback()]) 
### http.Server.listen(port [, callback()]) 
- port {Number}  The port to listen to
- hostname {String}   The hostname to listen to
- callback {Function}   The function to execute once the server has been bound to the port
(related to: net.Server.listen)

Begin accepting connections on the specified port and hostname. If the hostname is omitted, the server accepts connections directed to any IPv4 address (`INADDR_ANY`). To listen to a Unix socket, supply a filename instead of port and hostname.

This function is asynchronous. The `callback()` is added as a listener for the [[net.Server@listening `net.Server@listening`]] event.



 
### http.Server.close()
(related to: net.Server.close)

Stops the server from accepting new connections.
 



## http.ServerRequest

This object is created internally by an HTTP server—not by the user—and passed as the first argument to a `'request'` listener.

The request implements the [[streams.ReadableStream Readable Stream]] interface; it is also an [[eventemitter `eventemitter`]] with the following events:

 


### http.ServerRequest@data(chunk)
- chunk {String}  The data that's received (as a string)

Emitted when a piece of the message body is received. The chunk is a string if an encoding has been set with [[http.ServerRequest.setEncoding `request.setEncoding()`]], otherwise it's a [Buffer](buffer.html).

Note that the **data will be lost** if there is no listener when a `ServerRequest` emits a `'data'` event.

 


### http.ServerRequest@end()

Emitted exactly once for each request. After that, no more `'data'` events are emitted on the request.


 


### http.ServerRequest@close()

Indicates that the underlaying connection was terminated before `response.end()` was called or able to flush.

Just like `'end'`, this event occurs only once per request, and no more `'data'` events will fire afterwards.

Note: `'close'` can fire after `'end'`, but not vice versa.
 

read-only
### http.ServerRequest.method, String

The request method as a string, like `'GET'` or `'DELETE'`.

 



### http.ServerRequest.url, String

Request URL string. This contains only the URL that is present in the actual HTTP request. Fo example, if the request is:

    GET /status?name=ryan HTTP/1.1\r\n
    Accept: text/plain\r\n
    \r\n

Then `request.url` becomes:

    '/status?name=ryan'

#### Example

If you would like to parse the URL into its parts, you can use `require('url').parse(request.url)`. For example:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/http/http.serverrequest_1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

If you would like to extract the params from the query string, you can use [[querystring.parse `require('querystring').parse()`]], or pass `true` as the second argument to `require('url').parse`.  For example:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/http/http.serverrequest_2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>



read-only
### http.ServerRequest.headers, Object

Returns the request header.


 

read-only
### http.ServerRequest.trailers, Object

Contains the HTTP trailers (if present). Only populated after the `'end'` event.


 

read-only
### http.ServerRequest.httpVersion, String

The HTTP protocol version as a string; for example: `'1.1'`, `'1.0'`. `request.httpVersionMajor` is the first integer and `request.httpVersionMinor` is the second.


 


### http.ServerRequest.setEncoding([encoding=null])
- encoding {String}  The encoding to use, either `'utf8'` or `'binary'`

Set the encoding for the request body. Defaults to `null`, which means that the `'data'` event emits a `Buffer` object.

 
 


### http.ServerRequest.pause()

Pauses request from emitting events.  Useful to throttle back an upload.  
 


### http.ServerRequest.resume()

Resumes a paused request.

 


### http.ServerRequest.connection, net.Socket

The `net.Socket` object associated with the connection.

With HTTPS support, use `request.connection.verifyPeer()` and `request.connection.getPeerCertificate()` to obtain the client's authentication details.

 



## http.ServerResponse

This object is created internally by a HTTP server—not by the user. It is passed as the second parameter to the `'request'` event. It is a [[streams.WritableStream `Writable Stream`]].

 


### http.ServerResponse@close()

If emitted, it it indicates that the underlaying connection was terminated before `response.end()` was called or able to flush.




### http.ServerResponse.writeContinue()

Sends an `HTTP/1.1 100 Continue` message to the client, indicating that the request body should be sent. For more information, see the [[http.Server@checkContinue `http.Server@checkContinue`]] event.




### http.ServerResponse.writeHead(statusCode [, reasonPhrase] [, headers])
- statusCode {Number}   The 3-digit HTTP status code, like `404`
- reasonPhrase {String}  A human-readable string describing the status
- headers {Object}  Any response headers

Sends a response header to the request.

This method must only be called once on a message and it must be called before `response.end()` is called.

If you call `response.write()` or `response.end()` before calling this, the implicit/mutable headers will be calculated and call this function for you.

#### Example 

    var body = 'hello world';
    response.writeHead(200, {
      'Content-Length': body.length,
      'Content-Type': 'text/plain' });

Note: `Content-Length` is given in bytes, not characters. The above example works because the string `'hello world'` contains only single byte characters. If the body contains higher coded characters then `Buffer.byteLength()` should be used to determine the number of bytes in a given encoding. Node.js does not check whether `Content-Length` and the length of the body which has been transmitted are equal or not.


 


### http.ServerResponse.statusCode, Number

When using implicit headers (not calling `response.writeHead()` explicitly), this property controls the status code that will be send to the client when the headers get flushed; for example: `response.statusCode = 404;`. 

After the response header is sent to the client, this property indicates the status code which was sent out.





### http.ServerResponse.setHeader(name, value)
- name {String}  The name of the header to set
- value  (String): The value to set

Sets a single header value for implicit headers. If this header already exists in the to-be-sent headers, its value is replaced.  Use an array of strings here if you need to send multiple headers with the same name.

#### Examples

    response.setHeader("Content-Type", "text/html");

    response.setHeader("Set-Cookie", ["type=ninja", "language=javascript"]);

 


### http.ServerResponse.getHeader(name), String
- name {String}  The name of the header to retrieve

Reads out a header that's already been queued but not sent to the client.  Note that the name is case-insensitive.  This can only be called before headers get implicitly flushed.

#### Example

    var stringContentType = response.getHeader('content-type');

 


### http.ServerResponse.removeHeader(name)
- name {String}  The header to remove

Removes a header that's queued for implicit sending.
   
#### Example

    response.removeHeader("Content-Encoding");




### http.ServerResponse.write(chunk [, encoding='utf8'])
- chunk {String | Buffer}  A string or buffer to write
- encoding {String}  The encoding to use (if `chunk` is a string)

If this method is called and `response.writeHead()` has not been called, it'll switch to implicit header mode and flush the implicit headers.

This sends a chunk of the response body. This method may be called multiple times to provide successive parts of the body.

Note: This is the raw HTTP body and has nothing to do with higher-level multi-part body encodings that may be used.

The first time `response.write()` is called, it sends the buffered header information and the first body to the client. The second time `response.write()` is called, Node.js assumes you're going to be streaming data, and sends that separately. That is, the response is buffered up to the first chunk of body.


 


### http.ServerResponse.addTrailers(headers)
- headers {String}  The trailing header to add

This method adds HTTP trailing headers (a header, but at the end of the message) to the response.

Trailers are only emitted if chunked encoding is used for the response; if it is not (_e.g._ if the request was `'HTTP/1.0'`), they are silently discarded.

#### Example

HTTP requires the `Trailer` header to be sent if you intend to emit trailers, with a list of the header fields in its value. For example:

    response.writeHead(200, { 'Content-Type': 'text/plain',
                              'Trailer': 'Content-MD5' });
    response.write(fileData);
    response.addTrailers({'Content-MD5': "7895bf4b8828b55ceaf47747b4bca667"});
    response.end();


 


### http.ServerResponse.end([data] [, encoding])
- data {String}  Some data to write before finishing
- encoding {String}  The encoding for the data

This method signals to the server that all of the response headers and body has been sent; that server should consider this message complete. `response.end()` **must** be called on each response.

If `data` is specified, it is equivalent to calling `response.write(data, encoding)` followed by `response.end()`.

 




## http.ClientRequest

This object is created internally and returned from [[http.request `http.request()`]].  It represents an _in-progress_ request whose header has already been queued.  The header is still mutable using the `setHeader(name, value)`, `getHeader(name)`, and `removeHeader(name)` methods.  The actual header will be sent along with the first data chunk or when closing the connection. This is both a [[streams.WritableStream `Writable Stream`]] and an [[eventemitter `EventEmitter`]].

To get the response, add a listener for `'response'` to the request object. `'response'` will be emitted from the request object when the response headers have been received.  The `'response'` event is executed with one argument which is an instance of `http.ClientResponse`.

Note: Node.js does not check whether `Content-Length`and the length of the body which has been transmitted are equal or not.

During the `'response'` event, one can add listeners to the response object, particularly to listen for the `'data'` event. Note that the `'response'` event is called before any part of the response body is received, so there is no need to worry about racing to catch the first part of the body. As long as a listener for `'data'` is added during the `'response'` event, the entire body will be caught.

#### Example

    // Good
    request.on('response', function (response) {
      response.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });

    // Bad - misses all or part of the body
    request.on('response', function (response) {
      setTimeout(function () {
        response.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
      }, 10);
    });


 


### http.ClientRequest@response(response)
- response {http.ClientResponse}  An instance of `http.ClientResponse`

Emitted when a response is received to this request. This event is emitted only once. 

Options include:

- host: a domain name or IP address of the server to issue the request to
- port: the port of remote server
- socketPath: Unix Domain Socket (use either `host:port` or `socketPath`)

 


### http.ClientRequest@socket(socket)
- socket {net.Socket}   The assigned socket

Emitted after a socket is assigned to this request.

 


### http.ClientRequest@upgrade(response, socket, head)
- response {http.ClientResponse}  The client's response
- socket {net.Socket}  The assigned socket
- head {Object}  The upgrade header

Emitted each time a server responds to a request with an upgrade. If this event isn't being listened for, clients receiving an upgrade header will have their connections closed.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/http/http.clientrequest.upgrade.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 


### http.ClientRequest@continue()

Emitted when the server sends a `'100 Continue'` HTTP response, usually because the request contained `'Expect: 100-continue'`. This is an instruction that the client should send the request body.

 


### http.ClientRequest.write(chunk [, encoding='utf8'])
- chunk {Array}  An array of integers or a string to write
- encoding {String}  The encoding of the chunk (only needed if it's a string)

Sends a chunk of the body.  By calling this method many times, the user can stream a request body to a server—in that case, it's suggested you use the `['Transfer-Encoding', 'chunked']` header line when creating the request.


 


### http.ClientRequest.end([data] [, encoding])
- data {String}  The data to send at the end
- encoding {String}  The encoding to use for the data 

Finishes sending the request. If any parts of the body are unsent, it will flush them to the stream. If the request is chunked, this will send the terminating `'0\r\n\r\n'`.

If `data` is specified, it is equivalent to calling `request.write(data, encoding)` followed by `request.end()`.




### http.ClientRequest.abort()

Aborts a request, since NOde.js version 0.3.8.


 


### http.ClientRequest.setTimeout(timeout [, callback()])
- timeout {Number}  The timeout length, in milliseconds
- callback {Function}  An optional function to execute once the timeout completes

Once a socket is assigned to this request and is connected, [[net.Socket.setTimeout `net.Socket.setTimeout()`]] is called.



### http.ClientRequest.setNoDelay([noDelay=true]) 
- noDelay {Boolean}  If `true`, then the data is fired off immediately each time the socket is written

Once a socket is assigned to this request and is connected, [[net.Socket.setNoDelay `net.Socket.setNoDelay()`]] is called.



### http.ClientRequest.setSocketKeepAlive([enable=false] [, initialDelay])
- enable {Boolean}  If `true`, then keep-alive funcitonality is set
- initalDelay {Number}  Sets the initial delay before the first keep-alive probe is sent on an idle socket

Once a socket is assigned to this request and is connected, [[net.Socket.setKeepAlive `net.Socket.setKeepAlive()`]] is called.


  

## http.ClientResponse

This object is created when making a request with [[http.request `http.request()`]]. It is passed to the `'response'` event of the request object.

The response implements the [[streams.ReadableStream `Readable Stream`]] interface.



### http.ClientResponse@data(chunk)
- chunk {Buffer}  The data received

Emitted when a piece of the message body is received.




### http.ClientResponse@end()
- chunk {Buffer}  The data received

Emitted exactly once for each message. After it's emitted, no other events are emitted on the response.




### http.ClientResponse@close()
- err {Error}  The error object

Indicates that the underlaying connection was terminated before the `end` event was emitted.

For more information, see [[http.ServerRequest]]'s `'close'` event.



### http.ClientResponse.statusCode, Number

The 3-digit HTTP response status code, like `200`, `404`, e.t.c.




### http.ClientResponse.httpVersion, String

The HTTP version of the connected-to server. Usually either `'1.1'` or `'1.0'`. `response.httpVersionMajor` is the first integer and `response.httpVersionMinor` is the second.




### http.ClientResponse.header, Object

The response headers object.



### http.ClientResponse.trailers, Object

The response trailers object. Only populated after the `end` event.




### http.ClientResponse.setEncoding([encoding=null])
- encoding {String}  The encoding to use. Defaults to `null`, which means that the `'data'` event will emit a `Buffer` object.

Set the encoding for the response body, either `'utf8'`, `'ascii'`, or `'base64'`.
 



### http.ClientResponse.pause()

Pauses the response from emitting events.  Useful to throttle back a download.



### http.ClientResponse.resume()

Resumes a paused response.
