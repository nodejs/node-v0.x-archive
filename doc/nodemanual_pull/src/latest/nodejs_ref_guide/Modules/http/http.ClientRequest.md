


## class http.ClientRequest

This object is created internally and returned from [[http.request `http.request()`]].  It represents an _in-progress_ request whose header has already been queued.  The header is still mutable using the `setHeader(name, value)`, `getHeader(name)`, and `removeHeader(name)` methods.  The actual header will be sent along with the first data chunk or when closing the connection. This is both a [[streams.WritableStream `Writable Stream`]] and an [[eventemitter `EventEmitter`]].

To get the response, add a listener for `'response'` to the request object. `'response'` will be emitted from the request object when the response headers have been received.  The `'response'` event is executed with one argument which is an instance of `http.ClientResponse`.

<Note>Node.js does not check whether `Content-Length`and the length of the body which has been transmitted are equal or not.</Note>

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


 


## http.ClientRequest@response(response)
- response (http.ClientResponse): An instance of `http.ClientResponse`

Emitted when a response is received to this request. This event is emitted only once. 

Options include:

- host: a domain name or IP address of the server to issue the request to
- port: the port of remote server
- socketPath: Unix Domain Socket (use either `host:port` or `socketPath`)

 


## http.ClientRequest@socket(socket)
- socket (net.Socket):  The assigned socket

Emitted after a socket is assigned to this request.

 


## http.ClientRequest@upgrade(response, socket, head)
- response (http.ClientResponse): The client's response
- socket (net.Socket): The assigned socket
- head (Object): The upgrade header

Emitted each time a server responds to a request with an upgrade. If this event isn't being listened for, clients receiving an upgrade header will have their connections closed.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/http/http.clientrequest.upgrade.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 


## http.ClientRequest@continue()

Emitted when the server sends a `'100 Continue'` HTTP response, usually because the request contained `'Expect: 100-continue'`. This is an instruction that the client should send the request body.

 


## http.ClientRequest.write(chunk [, encoding='utf8']) -> Void
- chunk (Array): An array of integers or a string to write
- encoding (String): The encoding of the chunk (only needed if it's a string)

Sends a chunk of the body.  By calling this method many times, the user can stream a request body to a server&mdash;in that case, it's suggested you use the `['Transfer-Encoding', 'chunked']` header line when creating the request.


 


## http.ClientRequest.end([data] [, encoding]) -> Void
- data (String): The data to send at the end
- encoding (String): The encoding to use for the data 

Finishes sending the request. If any parts of the body are unsent, it will flush them to the stream. If the request is chunked, this will send the terminating `'0\r\n\r\n'`.

If `data` is specified, it is equivalent to calling `request.write(data, encoding)` followed by `request.end()`.




## http.ClientRequest.abort() -> Void

Aborts a request, since NOde.js version 0.3.8.


 


## http.ClientRequest.setTimeout(timeout [, callback()]) -> Void
- timeout (Number): The timeout length, in milliseconds
- callback (Function): An optional function to execute once the timeout completes

Once a socket is assigned to this request and is connected, [[net.Socket.setTimeout `net.Socket.setTimeout()`]] is called.



## http.ClientRequest.setNoDelay([noDelay=true])  -> Void
- noDelay (Boolean): If `true`, then the data is fired off immediately each time the socket is written

Once a socket is assigned to this request and is connected, [[net.Socket.setNoDelay `net.Socket.setNoDelay()`]] is called.



## http.ClientRequest.setSocketKeepAlive([enable=false] [, initialDelay]) -> Void
- enable (Boolean): If `true`, then keep-alive funcitonality is set
- initalDelay (Number): Sets the initial delay before the first keep-alive probe is sent on an idle socket

Once a socket is assigned to this request and is connected, [[net.Socket.setKeepAlive `net.Socket.setKeepAlive()`]] is called.


  
