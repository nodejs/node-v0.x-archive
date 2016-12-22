
### section: crypto
## class crypto

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

<Note>All `algorithm` parameter implementations below are dependent on the OpenSSL version installed on the platform. Some common examples of these algoritihms are `'sha1'`, `'md5'`, `'sha256'`, and `'sha512'`. On recent Node.js releases, `openssl list-message-digest-algorithms` displays the available digest algorithms. </Note>



#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## crypto.createCipher(algorithm, password) -> cipher
- algorithm (String):  The algorithm to use
- password (String):  The password to use

Creates and returns a cipher object with the given algorithm and password.

The `password` is used to derive both the key and IV, which must be a binary-encoded string. For more information, see the section on [[buffer buffers]].

 



## crypto.createCipheriv(algorithm, key, iv) -> cipher
- algorithm (String): The algorithm to use
- key (String): A raw key used in the algorithm
- iv (String): The [initialization vector](http://en.wikipedia.org/wiki/Initialization_vector)

Creates and returns a cipher object, with the given algorithm, key, and IV.

Both `key` and `iv` must be a binary-encoded string. For more information, see the section on [[buffer buffers]].


 



## crypto.createCredentials([details]) -> Object
- details (String): A dictionary of fields to populate the credential with

Creates a credentials object, with  `details` being a dictionary with the following keys:

- key (String): A string holding the PEM encoded private key file
- cert (String): A string holding the PEM encoded certificate file
- ca (String): Either a string or list of strings of PEM encoded CA certificates to trust

If no `ca` details are given, then Node.js uses the default publicly trusted list of CAs as given by [Mozilla](http://mxr.mozilla.org/mozilla/source/security/nss/lib/ckfw/builtins/certdata.txt).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createCredentials.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## crypto.createDecipher(algorithm, password) -> decipher
- algorithm (String): The algorithm to use
- password (String): The password to use

Creates and returns a decipher object, with the given algorithm and key.

 



## crypto.createDecipheriv(algorithm, key, iv) -> decipher
- algorithm (String): The algorithm to use
- key (String): A raw key used in the algorithm
- iv (String): The [initialization vector](http://en.wikipedia.org/wiki/Initialization_vector)

Creates and returns a decipher object, with the given algorithm, key, and iv.

 



## crypto.createDiffieHellman(prime_length) -> diffieHellman
crypto.createDiffieHellman(prime, encoding='binary') -> diffieHellman

Creates a Diffie-Hellman key exchange object and generates a prime of the given bit length. The generator used is `2`.

- prime_length : The bit length to calculate with
- prime : The prime to calculate with
- encoding : The encoding to use; defaults to `'binary'`

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createDiffieHellman.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## crypto.createHash(algorithm) -> hash
- algorithm (String): The hash algorithm to use

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

 



## crypto.createSign(algorithm) -> signer
- algorithm (String) : The algorithm to use

Creates and returns a signing object string, with the given `algorithm`.


 



## crypto.createHmac(algorithm, key) -> hmac
- algorithm (String): The algorithm to use
- key (String): The HMAC key to be used

Creates and returns a cryptographic HMAC object with the given algorithm and key. For more information on HMAC, see [this article](http://en.wikipedia.org/wiki/HMAC).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createHmac.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## crypto.pbkdf2(password, salt, iterations, keylen, callback(err, derivedKey)) -> Void
- password (String): The password to use
- salt (String): The salt to use
- iterations (String): The number of iterations to use
- keylen (String): The final key length
- callback (Function): The callback to execute when finished
- err (Error): The error object
- derivedKey (String): The resulting key

An asynchronous PBKDF2 function that applies pseudorandom function HMAC-SHA1 to derive a key of the given length from the given password, salt, and number of iterations.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.pbkdf2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## crypto.randomBytes(size [, callback(ex, buf)]) -> String | Void
- size (Number): The size of the cryptographic data
- callback (Function): The callback to execute when finished
- ex (Error): The error object
- buf (String): The resulting crypto data

Generates cryptographically strong pseudo-random data, either asynchronously or synchronously.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.randomBytes.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 


## crypto.createVerify(algorithim) -> verifier
- algorithm (String) : The algorithm to use

Creates and returns a verification object, with the given algorithm.

This is the mirror of the [[signer `signer`]] object.

 