## TLS (SSL)

Use `require('tls')` to access this module.

The `tls` module uses OpenSSL to provide Transport Layer Security and/or
Secure Socket Layer: encrypted stream communication.

Traditional TLS/SSL is a public/private key infrastructure. Each client and each
server must have a private key. A private key is created like this

    openssl genrsa -out ryans-key.pem 1024

All servers and some clients need to have a certificate. Certificates are public
keys signed by a Certificate Authority or self-signed. The first step to
getting a certificate is to create a "Certificate Signing Request" (CSR)
file. This is done with:

    openssl req -new -key ryans-key.pem -out ryans-csr.pem

To create a self-signed certificate with the CSR, do this:

    openssl x509 -req -in ryans-csr.pem -signkey ryans-key.pem -out ryans-cert.pem

Alternatively you can send the CSR to a Certificate Authority for signing.

(TODO: docs on creating a CA, for now interested users should just look at
`test/fixtures/keys/Makefile` in the Node source code)

If node is compiled with OpenSSL v1.0.0 or later then TLS-PSK (RFC 4279) support is
available as an alternative to normal certificate-based authentication. PSK uses
a pre-shared key instead of certificates to authenticate a TLS connection, providing
mutual authentication. PSK and certificate auth are not mutually exclusive; one server
can accommodate both, with the variety used determined by the normal cipher negotiation
step. Note that PSK is only a good choice where means exist to securely share a key
with every connecting machine, so it does not replace PKI for the majority of TLS uses.

### s = tls.connect(port, [host], [options], callback)

Creates a new client connection to the given `port` and `host`. (If `host`
defaults to `localhost`.) `options` should be an object which specifies

  - `key`: A string or `Buffer` containing the client's private key in PEM format.

  - `cert`: A string or `Buffer` containing the client's certificate in PEM format.

  - `ca`: An array of strings or `Buffer`s of trusted certificates. If this is
    omitted several well known "root" CAs will be used, like VeriSign.
    These are used to authorize connections.

  - `pskIdentity`: A string containing the TLS-PSK identity to use when connecting.

  - `pskKey`: A `Buffer` containing the binary pre-shared key corresponding
    to the `pskIdentity`.

  - `pskCallback`: A callback that may be provided if you wish to select the identity
    and key based on the "hint" provided by the server. The callback receives the hint
    as its sole argument and must return an object with `pskIdentity` and `pskKey`
    attributes as described above. This option is ignored if `pskIdentity` and `pskKey`
    are provided outright.

  - `ciphers`: An OpenSSL-style cipher priority list (eg `RC4-SHA:AES128-SHA:AES256-SHA`).
    Optional, but note that the cipher negotiation between client and server determines
    how the TLS handshake will proceed; for PSK both client and server must be configured
    to use PSK ciphers. For ease of use, if PSK identity options are provided but `ciphers`
    is not, it will be configured with a default set of PSK ciphers.

`tls.connect()` returns a cleartext `CryptoStream` object.

After the TLS/SSL handshake the `callback` is called. If using normal certificate-based
TLS, The `callback` will be called even if the server's certificate was not authorized.
It is up to the user to test `s.authorized` to see if the server certificate was signed
by one of the specified CAs. If `s.authorized === false` then the error can be found in
`s.authorizationError`. If using PSK, the handshake will only complete if the pre-shared
keys match; `s.authorized` will be `true` and `s.pskIdentity` will be clientss identity
string. If the keys do not match then the handshake will fail. The callback will not be
called but the cleartext stream will emit an `error` event.



### STARTTLS

In the v0.4 branch no function exists for starting a TLS session on an
already existing TCP connection.  This is possible it just requires a bit of
work. The technique is to use `tls.createSecurePair()` which returns two
streams: an encrypted stream and a plaintext stream. The encrypted stream is then
piped to the socket, the plaintext stream is what the user interacts with thereafter.

[Here is some code that does it.](http://gist.github.com/848444)




### tls.Server

This class is a subclass of `net.Server` and has the same methods on it.
Instead of accepting just raw TCP connections, this accepts encrypted
connections using TLS or SSL.

Here is a simple example echo server:

    var tls = require('tls');
    var fs = require('fs');

    var options = {
      key: fs.readFileSync('server-key.pem'),
      cert: fs.readFileSync('server-cert.pem')
    };

    tls.createServer(options, function (s) {
      s.write("welcome!\n");
      s.pipe(s);
    }).listen(8000);


You can test this server by connecting to it with `openssl s_client`:


    openssl s_client -connect 127.0.0.1:8000


#### tls.createServer(options, secureConnectionListener)

This is a constructor for the `tls.Server` class. The options object
has these possibilities:

  - `key`: A string or `Buffer` containing the private key of the server in
    PEM format. (Required, unless using PSK)

  - `cert`: A string or `Buffer` containing the certificate key of the server in
    PEM format. (Required, unless using PSK)

  - `ca`: An array of strings or `Buffer`s of trusted certificates. If this is
    omitted several well known "root" CAs will be used, like VeriSign.
    These are used to authorize connections.

  - `requestCert`: If `true` the server will request a certificate from
    clients that connect and attempt to verify that certificate. Default:
    `false`.

  - `rejectUnauthorized`: If `true` the server will reject any connection
    which is not authorized with the list of supplied CAs. This option only
    has an effect if `requestCert` is `true`. Default: `false`.

  - `pskCallback`: A function that receives a TLS-PSK identity string sent by
    the connecting client and should synchronously return a `Buffer` containing
    that user's key, or null if the user isn't recognized. (Required if using PSK)

  - `pskHint`: Optional "hint" string sent to each connecting client to help the
    client determine which identity to use. By default, no hint is sent. See RFC
    4279 for details.

  - `ciphers`: An OpenSSL-style cipher priority list (eg `RC4-SHA:AES128-SHA:AES256-SHA`).
    Optional, but note that the cipher negotiation between client and server determines
    how the TLS handshake will proceed; for PSK both client and server must be configured
    to use PSK ciphers. For ease of use, if a PSK callback is provided but `ciphers`
    is not, it will be configured with a default set of PSK ciphers.


#### Event: 'secureConnection'

`function (cleartextStream) {}`

This event is emitted after a new connection has been successfully
handshaked. The argument is a duplex instance of `stream.Stream`. It has all
the common stream methods and events.

`cleartextStream.authorized` is a boolean value which indicates if the
client has verified by one of the supplied certificate authorities for the
server. If `cleartextStream.authorized` is false, then
`cleartextStream.authorizationError` is set to describe how authorization
failed. Implied but worth mentioning: depending on the settings of the TLS
server, your unauthorized connections may be accepted.


#### server.listen(port, [host], [callback])

Begin accepting connections on the specified `port` and `host`.  If the
`host` is omitted, the server will accept connections directed to any
IPv4 address (`INADDR_ANY`).

This function is asynchronous. The last parameter `callback` will be called
when the server has been bound.

See `net.Server` for more information.


#### server.close()

Stops the server from accepting new connections. This function is
asynchronous, the server is finally closed when the server emits a `'close'`
event.


#### server.maxConnections

Set this property to reject connections when the server's connection count gets high.

#### server.connections

The number of concurrent connections on the server.
