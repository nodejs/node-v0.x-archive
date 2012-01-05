Credentials = (secureProtocol, flags, context) ->
  return new Credentials(secureProtocol)  unless (this instanceof Credentials)
  throw new Error("node.js not compiled with openssl crypto support.")  unless crypto
  if context
    @context = context
  else
    @context = new SecureContext()
    if secureProtocol
      @context.init secureProtocol
    else
      @context.init()
  @context.setOptions flags  if flags
try
  binding = process.binding("crypto")
  SecureContext = binding.SecureContext
  Hmac = binding.Hmac
  Hash = binding.Hash
  Cipher = binding.Cipher
  Decipher = binding.Decipher
  Sign = binding.Sign
  Verify = binding.Verify
  DiffieHellman = binding.DiffieHellman
  PBKDF2 = binding.PBKDF2
  randomBytes = binding.randomBytes
  pseudoRandomBytes = binding.pseudoRandomBytes
  crypto = true
catch e
  crypto = false
exports.Credentials = Credentials
exports.createCredentials = (options, context) ->
  options = {}  unless options
  c = new Credentials(options.secureProtocol, options.secureOptions, context)
  return c  if context
  if options.key
    if options.passphrase
      c.context.setKey options.key, options.passphrase
    else
      c.context.setKey options.key
  c.context.setCert options.cert  if options.cert
  c.context.setCiphers options.ciphers  if options.ciphers
  if options.ca
    if Array.isArray(options.ca)
      i = 0
      len = options.ca.length
      
      while i < len
        c.context.addCACert options.ca[i]
        i++
    else
      c.context.addCACert options.ca
  else
    c.context.addRootCerts()
  if options.crl
    if Array.isArray(options.crl)
      i = 0
      len = options.crl.length
      
      while i < len
        c.context.addCRL options.crl[i]
        i++
    else
      c.context.addCRL options.crl
  c.context.setSessionIdContext options.sessionIdContext  if options.sessionIdContext
  c

exports.Hash = Hash
exports.createHash = (hash) ->
  new Hash(hash)

exports.Hmac = Hmac
exports.createHmac = (hmac, key) ->
  (new Hmac).init hmac, key

exports.Cipher = Cipher
exports.createCipher = (cipher, password) ->
  (new Cipher).init cipher, password

exports.createCipheriv = (cipher, key, iv) ->
  (new Cipher).initiv cipher, key, iv

exports.Decipher = Decipher
exports.createDecipher = (cipher, password) ->
  (new Decipher).init cipher, password

exports.createDecipheriv = (cipher, key, iv) ->
  (new Decipher).initiv cipher, key, iv

exports.Sign = Sign
exports.createSign = (algorithm) ->
  (new Sign).init algorithm

exports.Verify = Verify
exports.createVerify = (algorithm) ->
  (new Verify).init algorithm

exports.DiffieHellman = DiffieHellman
exports.createDiffieHellman = (size_or_key, enc) ->
  unless size_or_key
    new DiffieHellman()
  else unless enc
    new DiffieHellman(size_or_key)
  else
    new DiffieHellman(size_or_key, enc)

exports.pbkdf2 = PBKDF2
exports.randomBytes = randomBytes
exports.pseudoRandomBytes = pseudoRandomBytes
exports.rng = randomBytes
exports.prng = pseudoRandomBytes
