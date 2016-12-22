

## class http.ServerRequest

This object is created internally by an HTTP server&mdash;not by the user&mdash;and passed as the first argument to a `'request'` listener.

 


## http.ServerRequest@data(chunk)
- chunk (String): The data that's received (as a string)

Emitted when a piece of the message body is received. For example, a chunk of the body is given as the single argument. The transfer-encoding has been decoded. 

The body encoding is set with [[http.ServerRequest.setEncoding `request.setEncoding()`]].

 


## http.ServerRequest@end()

Emitted exactly once for each request. After that, no more `'data'` events are emitted on the request.


 


## http.ServerRequest@close()

Indicates that the underlaying connection was terminated before `response.end()` was called or able to flush.

Just like `'end'`, this event occurs only once per request, and no more `'data'` events will fire afterwards.

<Note>`'close'` can fire after `'end'`, but not vice versa.</Note>
 

### read-only
## http.ServerRequest.method -> String

The request method as a string, like `'GET'` or `'DELETE'`.

 



## http.ServerRequest.url -> String

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



### read-only
## http.ServerRequest.headers -> Object

Returns the request header.


 

### read-only
## http.ServerRequest.trailers -> Object

Contains the HTTP trailers (if present). Only populated after the `'end'` event.


 

### read-only
## http.ServerRequest.httpVersion -> String

The HTTP protocol version as a string; for example: `'1.1'`, `'1.0'`. `request.httpVersionMajor` is the first integer and `request.httpVersionMinor` is the second.


 


## http.ServerRequest.setEncoding([encoding=null]) -> Void
- encoding (String): The encoding to use, either `'utf8'` or `'binary'`

Set the encoding for the request body. Defaults to `null`, which means that the `'data'` event emits a `Buffer` object.

 
 


## http.ServerRequest.pause() -> Void

Pauses request from emitting events.  Useful to throttle back an upload.  
 


## http.ServerRequest.resume() -> Void

Resumes a paused request.

 


## http.ServerRequest.connection -> net.Socket

The `net.Socket` object associated with the connection.

With HTTPS support, use `request.connection.verifyPeer()` and `request.connection.getPeerCertificate()` to obtain the client's authentication details.

 
