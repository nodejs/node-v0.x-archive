convertNPNProtocols = (NPNProtocols, out) ->
  if Array.isArray(NPNProtocols)
    buff = new Buffer(NPNProtocols.reduce((p, c) ->
      p + 1 + Buffer.byteLength(c)
    , 0))
    NPNProtocols.reduce ((offset, c) ->
      clen = Buffer.byteLength(c)
      buff[offset] = clen
      buff.write c, offset + 1
      offset + 1 + clen
    ), 0
    NPNProtocols = buff
  out.NPNProtocols = NPNProtocols  if Buffer.isBuffer(NPNProtocols)
CryptoStream = (pair) ->
  stream.Stream.call this
  @pair = pair
  @readable = @writable = true
  @_paused = false
  @_needDrain = false
  @_pending = []
  @_pendingCallbacks = []
  @_pendingBytes = 0
parseCertString = (s) ->
  out = {}
  parts = s.split("\n")
  i = 0
  len = parts.length
  
  while i < len
    sepIndex = parts[i].indexOf("=")
    if sepIndex > 0
      key = parts[i].slice(0, sepIndex)
      value = parts[i].slice(sepIndex + 1)
      out[key] = value
    i++
  out
CleartextStream = (pair) ->
  CryptoStream.call this, pair
EncryptedStream = (pair) ->
  CryptoStream.call this, pair
SecurePair = (credentials, isServer, requestCert, rejectUnauthorized, options) ->
  return new SecurePair(credentials, isServer, requestCert, rejectUnauthorized, options)  unless (this instanceof SecurePair)
  self = this
  options or (options = {})
  events.EventEmitter.call this
  @_secureEstablished = false
  @_isServer = (if isServer then true else false)
  @_encWriteState = true
  @_clearWriteState = true
  @_doneFlag = false
  unless credentials
    @credentials = crypto.createCredentials()
  else
    @credentials = credentials
  requestCert = true  unless @_isServer
  @_rejectUnauthorized = (if rejectUnauthorized then true else false)
  @_requestCert = (if requestCert then true else false)
  @ssl = new Connection(@credentials.context, (if @_isServer then true else false), (if @_isServer then @_requestCert else options.servername), @_rejectUnauthorized)
  if process.features.tls_sni
    @ssl.setSNICallback options.SNICallback  if @_isServer and options.SNICallback
    @servername = null
  if process.features.tls_npn and options.NPNProtocols
    @ssl.setNPNProtocols options.NPNProtocols
    @npnProtocol = null
  @cleartext = new CleartextStream(this)
  @encrypted = new EncryptedStream(this)
  process.nextTick ->
    self.ssl.start()  if self.ssl
    self.cycle()
Server = ->
  if typeof arguments[0] == "object"
    options = arguments[0]
    listener = arguments[1]
  else if typeof arguments[0] == "function"
    options = {}
    listener = arguments[0]
  return new Server(options, listener)  unless (this instanceof Server)
  self = this
  @setOptions options
  sharedCreds = crypto.createCredentials(
    key: self.key
    passphrase: self.passphrase
    cert: self.cert
    ca: self.ca
    ciphers: self.ciphers or "RC4-SHA:AES128-SHA:AES256-SHA"
    secureProtocol: self.secureProtocol
    secureOptions: self.secureOptions
    crl: self.crl
    sessionIdContext: self.sessionIdContext
  )
  net.Server.call this, (socket) ->
    creds = crypto.createCredentials(null, sharedCreds.context)
    pair = new SecurePair(creds, true, self.requestCert, self.rejectUnauthorized, 
      NPNProtocols: self.NPNProtocols
      SNICallback: self.SNICallback
    )
    cleartext = pipe(pair, socket)
    cleartext._controlReleased = false
    pair.on_ "secure", ->
      pair.cleartext.authorized = false
      pair.cleartext.npnProtocol = pair.npnProtocol
      pair.cleartext.servername = pair.servername
      unless self.requestCert
        cleartext._controlReleased = true
        self.emit "secureConnection", pair.cleartext, pair.encrypted
      else
        verifyError = pair.ssl.verifyError()
        if verifyError
          pair.cleartext.authorizationError = verifyError
          if self.rejectUnauthorized
            socket.destroy()
            pair.destroy()
          else
            cleartext._controlReleased = true
            self.emit "secureConnection", pair.cleartext, pair.encrypted
        else
          pair.cleartext.authorized = true
          cleartext._controlReleased = true
          self.emit "secureConnection", pair.cleartext, pair.encrypted
    
    pair.on_ "error", (err) ->
      self.emit "clientError", err
  
  @on_ "secureConnection", listener  if listener
pipe = (pair, socket) ->
  onerror = (e) ->
    cleartext.emit "error", e  if cleartext._controlReleased
  onclose = ->
    socket.removeListener "error", onerror
    socket.removeListener "end", onclose
    socket.removeListener "timeout", ontimeout
  ontimeout = ->
    cleartext.emit "timeout"
  pair.encrypted.pipe socket
  socket.pipe pair.encrypted
  pair.fd = socket.fd
  cleartext = pair.cleartext
  cleartext.socket = socket
  cleartext.encrypted = pair.encrypted
  cleartext.authorized = false
  socket.on_ "error", onerror
  socket.on_ "close", onclose
  socket.on_ "timeout", ontimeout
  cleartext
crypto = require("crypto")
util = require("util")
net = require("net")
events = require("events")
stream = require("stream")
END_OF_FILE = 42
assert = require("assert").ok

if process.env.NODE_DEBUG and /tls/.test(process.env.NODE_DEBUG)
  debug = (a) ->
    console.error "TLS:", a
else
  debug = ->
Connection = null
try
  Connection = process.binding("crypto").Connection
catch e
  throw new Error("node.js not compiled with openssl crypto support.")
util.inherits CryptoStream, stream.Stream
CryptoStream::write = (data) ->
  if this == @pair.cleartext
    debug "cleartext.write called with " + data.length + " bytes"
  else
    debug "encrypted.write called with " + data.length + " bytes"
  throw new Error("CryptoStream is not writable")  unless @writable
  
  if typeof arguments[1] == "string"
    encoding = arguments[1]
    cb = arguments[2]
  else
    cb = arguments[1]
  data = new Buffer(data, encoding)  if typeof data == "string"
  debug (if this == @pair.cleartext then "clear" else "encrypted") + "In data"
  @_pending.push data
  @_pendingCallbacks.push cb
  @_pendingBytes += data.length
  @pair._writeCalled = true
  @pair.cycle()
  unless @_needDrain
    if @_pendingBytes >= 128 * 1024
      @_needDrain = true
    else
      if this == @pair.cleartext
        @_needDrain = @pair.encrypted._paused
      else
        @_needDrain = @pair.cleartext._paused
  not @_needDrain

CryptoStream::pause = ->
  debug "paused " + (if this == @pair.cleartext then "cleartext" else "encrypted")
  @_paused = true

CryptoStream::resume = ->
  debug "resume " + (if this == @pair.cleartext then "cleartext" else "encrypted")
  @_paused = false
  @pair.cycle()

CryptoStream::setTimeout = (n) ->
  @socket.setTimeout n  if @socket

CryptoStream::setNoDelay = ->
  @socket.setNoDelay()  if @socket

CryptoStream::setEncoding = (encoding) ->
  StringDecoder = require("string_decoder").StringDecoder
  @_decoder = new StringDecoder(encoding)

CryptoStream::getPeerCertificate = ->
  if @pair.ssl
    c = @pair.ssl.getPeerCertificate()
    if c
      c.issuer = parseCertString(c.issuer)  if c.issuer
      c.subject = parseCertString(c.subject)  if c.subject
      return c
  null

CryptoStream::getSession = ->
  return @pair.ssl.getSession()  if @pair.ssl
  null

CryptoStream::isSessionReused = ->
  return @pair.ssl.isSessionReused()  if @pair.ssl
  null

CryptoStream::getCipher = (err) ->
  if @pair.ssl
    @pair.ssl.getCurrentCipher()
  else
    null

CryptoStream::end = (d) ->
  return  if @pair._doneFlag
  return  unless @writable
  @write d  if d
  @_pending.push END_OF_FILE
  @_pendingCallbacks.push null
  @writable = false
  @pair.cycle()

CryptoStream::destroySoon = (err) ->
  if @writable
    @end()
  else
    @destroy()

CryptoStream::destroy = (err) ->
  return  if @pair._doneFlag
  @pair.destroy()

CryptoStream::_done = ->
  @_doneFlag = true
  @pair.destroy()  if @pair.cleartext._doneFlag and @pair.encrypted._doneFlag and not @pair._doneFlag

Object.defineProperty CryptoStream::, "readyState", get: ->
  if @_connecting
    "opening"
  else if @readable and @writable
    "open"
  else if @readable and not @writable
    "readOnly"
  else if not @readable and @writable
    "writeOnly"
  else
    "closed"

CryptoStream::_push = ->
  return  if this == @pair.encrypted and not @writable
  until @_paused
    bytesRead = 0
    chunkBytes = 0
    pool = new Buffer(16 * 4096)
    loop
      chunkBytes = @_pusher(pool, bytesRead, pool.length - bytesRead)
      if @pair.ssl and @pair.ssl.error
        @pair.error()
        return
      @pair.maybeInitFinished()
      bytesRead += chunkBytes  if chunkBytes >= 0
      break unless chunkBytes > 0 and bytesRead < pool.length
    assert bytesRead >= 0
    if bytesRead == 0
      @_done()  if @_internallyPendingBytes() == 0 and @_destroyAfterPush
      return
    chunk = pool.slice(0, bytesRead)
    if this == @pair.cleartext
      debug "cleartext emit \"data\" with " + bytesRead + " bytes"
    else
      debug "encrypted emit \"data\" with " + bytesRead + " bytes"
    if @_decoder
      string = @_decoder.write(chunk)
      @emit "data", string  if string.length
    else
      @emit "data", chunk
    @ondata pool, 0, bytesRead  if @ondata

CryptoStream::_pull = ->
  havePending = @_pending.length > 0
  assert havePending or @_pendingBytes == 0
  while @_pending.length > 0
    break  unless @pair.ssl
    tmp = @_pending.shift()
    cb = @_pendingCallbacks.shift()
    assert @_pending.length == @_pendingCallbacks.length
    if tmp == END_OF_FILE
      if this == @pair.encrypted
        debug "end encrypted " + @pair.fd
        @pair.cleartext._destroyAfterPush = true
      else
        assert this == @pair.cleartext
        debug "end cleartext"
        @pair.ssl.shutdown()
        @pair.encrypted._destroyAfterPush = true
      @pair.cycle()
      @_done()
      return
    continue  if tmp.length == 0
    rv = @_puller(tmp)
    if @pair.ssl and @pair.ssl.error
      @pair.error()
      return
    @pair.maybeInitFinished()
    if rv == 0 or rv < 0
      @_pending.unshift tmp
      @_pendingCallbacks.unshift cb
      break
    @_pendingBytes -= tmp.length
    assert @_pendingBytes >= 0
    cb()  if cb
    assert rv == tmp.length
  if @_needDrain and @_pending.length == 0
    if this == @pair.cleartext
      paused = @pair.encrypted._paused
    else
      paused = @pair.cleartext._paused
    unless paused
      debug "drain " + (if this == @pair.cleartext then "clear" else "encrypted")
      self = this
      process.nextTick ->
        self.ondrain()  if typeof self.ondrain == "function"
        self.emit "drain"
      
      @_needDrain = false
      @end()  if @__destroyOnDrain

util.inherits CleartextStream, CryptoStream
CleartextStream::_internallyPendingBytes = ->
  if @pair.ssl
    @pair.ssl.clearPending()
  else
    0

CleartextStream::_puller = (b) ->
  debug "clearIn " + b.length + " bytes"
  @pair.ssl.clearIn b, 0, b.length

CleartextStream::_pusher = (pool, offset, length) ->
  debug "reading from clearOut"
  return -1  unless @pair.ssl
  @pair.ssl.clearOut pool, offset, length

CleartextStream::address = ->
  @socket and @socket.address()

CleartextStream::__defineGetter__ "remoteAddress", ->
  @socket and @socket.remoteAddress

CleartextStream::__defineGetter__ "remotePort", ->
  @socket and @socket.remotePort

util.inherits EncryptedStream, CryptoStream
EncryptedStream::_internallyPendingBytes = ->
  if @pair.ssl
    @pair.ssl.encPending()
  else
    0

EncryptedStream::_puller = (b) ->
  debug "writing from encIn"
  @pair.ssl.encIn b, 0, b.length

EncryptedStream::_pusher = (pool, offset, length) ->
  debug "reading from encOut"
  return -1  unless @pair.ssl
  @pair.ssl.encOut pool, offset, length

util.inherits SecurePair, events.EventEmitter
exports.createSecurePair = (credentials, isServer, requestCert, rejectUnauthorized) ->
  pair = new SecurePair(credentials, isServer, requestCert, rejectUnauthorized)
  pair

SecurePair::cycle = (depth) ->
  return  if @_doneFlag
  depth = (if depth then depth else 0)
  @_writeCalled = false  if depth == 0
  established = @_secureEstablished
  unless @cycleEncryptedPullLock
    @cycleEncryptedPullLock = true
    debug "encrypted._pull"
    @encrypted._pull()
    @cycleEncryptedPullLock = false
  unless @cycleCleartextPullLock
    @cycleCleartextPullLock = true
    debug "cleartext._pull"
    @cleartext._pull()
    @cycleCleartextPullLock = false
  unless @cycleCleartextPushLock
    @cycleCleartextPushLock = true
    debug "cleartext._push"
    @cleartext._push()
    @cycleCleartextPushLock = false
  unless @cycleEncryptedPushLock
    @cycleEncryptedPushLock = true
    debug "encrypted._push"
    @encrypted._push()
    @cycleEncryptedPushLock = false
  @cycle depth + 1  if (not established and @_secureEstablished) or (depth == 0 and @_writeCalled)

SecurePair::maybeInitFinished = ->
  if @ssl and not @_secureEstablished and @ssl.isInitFinished()
    @npnProtocol = @ssl.getNegotiatedProtocol()  if process.features.tls_npn
    @servername = @ssl.getServername()  if process.features.tls_sni
    @_secureEstablished = true
    debug "secure established"
    @emit "secure"

SecurePair::destroy = ->
  self = this
  error = @ssl.error
  unless @_doneFlag
    @_doneFlag = true
    @ssl.error = null
    @ssl.close()
    @ssl = null
    self.encrypted.writable = self.encrypted.readable = false
    self.cleartext.writable = self.cleartext.readable = false
    process.nextTick ->
      self.cleartext.emit "end"
      self.encrypted.emit "close"
      self.cleartext.emit "close"
    
    unless @_secureEstablished
      unless error
        error = new Error("socket hang up")
        error.code = "ECONNRESET"
      @emit "error", error

SecurePair::error = ->
  unless @_secureEstablished
    @destroy()
  else
    err = @ssl.error
    @ssl.error = null
    if @_isServer and @_rejectUnauthorized and /peer did not return a certificate/.test(err.message)
      @destroy()
    else
      @cleartext.emit "error", err

util.inherits Server, net.Server
exports.Server = Server
exports.createServer = (options, listener) ->
  new Server(options, listener)

Server::setOptions = (options) ->
  if typeof options.requestCert == "boolean"
    @requestCert = options.requestCert
  else
    @requestCert = false
  if typeof options.rejectUnauthorized == "boolean"
    @rejectUnauthorized = options.rejectUnauthorized
  else
    @rejectUnauthorized = false
  @key = options.key  if options.key
  @passphrase = options.passphrase  if options.passphrase
  @cert = options.cert  if options.cert
  @ca = options.ca  if options.ca
  @secureProtocol = options.secureProtocol  if options.secureProtocol
  @crl = options.crl  if options.crl
  @ciphers = options.ciphers  if options.ciphers
  @secureProtocol = options.secureProtocol  if options.secureProtocol
  @secureOptions = options.secureOptions  if options.secureOptions
  convertNPNProtocols options.NPNProtocols, this  if options.NPNProtocols
  if options.SNICallback
    @SNICallback = options.SNICallback
  else
    @SNICallback = @SNICallback.bind(this)
  if options.sessionIdContext
    @sessionIdContext = options.sessionIdContext
  else @sessionIdContext = crypto.createHash("md5").update(process.argv.join(" ")).digest("hex")  if @requestCert

Server::_contexts = []
Server::addContext = (servername, credentials) ->
  throw "Servername is required parameter for Server.addContext"  unless servername
  re = new RegExp("^" + servername.replace(/([\.^$+?\-\\[\]{}])/g, "\\$1").replace(/\*/g, ".*") + "$")
  @_contexts.push [ re, crypto.createCredentials(credentials).context ]

Server::SNICallback = (servername) ->
  @_contexts.some (elem) ->
    if servername.match(elem[0]) != null
      ctx = elem[1]
      true
  
  ctx

exports.connect = (port) ->
  options = {}
  i = 1
  
  while i < arguments.length
    switch typeof arguments[i]
      when "string"
        host = arguments[i]
      when "object"
        options = arguments[i]
      when "function"
        cb = arguments[i]
    i++
  socket = new net.Stream()
  sslcontext = crypto.createCredentials(options)
  convertNPNProtocols options.NPNProtocols, this
  pair = new SecurePair(sslcontext, false, true, (if options.rejectUnauthorized == true then true else false), 
    NPNProtocols: @NPNProtocols
    servername: options.servername or host
  )
  pair.ssl.setSession options.session  if options.session
  cleartext = pipe(pair, socket)
  cleartext.on_ "secureConnect", cb  if cb
  socket.connect port, host
  pair.on_ "secure", ->
    verifyError = pair.ssl.verifyError()
    cleartext.npnProtocol = pair.npnProtocol
    if verifyError
      cleartext.authorized = false
      cleartext.authorizationError = verifyError
      if pair._rejectUnauthorized
        cleartext.emit "error", verifyError
        pair.destroy()
      else
        cleartext.emit "secureConnect"
    else
      cleartext.authorized = true
      cleartext.emit "secureConnect"
  
  pair.on_ "error", (err) ->
    cleartext.emit "error", err
  
  cleartext._controlReleased = true
  cleartext
