
## class https

HTTPS is the HTTP protocol over TLS/SSL. In Node.js, this is implemented as a separate module. To use this module, include `require('https')` in your code.

Creating HTTPS servers is somewhat complicated and requires generating certificates.

 #### Examples

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/https/https.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>



 

### related to: tls.createServer
## https.createServer(options [, requestListener]) -> https.Server
- options (Object):  Any options you want to pass to the server
- requestListener (Function): An optional listener

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

 



## https.request(options, callback()) -> Void
- options (Object): Any options you want to pass to the server
- callback (Function):  The callback to execute

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

 



## https.get(options, callback()) -> Void
- options (Object): Options to pass to the request
- callback (Function): The callback to execute once the method finishes 

Exactly like [[http.get `http.get()`]] but for HTTPS.

Since most requests are GET requests without bodies, Node.js provides this convenience method. The only difference between this method and [[http.request `http.request()`]] is that it sets the method to GET and calls `req.end()` automatically.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/https/https.get.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>






##  https.globalAgent -> https.Agent

A global instance of the [`https.Agent`](https.Agent.html), which is used as the default for all HTTPS client requests.



