
## class tls

The `tls` module uses OpenSSL to provide both the Transport Layer Security and the Secure Socket Layer; in other words, it provides encrypted stream communications. To access this module, add `require('tls')` in your code. 

TLS/SSL is a public/private key infrastructure. Each client and each server must have a private key. A private key is created in your terminal like this:

    openssl genrsa -out ryans-key.pem 1024

where `ryans-key.pm` is the name of your file. All servers (and some clients) need to have a certificate. Certificates are public keys signed by a Certificate Authority&mdash; or, they are self-signed. The first step to getting a certificate is to create a "Certificate Signing Request" (CSR) file. This is done using:

    openssl req -new -key ryans-key.pem -out ryans-csr.pem

To create a self-signed certificate with the CSR, enter this:

    openssl x509 -req -in ryans-csr.pem -signkey ryans-key.pem -out ryans-cert.pem

Alternatively, you can send the CSR to a Certificate Authority for signing.

(Documentation on creating a CA are pending; for now, interested users should just look at [`test/fixtures/keys/Makefile`](https://github.com/joyent/node/blob/master/test/fixtures/keys/Makefile) in the Node.js source code.)


#### Using NPN and SNI

NPN (Next Protocol Negotiation) and SNI (Server Name Indication) are TLS handshake extensions provided with this module.

NPN is to use one TLS server for multiple protocols (HTTP, SPDY).

SNI is to use one TLS server for multiple hostnames with different SSL certificates.


#### Example: Using STARTTLS

As of the v0.4 Node.js branch, no function exists for starting a TLS session on an already existing TCP connection.  This is possible, but it requires a bit of work. 

The technique is to use `tls.createSecurePair()`, which returns two streams: an encrypted stream and a cleartext stream. The encrypted stream is then piped to the socket; the cleartext stream is what the user interacts with thereafter. [Here is a gist that shows how to do just that.](http://gist.github.com/848444)




## tls@secure()

The event is emitted from the SecurePair once the pair has successfully established a secure connection.

Similar to the checking for the server `'secureConnection'` event, [[tls.CleartextStream.authorized `tls.CleartextStream.authorized`]] should be checked to confirm whether the certificate used properly authorized.
 



## tls@secureConnection(cleartextStream)
- cleartextStream (tls.CleartextStream): A object containing the NPN and SNI string protocols

This event is emitted after a new connection has been successfully handshaked. The argument is a instance of [[tls.CleartextStream CleartextStream]]. It has all the common stream methods and events.

If [[tls.CleartextStream.authorized `tls.CleartextStream.authorized`]] is `false`, then [[tls.CleartextStream.authorizationError `tls.Cleartext.authorizationError`]] is set to describe how the authorization failed. Depending on the settings of the TLS server, your unauthorized connections may still be accepted.

`cleartextStream.npnProtocol` is a string containing the selected NPN protocol. `cleartextStream.servername` is a string containing the servername requested with SNI.

 



## tls.connect(port [, host=localhost] [, options] [, secureConnectListener]) -> tls.CleartextStream
- port (Number):  The port to connect to
- host (String):  An optional hostname to connect to`
- options (Object):  Any options you want to pass to the server
- secureConnectionListener (Function):  An optional listener

Creates a new client connection to the given `port` and `host`. This function returns a [[tls.CleartextStream `tls.CleartextStream`]] object.

`options` should be an object that specifies the following values:

  - `key`: A string or `Buffer` containing the private key of the client in aPEM format. The default is `null`.

  - `passphrase`: A string of a passphrase for the private key. The default is `null`.

  - `cert`: A string or `Buffer` containing the certificate key of the client in a PEM format; in other words, the public x509 certificate to use. The default is `null`.

  - `ca`: An array of strings or `Buffer`s of trusted certificates. These are used to authorize connections. If this is omitted, several "well-known root" CAs will be used, like VeriSign. 

  - `NPNProtocols`: An array of strings or a  `Buffer` containing supported NPN protocols. 
        `Buffer` should have the following format: `0x05hello0x05world`, where the preceding byte indicates the following protocol name's length. Passing an array is usually much simpler: `['hello', 'world']`. 
        Protocols should be ordered by their priority.

  - `servername`: The server name for the SNI (Server Name Indication) TLS extension.

`secureConnectionListener` automatically sets a listener for the [`secureConnection`](#tls.event.secureConnection) event.


#### Example: Connecting to an echo server on port 8000:

    var tls = require('tls');
    var fs = require('fs');

    var options = {
      // These are necessary only if using the client certificate authentication
      key: fs.readFileSync('client-key.pem'),
      cert: fs.readFileSync('client-cert.pem'),
    
      // This is necessary only if the server uses the self-signed certificate
      ca: [ fs.readFileSync('server-cert.pem') ]
    };

    var cleartextStream = tls.connect(8000, options, function() {
      console.log('client connected',
                  cleartextStream.authorized ? 'authorized' : 'unauthorized');
      process.stdin.pipe(cleartextStream);
      process.stdin.resume();
    });
    cleartextStream.setEncoding('utf8');
    cleartextStream.on('data', function(data) {
      console.log(data);
    });
    cleartextStream.on('end', function() {
      server.close();
    });
    
 



## tls.createSecurePair([credentials] [, isServer] [, requestCert] [, rejectUnauthorized]) -> tls.SecurePair
- credentials (Object):  An optional credentials object from [[crypto.createCredentials `crypto.createCredentials()`]]
- isServer (Boolean):  An optional boolean indicating whether this TLS connection should be opened as a server (`true`) or a client (`false`)
- requestCert (Boolean): A boolean indicating whether a server should request a certificate from a connecting client; only applies to server connections
- rejectUnauthorized (Boolean):  A boolean indicating whether a server should automatically reject clients with invalid certificates; only applies to servers with `requestCert` enabled

Creates a new secure `pair` object with two streams, one of which reads/writes encrypted data, and one reads/writes cleartext data. This function returns a SecurePair object with [[tls.CleartextStream `tls.CleartextStream`]] and `encrypted` stream properties.

Generally, the encrypted strean is piped to/from an incoming encrypted data stream, and the cleartext one is used as a replacement for the initial encrypted stream.

 



## tls.createServer(options [, secureConnectionListener]) -> Void
- options (Object):  Any options you want to pass to the server
- secureConnectionListener (Function): An optional listener

Creates a new [[tls.Server `tls.Server`]].

The `options` object has the following mix of required values:

  - `key`: A string or `Buffer` containing the private key of the server in a PEM format. (Required)
  - `cert`: A string or `Buffer` containing the certificate key of the server in a PEM format. (Required)

`options` also has the following option values:

  - `ca`: An array of strings or `Buffer`s of trusted certificates. These are used to authorize connections. If this is omitted, several "well-known root" CAs will be used, like VeriSign. 

  - `NPNProtocols`: An array of strings or a  `Buffer` containing supported NPN protocols. 
        `Buffer` should have the following format: `0x05hello0x05world`, where the preceding byte indicates the following protocol name's length. Passing an array is usually much simplier: `['hello', 'world']`. 
        Protocols should be ordered by their priority.

  - `passphrase`: A string of a passphrase for the private key.

  - `rejectUnauthorized`: If `true` the server rejects any connection that is not authorized with the list of supplied CAs. This option only has an effect if `requestCert` is `true`. This defaults to `false`.

  - `requestCert`: If `true` the server requests a certificate from clients that connect and attempt to verify that certificate. This defaults to `false`.

  - `sessionIdContext`: A string containing an opaque identifier for session resumption. If `requestCert` is `true`, the default is an MD5 hash value generated from the command line. Otherwise, the default is not provided.

  - `SNICallback`: A function that is called if the client supports the SNI TLS extension. Only one argument will be passed to it: `servername`. `SNICallback` should return a SecureContext instance. You can use `crypto.createCredentials(...).context` to get a proper SecureContext. If `SNICallback` wasn't provided, a default callback within the high-level API is used (for more information, see below).

`secureConnectionListener` automatically sets a listener for the [`secureConnection`](#tls.event.secureConnection) event.

#### Example

Here's a simple "echo" server:

    var tls = require('tls');
    var fs = require('fs');

    var options = {
      key: fs.readFileSync('server-key.pem'),
      cert: fs.readFileSync('server-cert.pem'),

      // This is necessary only if using the client certificate authentication.
      requestCert: true,

      // This is necessary only if the client uses the self-signed certificate.
      ca: [ fs.readFileSync('client-cert.pem') ]
    };

    var server = tls.createServer(options, function(cleartextStream) {
      console.log('server connected',
                  cleartextStream.authorized ? 'authorized' : 'unauthorized');
      cleartextStream.write("welcome!\n");
      cleartextStream.setEncoding('utf8');
      cleartextStream.pipe(cleartextStream);
    });
    server.listen(8000, function() {
      console.log('server bound');
    });

You can test this server by connecting to it with `openssl s_client`:

    openssl s_client -connect 127.0.0.1:8000

 





