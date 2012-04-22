## https

    Stability: 3 - Stable
    
HTTPS is the HTTP protocol over TLS/SSL. In Node.js, this is implemented as a separate module. To use this module, include `require('https')` in your code.

Creating HTTPS servers is somewhat complicated and requires generating certificates.

 #### Examples

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/https/https.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>


### https.createServer(options [, requestListener]), https.Server
- options {Object}   Any options you want to pass to the server
- requestListener {Function}  An optional listener
(related to: tls.createServer)

Returns a new HTTPS web server object. 

The `options` object has a mix of required and optional values:

  - `key`: A string or `Buffer` containing the private key of the server in a PEM format. (Required)
  - `cert`: A string or `Buffer` containing the certificate key of the server in a PEM format. (Required)

  - `ca`: An array of strings or `Buffer`s of trusted certificates. These are used to authorize connections. If this is omitted, several "well-known root" CAs will be used, like VeriSign. 

  - `NPNProtocols`: An array of strings or a  `Buffer` containing supported NPN protocols. 
        `Buffer` should have the following format: `0x05hello0x05world`, where the preceding byte indicates the following protocol name's length. Passing an array is usually much simplier: `['hello', 'world']`. 
        Protocols should be ordered by their priority.

  - `passphrase`: A string of a passphrase for the private key.

  - `rejectUnauthorized`: If `true` the server rejects any connection that is not authorized with the list of supplied CAs. This option only has an effect if `requestCert` is `true`. This defaults to `false`.

  - `requestCert`: If `true` the server requests a certificate from clients that connect and attempt to verify that certificate. This defaults to `false`.

  - `sessionIdContext`: A string containing an opaque identifier for session resumption. If `requestCert` is `true`, the default is an MD5 hash value generated from the command line. Otherwise, the default is not provided.

  - `SNICallback`: A function that is called if the client supports the SNI TLS extension. Only one argument will be passed to it: `servername`. `SNICallback` should return a SecureContext instance. You can use `crypto.createCredentials(...).context` to get a proper SecureContext. If `SNICallback` wasn't provided, a default callback within the high-level API is used (for more information, see below).


### https.request(options, callback())
- options {Object}  Any options you want to pass to the server
- callback {Function}   The callback to execute

Makes a request to a secure web server. 

All options from [http.request `httprequest()`]] are valid for `options`:

- host: a domain name or IP address of the server to issue the request to. Defaults to `'localhost'`.
- hostname: this supports `url.parse()`; `hostname` is preferred over `host`
- port: the port of the remote server. Defaults to `80`.
- socketPath: the Unix Domain Socket (use either `host:port` or `socketPath`)
- method: a string specifying the HTTP request method. Defaults to `'GET'`.
- path: the request path. Defaults to `'/'`. This should include a query string (if any) For example, `'/index.html?page=12'`
- headers: an object containing request headers
- auth: used for basic authentication. For example, `'user:password'` computes an Authorization header.
- agent: this controls [[https.Agent `https.Agent`]] behavior. When an Agent is used, the request defaults to `Connection: keep-alive`. The possible values are:
 - `undefined`: uses [[http.globalAgent globalAgent]] for this host
   and port (default).
 - `Agent` object: this explicitlys use the passed in `Agent`
 - `false`: this opts out of connection pooling with an Agent, and defaults the request to `Connection: close`.

The following options from [tls.connect()](tls.html#tls.connect) can also be specified. However, a [[http.globalAgent globalAgent]] silently ignores these.

  - `key`: A string or `Buffer` containing the private key of the client in aPEM format. The default is `null`.

  - `passphrase`: A string of a passphrase for the private key. The default is `null`.

  - `cert`: A string or `Buffer` containing the certificate key of the client in a PEM format; in other words, the public x509 certificate to use. The default is `null`.

  - `ca`: An array of strings or `Buffer`s of trusted certificates. These are used to authorize connections. If this is omitted, several "well-known root" CAs will be used, like VeriSign. 

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/https/https.request_1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Here's an example specifying these options using a custom `Agent`:

    var options = {
      host: 'encrypted.google.com',
      port: 443,
      path: '/',
      method: 'GET',
      key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
      cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
    };
    options.agent = new https.Agent(options);

    var req = https.request(options, function(res) {
      ...
    }

Or, if you choose not to use an `Agent`:

    var options = {
      host: 'encrypted.google.com',
      port: 443,
      path: '/',
      method: 'GET',
      key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
      cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem'),
      agent: false
    };

    var req = https.request(options, function(res) {
      ...
    }


### https.get(options, callback())
- options {Object}  Options to pass to the request
- callback {Function}  The callback to execute once the method finishes 

Exactly like [[http.get `http.get()`]] but for HTTPS.

Since most requests are GET requests without bodies, Node.js provides this convenience method. The only difference between this method and [[http.request `http.request()`]] is that it sets the method to GET and calls `req.end()` automatically.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/https/https.get.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### https.globalAgent, https.Agent

A global instance of the [[https.Agent `https.Agent`]], which is used as the default for all HTTPS client requests.

## https.Agent


An `Agent` object for HTTPS, similar to [[http.Agent `http.Agent`]]. For more information, see [[https.request `https.request()`]].


### https.Agent.maxSockets, Number

Determines how many concurrent sockets the agent can have open per host. By default, this is set to 5. 

### https.Agent.sockets, Object

An object which contains arrays of sockets currently in use by the Agent. **Don't modify this!**

## https.Server

This class is a subclass of [[tls.Server `tls.Server`]] and emits the same events as [[http.Server `http.Server`]].

Creating HTTPS servers is somewhat complicated and requires generating certificates. 

### https.Server@request(request, response)
- request {http.ServerRequest}   An instance of [[http.ServerRequest]]
- response {http.ServerResponse}   An instance of [[http.ServerResponse]]

Emitted each time there is a request. Note that, in the case of keep-alive connections, there may be multiple requests per connection.

### https.Server@connection(socket)
- socket {net.Socket}  An object of type [[net.Socket `net.Socket`]]

Emitted when a new TCP stream is established. Usually users won't want to access this event. The `socket` can also be accessed at [[http.ServerRequest.connection]].

### https.Server@close(socket)
- socket {net.Socket}  An object of type [[net.Socket `net.Socket`]]

Emitted when the server closes.

### https.Server@checkContinue(request, response)
- request  {http.ServerRequest} An instance of `http.ServerRequest`
- response {http.ServerResponse}  An instance of `http.ServerResponse`

Emitted each time a request with an `http Expect: 100-continue` is received. If this event isn't listened for, the server will automatically respond with a `100 Continue` as appropriate.

Handling this event involves calling `response.writeContinue` if the client should continue to send the request body, or generating an appropriate HTTP response (_e.g._ `400 Bad Request`) if the client should not continue to send the request body.

Note: When this event is emitted and handled, the `request` event is not be emitted.

### https.Server@upgrade(request, socket, head)
- request {http.ServerRequest}  The arguments for the http request, as it is in the request event
- socket {Number}  The network socket between the server and client
- head {Buffer}   The first packet of the upgraded stream; this can be empty

Emitted each time a client requests a http upgrade. If this event isn't listened for, then clients requesting an upgrade will have their connections closed.

After this event is emitted, the request's socket won't have a `data` event listener, meaning you will need to bind to it in order to handle data sent to the server on that socket.

### https.Server@clientError(exception)
- exception {Error}  The exception being thrown

If a client connection emits an `'error'` event, it's forwarded here.

 

### https.Server.listen(port [, hostname] [, callback()]) 
### https.Server.listen(port [, callback()]) 
- port {Number}  The port to listen to
- hostname {String}   The hostname to listen to
- callback {Function}   The function to execute once the server has been bound to the port
 (related to: net.Server.listen)

Begin accepting connections on the specified port and hostname. If the hostname is omitted, the server accepts connections directed to any IPv4 address (`INADDR_ANY`). To listen to a Unix socket, supply a filename instead of port and hostname.

This function is asynchronous. The `callback()` is added as a listener for the <a href="net.html#event_listening_">'listening'</a> event.



### https.Server.close()
(related to: net.Server.close)

Stops the server from accepting new connections.
