
### section: Crypto
##   * class hash
  *
  * This class is a representation of the [OpenSSL implementation of hash](http://www.openssl.org/docs/crypto/crypto.html#item_AUTHENTICATION) algorithms. It can be created as a returned value from [[crypto.createHash `crypto.createHash()`]].
  *
  *
  *
#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/crypto.createHash.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## hash.digest([encoding='binary']) -> Void
  * - encoding (String): The encoding to use; can be `'binary'`, `'hex'`, or `'base64'`

Calculates the digest of all of the passed data to be hashed.

<Note>The `hash` object can't be used after the `digest()` method been called.</Note>


 


### chainable
## hash.update(data, [input_encoding]) -> String
- data (String): The data to use for an update
- input_encoding (String): The encoding to use; can be `'binary'`, `'hex'`, or `'base64'`

Updates the hash content with the given `data`. This can be called many times with new data as it is streamed.


 