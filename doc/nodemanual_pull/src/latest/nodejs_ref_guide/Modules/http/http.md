

## class http

The HTTP interfaces in Node.js are designed to support many features of the protocol which have been traditionally difficult to use. In particular, large, possibly chunk-encoded, messages. The interface is careful to never buffer entire requests or responses&mdash;the user is always able to stream data. To use the HTTP server and client, add `require('http')` to your code.

HTTP message headers are represented by an object like this:

    { 'content-length': '123',
      'content-type': 'text/plain',
      'connection': 'keep-alive',
      'accept': 'text/plain' }

Keys are lowercased, and values are not modifiable.

In order to support the full spectrum of possible HTTP applications, Node's HTTP API is very low-level. It deals with stream handling and message parsing only. It parses a message into headers and body but it does not parse the actual headers or the body.


For more information, read [this article on how to create HTTP servers](../nodejs_dev_guide/creating_an_http_server.html).

#### Example: The famous hello world

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/http/http.js&linestart=3&lineend=0&showlines=false' defer='defer'></script>






## http.get(options, callback()) -> Void
- options (Object): Options to pass to the request
- callback (Function):  The callback to execute once the method finishes 

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

 


## http.createServer(requestListener(options, requestListener)) -> http.Server
- requestListener (Function): A function that is automatically added to the `'request'` event
- options (Object):  Any options you want to pass to the server
- requestListener (Function): An optional listener

Returns a new web server object.

 


## http.globalAgent -> http.Agent

This is the global instance of [[http.Agent `http.Agent`]] which is used as the default for all HTTP client requests.

 


## http.globalAgent.requests -> Object

An object which contains queues of requests that have not yet been assigned to  sockets. **Don't modify this!**




## http.request(options, callback(response)) -> http.ClientRequest
- options (Object): Options to pass to the request
- callback (Function):  The callback to execute once the method finishes
- response (http.ClientRequest): The server's response, including headers and status code

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

Note that in the example, `req.end()` was called. With `http.request()` one must always call `req.end()` to signify that you're done with the request&mdash;even if there is no data being written to the request body.

Returns

An instance of the `http.ClientRequest` class. The `ClientRequest` instance is a writable stream. If one needs to upload a file with a POST request, then write it to the `ClientRequest` object.

If any error is encountered during the request (be that with DNS resolution, TCP level errors, or actual HTTP parse errors) an `'error'` event is emitted on the returned request object.

  