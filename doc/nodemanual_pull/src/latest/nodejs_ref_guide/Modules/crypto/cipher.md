### section: Crypto
##   * class cipher
  *
  * This class is a representation of the [OpenSSL implementation of cipher](http://www.openssl.org/docs/apps/ciphers.html). It can be created as a returned value from [[crypto.createCipher `crypto.createCipher()`]] or [[crypto.createCipheriv `crypto.createCipheriv()`]].
  *
  * 
#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/crypto/cipher.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## cipher.final([output_encoding='binary']) -> String
- output_encoding (String): The encoding to use for the output; defaults to binary

Returns any remaining enciphered contents. `output_encoding` can be `'binary'`, `'base64'`, or `'hex'`.

<Note>The `cipher` object can't be used after the `final()` method has been called.</Note>

 


### chainable
## cipher.update(data, [input_encoding='binary'], [output_encoding='binary']) -> cipher
- data (String): The data to use for an update
- input_encoding (String): Defines how the input is encoded; can be `'utf8'`, `'ascii'` or `'binary'`
- output_encoding (String): Defines how the output is encoded; can be `'binary'`, `'base64'` or `'hex'`

Updates the cipher with `data`. This returns the enciphered contents, and can be called many times with new data as it is streamed.

 