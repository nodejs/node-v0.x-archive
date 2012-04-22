## crypto

    Stability: 3 - Stable

The `crypto` module offers a way of encapsulating secure credentials to be used as part of a secure HTTPS net or HTTP connection. To access this module, add `require('crypto')` to your code. 

 The module also offers a set of wrappers for OpenSSL's methods, which actually contains these objects:

* [[cipher Cipher]]
* [[decipher Decipher]]
* [[diffieHellman Diffie-Hellman]]
* [[hash Hash]]
* [[hmac HMAC]] 
* [[signer Signer]]
* [[verifier Verifier]]

This documentation is organized to describe those objects within their own sections.

Note: All `algorithm` parameter implementations below are dependent on the OpenSSL version installed on the platform. Some common examples of these algoritihms are `'sha1'`, `'md5'`, `'sha256'`, and `'sha512'`. On recent Node.js releases, `openssl list-message-digest-algorithms` displays the available digest algorithms.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### crypto.createCipher(algorithm, password), cipher
- algorithm {String}   The algorithm to use
- password {String}   The password to use

Creates and returns a cipher object with the given algorithm and password.

The `password` is used to derive both the key and IV, which must be a binary-encoded string. For more information, see the section on [[Buffer buffers]].

### crypto.createCipheriv(algorithm, key, iv), cipher
- algorithm {String}  The algorithm to use
- key {String}  A raw key used in the algorithm
- iv {String}  The [initialization vector](http://en.wikipedia.org/wiki/Initialization_vector)

Creates and returns a cipher object, with the given algorithm, key, and IV.

Both `key` and `iv` must be a binary-encoded string. For more information, see the section on [[Buffer buffers]].


### crypto.createCredentials([details]), Object
- details {String}  A dictionary of fields to populate the credential with

Creates a credentials object, with  `details` being a dictionary with the following keys:

- key {String}  A string holding the PEM encoded private key file
- cert {String}  A string holding the PEM encoded certificate file
- ca {String}  Either a string or list of strings of PEM encoded CA certificates to trust
- ciphers (String: A string describing the ciphers to use or exclude. Consult [OpenSSL.org](http://www.openssl.org/docs/apps/ciphers.html#CIPHER_LIST_FORMAT) for details on the format

If no `ca` details are given, then Node.js uses the default publicly trusted list of CAs as given by [Mozilla](http://mxr.mozilla.org/mozilla/source/security/nss/lib/ckfw/builtins/certdata.txt).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createCredentials.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### crypto.createDecipher(algorithm, password), decipher
- algorithm {String}  The algorithm to use
- password {String}  The password to use

Creates and returns a decipher object, with the given algorithm and key.

### crypto.createDecipheriv(algorithm, key, iv), decipher
- algorithm {String}  The algorithm to use
- key {String}  A raw key used in the algorithm
- iv {String}  The [initialization vector](http://en.wikipedia.org/wiki/Initialization_vector)

Creates and returns a decipher object, with the given algorithm, key, and iv.

### crypto.createDiffieHellman(prime_length), diffieHellman
### crypto.createDiffieHellman(prime, encoding='binary'), diffieHellman
- prime_length {Number} The bit length to calculate with
- prime {Number} The prime to calculate with
- encoding {Number} The encoding to use; defaults to `'binary'`

Creates a Diffie-Hellman key exchange object and generates a prime of the given bit length. The generator used is `2`.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createDiffieHellman.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### crypto.getDiffieHellman(group_name), diffieHellman
- group_name {String} One of the following group names:  
  * `'modp1'`, as defined in [RFC 2412](http://www.rfc-editor.org/rfc/rfc2412.txt)
  * `'modp2'`, as defined in [RFC 2412](http://www.rfc-editor.org/rfc/rfc2412.txt)
  * `'modp5'`, as defined in [RFC 2412](http://www.rfc-editor.org/rfc/rfc2412.txt)
  * `'modp14'`, as defined in [RFC 3526](http://www.rfc-editor.org/rfc/rfc3526.txt)
  * `'modp15'`, as defined in [RFC 3526](http://www.rfc-editor.org/rfc/rfc3526.txt)
  * `'modp16'`, as defined in [RFC 3526](http://www.rfc-editor.org/rfc/rfc3526.txt)
  * `'modp17'`, as defined in [RFC 3526](http://www.rfc-editor.org/rfc/rfc3526.txt)
  * `'modp18'`, as defined in [RFC 3526](http://www.rfc-editor.org/rfc/rfc3526.txt)

Creates a predefined Diffie-Hellman key exchange object.

The returned object mimics the interface of objects created by
[[crypto.createDiffieHellman `createDiffieHellman()`]], but will not allow you to change the keys (for example, with
[[diffieHellman.setPublicKey `diffieHellman.setPublicKey()`]]).

The advantage of using this routine is that the parties don't have to generate nor exchange group modulus beforehand, saving both processor and communication time.

#### Example: Obtaining a shared secret:

    var crypto = require('crypto');
    var alice = crypto.getDiffieHellman('modp5');
    var bob = crypto.getDiffieHellman('modp5');

    alice.generateKeys();
    bob.generateKeys();

    var alice_secret = alice.computeSecret(bob.getPublicKey(), 'binary', 'hex');
    var bob_secret = bob.computeSecret(alice.getPublicKey(), 'binary', 'hex');

    /* alice_secret and bob_secret should be the same */
    console.log(alice_secret == bob_secret);

### crypto.createHash(algorithm), hash
- algorithm {String}  The hash algorithm to use

Creates and returns a cryptographic hash object with the given algorithm. The object can be used to generate hash digests.

#### Examples

Testing an MD5 Hash:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createHash.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

This program takes the sha1 sum of a file:

    var filename = "my_secret_file.txt";
    var crypto = require('crypto');
    var fs = require('fs');

    var shasum = crypto.createHash('sha1');

    var s = fs.ReadStream(filename);
    s.on('data', function(d) {
      shasum.update(d);
    });

    s.on('end', function() {
      var d = shasum.digest('hex');
      console.log(d + '  ' + filename);
    });

### crypto.createSign(algorithm), signer
- algorithm (String) : The algorithm to use

Creates and returns a signing object string, with the given `algorithm`.


### crypto.createHmac(algorithm, key), hmac
- algorithm {String}  The algorithm to use
- key {String}  The HMAC key to be used

Creates and returns a cryptographic HMAC object with the given algorithm and key. For more information on HMAC, see [this article](http://en.wikipedia.org/wiki/HMAC).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createHmac.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### crypto.pbkdf2(password, salt, iterations, keylen, callback(err, derivedKey))
- password {String}  The password to use
- salt {String}  The salt to use
- iterations {String}  The number of iterations to use
- keylen {String}  The final key length
- callback {Function}  The callback to execute when finished
- err {Error}  The error object
- derivedKey {String}  The resulting key

An asynchronous PBKDF2 function that applies pseudorandom function HMAC-SHA1 to derive a key of the given length from the given password, salt, and number of iterations.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.pbkdf2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### crypto.randomBytes(size [, callback(ex, buf)]), String | Void
- size {Number}  The size of the cryptographic data
- callback {Function}  The callback to execute when finished
- ex {Error}  The error object
- buf {String}  The resulting crypto data

Generates cryptographically strong pseudo-random data, either asynchronously or synchronously.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.randomBytes.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### crypto.createVerify(algorithim), verifier
- algorithm (String) : The algorithm to use

Creates and returns a verification object, with the given algorithm.

This is the mirror of the [[signer `signer`]] object.

## cipher
  
A class for encrypting data. It's a representation of the [OpenSSL implementation of cipher](http://www.openssl.org/docs/apps/ciphers.html). It can be created as a returned value from [[crypto.createCipher `crypto.createCipher()`]] or [[crypto.createCipheriv `crypto.createCipheriv()`]].
  
#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/cipher.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### cipher.final([output_encoding='binary']), String
- output_encoding {String}  The encoding to use for the output; defaults to binary

Returns any remaining enciphered contents. `output_encoding` can be `'binary'`, `'base64'`, or `'hex'`.

Note: The `cipher` object can't be used after the `final()` method has been called.

### cipher.update(data, [input_encoding='binary'], [output_encoding='binary']), cipher
- data {String}  The data to use for an update
- input_encoding {String}  Defines how the input is encoded; can be `'utf8'`, `'ascii'` or `'binary'`
- output_encoding {String}  Defines how the output is encoded; can be `'binary'`, `'base64'` or `'hex'`
(chainable)

Updates the cipher with `data`. This returns the enciphered contents, and can be called many times with new data as it is streamed.

### cipher.setAutoPadding(auto_padding=true)
- auto_padding {Boolean} Specifies wheter automatic padding is on, or not

You can disable automatic padding of the input data to block size. 

If `auto_padding` is false, the length of the entire input data must be a multiple of the cipher's block size or `final` will fail.

This is useful for non-standard padding, _e.g._ using `0x0` instead of PKCS padding. You must call this before `cipher.final`.

## decipher

A class for decrypting data. It's used to decipher previously created [[cipher `cipher`]] objects. It can be created as a returned value from [[crypto.createDecipher `crypto.createDeipher()`]] or [[crypto.createDecipheriv `crypto.createDecipheriv()`]].

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/cipher.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### decipher.update(data, [input_encoding='binary'], [output_encoding='binary']), decipher
- data {String}  The data to use for an update
- input_encoding {String}  Defines how the input is encoded
- output_encoding {String}  Defines how the output is encoded
(chainable)

Updates the decipher with `data`.

The `input_encoding` can be `'binary'`, `'base64'` or `'hex'`. 
The `output_encoding` can be `'binary'`, `'ascii'` or `'utf8'`.

### decipher.final([output_encoding='binary']), String
- output_encoding {String}  The encoding to use for the output; can be either `'binary'`, `'ascii'`, or `'utf8'`

Returns any remaining plaintext which is deciphered.

Note: The `decipher` object can't be used after the `final()` method been called.

### decipher.setAutoPadding(auto_padding=true)
- auto_padding {Boolean} Specifies wheter automatic padding is on, or not

You can disable auto padding if the data has been encrypted without standard block padding to prevent
`decipher.final` from checking and removing it. Can only work if the input data's length is a multiple of the
ciphers block size. You must call this before streaming data to `decipher.update`.

## diffieHellman

This is a class for creating Diffie-Hellman key exchanges. It's a representation of the [OpenSSL implementation of diffie-Hellman](http://www.openssl.org/docs/crypto/dh.html#). It can be created as a returned value from [[crypto.createDiffieHellman `crypto.createDiffieHellman()`]].

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createDiffieHellman.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### diffieHellman.computeSecret(other_public_key, [input_encoding='binary'], [output_encoding='input_encoding']), String
- other_public_key {String}  The other party's public key
- input_encoding {String}  The encoding used to interprate the public key; can be `'binary'`, `'base64'`, or `'hex'`. 
- output_encoding {String}  The encoding of the returned computation; defaults to the `input_encoding`

Computes the shared secret and returns the computed shared secret. 

### diffieHellman.getGenerator([encoding='binary']), String
- encoding (String) : The encoding to use; can be `'binary'`, `'hex'`, or `'base64'`

Returns the Diffie-Hellman prime in the specified encoding.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/diffieHellman.getGenerator.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### diffieHellman.getPrime([encoding='binary']), String
- encoding {String}  The encoding to use;  can be `'binary'`, `'hex'`, or `'base64'`

Returns the Diffie-Hellman prime in the specified encoding.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/diffieHellman.getPrime.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### diffieHellman.getPrivateKey([encoding='binary']), String
- encoding {String}  The encoding to use;  can be `'binary'`, `'hex'`, or `'base64'`

Returns the Diffie-Hellman private key in the specified encoding.

### diffieHellman.getPublicKey([encoding='binary']), String
- encoding {String}  The encoding to use;  can be `'binary'`, `'hex'`, or `'base64'`

Returns the Diffie-Hellman public key in the specified encoding.

### diffieHellman.generateKeys([encoding='binary']), String
- encoding {String}  The encoding to use;  can be `'binary'`, `'hex'`, or `'base64'`

Generates private and public Diffie-Hellman key values, and returns the public key in the specified encoding. This key should be transferred to the other party.

### diffieHellman.setPrivateKey(public_key, [encoding='binary'])
- public_key {String}  The public key that's shared
- encoding {String}  The encoding to use;  can be `'binary'`, `'hex'`, or `'base64'`

Sets the Diffie-Hellman private key. 

### diffieHellman.setPublicKey(public_key, [encoding='binary'])
- public_key {String}  The public key that's shared
- encoding {String}  The encoding to use;  can be `'binary'`, `'hex'`, or `'base64'`

Sets the Diffie-Hellman public key.

## hash

The class for creating hash digests of data. It's class a representation of the [OpenSSL implementation of hash](http://www.openssl.org/docs/crypto/crypto.html#item_AUTHENTICATION) algorithms. It can be created as a returned value from [[crypto.createHash `crypto.createHash()`]].

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createHash.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### hash.digest([encoding='binary'])
- encoding {String}  The encoding to use; can be `'binary'`, `'hex'`, or `'base64'`

Calculates the digest of all of the passed data to be hashed.

Note: The `hash` object can't be used after the `digest()` method been called.


### hash.update(data, [input_encoding]), String
- data {String}  The data to use for an update
- input_encoding {String}  The encoding to use; can be `'binary'`, `'hex'`, or `'base64'`
(chainable)

Updates the hash content with the given `data`. This can be called many times with new data as it is streamed.
 
## hmac

A class for creating cryptographic hmac content. It's a representation of the [OpenSSL implementation of hmac](http://www.openssl.org/docs/crypto/hmac.html#) algorithms. It can be created as a returned value from [[crypto.createHmac `crypto.createHmac()`]].

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createHmac.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### hmac.digest([encoding='binary']), String
- encoding {String}  The encoding to use; can be `'hex'`, `'binary'` or `'base64'`

Calculates the digest of all of the passed data to the hmac.

Note: The `hmac` object can't be used after the `digest()` method been called.

### hmac.update(data), hmac
- data {String}  The data to use for an update
(chainable)

Update the HMAC content with the given `data`. This can be called many times with new data as it is streamed.

## signer

This class is used to generate certificates for OpenSSL. It can be created as a returned value from [[crypto.createSign `crypto.createSign()`]].

#### Example


  var s1 = crypto.createSign('RSA-SHA1')
             .update('Test123')
             .sign(keyPem, 'base64');
  var verified = crypto.createVerify('RSA-SHA1')
                   .update('Test')
                   .update('123')
                   .verify(certPem, s1, 'base64');
  assert.strictEqual(verified, true, 'sign and verify (base 64)');

### signer.sign(private_key, [output_format='binary']), String
- private_key {String} A string containing the PEM encoded private key for signing
- output_format {String}  The output encoding format; can be `'binary'`, `'hex'` or `'base64'`

Calculates the signature on all the updated data passed through the signer.

Note: The `signer` object can not be used after the `sign()` method has been called.

#### Returns

 The signature in a format defined by `output_format`.

### signer.update(data), signer
- data (String) : The data to use for an update
(chainable)

Updates the signer object with data. This can be called many times with new data as it is streamed.

## verifier

This class is used to verify signed certificates for OpenSSL. It can be created as a returned value from [[crypto.createVerify `crypto.createVerify()`]].

#### Example


  var s1 = crypto.createSign('RSA-SHA1')
             .update('Test123')
             .sign(keyPem, 'base64');
  var verified = crypto.createVerify('RSA-SHA1')
                   .update('Test')
                   .update('123')
                   .verify(certPem, s1, 'base64');
  assert.strictEqual(verified, true, 'sign and verify (base 64)');

### verifier.verify(object, signature, [signature_format='binary']), Boolean
- object {String} A string containing a PEM encoded object, which can be one of the following: an RSA public key, a DSA public key or an X.509 certificate
- signature {String} The previously calculated signature for the data
- signature_format {String} The format of the signature; can be `'binary'`, `'hex'`, or `'base64'`

Returns `true` or `false` depending on the validity of the signature for the data and public key.

Note: The `verifier` object can't be used after the `verify()` method has been called.

### verifier.update(data), verifier
- data {String} The data to use for an update
(chainable)

Updates the verifier object with data. This can be called many times with new data as it is streamed. 