### section: Crypto
##   * class signer
  *
  * This class is used to sign certificates for OpenSSL. It can be created as a returned value from [[crypto.createSigner `crypto.createSigner()`]].
  *
  *
  *
#### Example


	var s1 = crypto.createSign('RSA-SHA1')
             .update('Test123')
             .sign(keyPem, 'base64');
	var verified = crypto.createVerify('RSA-SHA1')
                   .update('Test')
                   .update('123')
                   .verify(certPem, s1, 'base64');
	assert.strictEqual(verified, true, 'sign and verify (base 64)');




## signer.sign(private_key, [output_format='binary']) -> String
- private_key (String) : A string containing the PEM encoded private key for signing
- output_format (String): The output encoding format; can be `'binary'`, `'hex'` or `'base64'`

Calculates the signature on all the updated data passed through the signer.

<Note>The `signer` object can not be used after the `sign()` method has been called.</Note>

#### Returns

 The signature in a format defined by `output_format`.
 


### chainable
## signer.update(data) -> signer
- data (String) : The data to use for an update

Updates the signer object with data. This can be called many times with new data as it is streamed.

 