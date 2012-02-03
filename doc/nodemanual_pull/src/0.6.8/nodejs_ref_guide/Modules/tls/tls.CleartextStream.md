

## class tls.CleartextStream

This is a stream on top of the encrypted stream that makes it possible to read/write an encrypted data as a cleartext data.

This instance implements the duplex [[streams `Stream`]] interfaces. It has all the common stream methods and events.
 



## tls.CleartextStream@secureConnect()

This event is emitted after a new connection has been successfully handshaked. The listener will be called no matter if the server's certificate was authorized or not. 

It is up to the user to test `cleartextStream.authorized` to see if the server certificate was signed by one of the specified CAs. If `cleartextStream.authorized === false`, then the error can be found in `cleartextStream.authorizationError`. Also if NPN was used, you can check `cleartextStream.npnProtocol` for the negotiated protocol.
  


## tls.CleartextStream@clientError(exception)
- exception (Error): The standard Error object

If a client connection emits an 'error' event before a secure connection is established, this event is triggered, and the error is passed along.

 



## tls.CleartextStream.authorizationError -> Error


The reason why the peer's certificate has not been verified. This property becomes available only when `cleartextStream.authorized === false`.





## tls.CleartextStream.getPeerCertificate() -> Object


Returns an object representing the peer's certificate. The returned object has some properties corresponding to the field of the certificate.

If the peer does not provide a certificate, it returns `null` or an empty object.

#### Example

    { subject: 
       { C: 'UK',
         ST: 'Acknack Ltd',
         L: 'Rhys Jones',
         O: 'node.js',
         OU: 'Test TLS Certificate',
         CN: 'localhost' },
      issuer: 
       { C: 'UK',
         ST: 'Acknack Ltd',
         L: 'Rhys Jones',
         O: 'node.js',
         OU: 'Test TLS Certificate',
         CN: 'localhost' },
         valid_from: 'Nov 11 09:52:22 2009 GMT',
         valid_to: 'Nov  6 09:52:22 2029 GMT',
        fingerprint: '2A:7A:C2:DD:E5:F9:CC:53:72:35:99:7A:02:5A:71:38:52:EC:8A:DF' }
 



## tls.CleartextStream.connections() -> Object

Returns the bound address and port of the underlying socket as reported by the operating system. The object has two properties, _e.g._ `{"address":"192.168.57.1", "port":62053}`




## tls.CleartextStream.remoteAddress -> String

The string representation of the remote IP address. For example, `'74.125.127.100'` or `'2001:4860:a005::68'`.

 



## tls.CleartextStream.remotePort -> Number

The numeric representation of the remote port. For example, `443`.

 