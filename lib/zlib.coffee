zlibBuffer = (engine, buffer, callback) ->
  buffers = []
  nread = 0
  engine.on_ "error", (err) ->
    engine.removeListener "end"
    engine.removeListener "error"
    callback err
  
  engine.on_ "data", (chunk) ->
    buffers.push chunk
    nread += chunk.length
  
  engine.on_ "end", ->
    switch buffers.length
      when 0
        buffer = new Buffer(0)
      when 1
        buffer = buffers[0]
      else
        buffer = new Buffer(nread)
        n = 0
        buffers.forEach (b) ->
          l = b.length
          b.copy buffer, n, 0, l
          n += l
    callback null, buffer
  
  engine.write buffer
  engine.end()
Deflate = (opts) ->
  return new Deflate(opts)  unless (this instanceof Deflate)
  Zlib.call this, opts, binding.Deflate
Inflate = (opts) ->
  return new Inflate(opts)  unless (this instanceof Inflate)
  Zlib.call this, opts, binding.Inflate
Gzip = (opts) ->
  return new Gzip(opts)  unless (this instanceof Gzip)
  Zlib.call this, opts, binding.Gzip
Gunzip = (opts) ->
  return new Gunzip(opts)  unless (this instanceof Gunzip)
  Zlib.call this, opts, binding.Gunzip
DeflateRaw = (opts) ->
  return new DeflateRaw(opts)  unless (this instanceof DeflateRaw)
  Zlib.call this, opts, binding.DeflateRaw
InflateRaw = (opts) ->
  return new InflateRaw(opts)  unless (this instanceof InflateRaw)
  Zlib.call this, opts, binding.InflateRaw
Unzip = (opts) ->
  return new Unzip(opts)  unless (this instanceof Unzip)
  Zlib.call this, opts, binding.Unzip
Zlib = (opts, Binding) ->
  @_opts = opts = opts or {}
  @_queue = []
  @_processing = false
  @_ended = false
  @readable = true
  @writable = true
  @_flush = binding.Z_NO_FLUSH
  throw new Error("Invalid chunk size: " + opts.chunkSize)  if opts.chunkSize < exports.Z_MIN_CHUNK or opts.chunkSize > exports.Z_MAX_CHUNK  if opts.chunkSize
  throw new Error("Invalid windowBits: " + opts.windowBits)  if opts.windowBits < exports.Z_MIN_WINDOWBITS or opts.windowBits > exports.Z_MAX_WINDOWBITS  if opts.windowBits
  throw new Error("Invalid compression level: " + opts.level)  if opts.level < exports.Z_MIN_LEVEL or opts.level > exports.Z_MAX_LEVEL  if opts.level
  throw new Error("Invalid memLevel: " + opts.memLevel)  if opts.memLevel < exports.Z_MIN_MEMLEVEL or opts.memLevel > exports.Z_MAX_MEMLEVEL  if opts.memLevel
  throw new Error("Invalid strategy: " + opts.strategy)  if opts.strategy != exports.Z_FILTERED and opts.strategy != exports.Z_HUFFMAN_ONLY and opts.strategy != exports.Z_RLE and opts.strategy != exports.Z_FIXED and opts.strategy != exports.Z_DEFAULT_STRATEGY  if opts.strategy
  throw new Error("Invalid dictionary: it should be a Buffer instance")  unless Buffer.isBuffer(opts.dictionary)  if opts.dictionary
  @_binding = new Binding()
  @_binding.init opts.windowBits or exports.Z_DEFAULT_WINDOWBITS, opts.level or exports.Z_DEFAULT_COMPRESSION, opts.memLevel or exports.Z_DEFAULT_MEMLEVEL, opts.strategy or exports.Z_DEFAULT_STRATEGY, opts.dictionary
  @_chunkSize = opts.chunkSize or exports.Z_DEFAULT_CHUNK
  @_buffer = new Buffer(@_chunkSize)
  @_offset = 0
  self = this
binding = process.binding("zlib")
util = require("util")
stream = require("stream")
assert = require("assert").ok
binding.Z_MIN_WINDOWBITS = 8
binding.Z_MAX_WINDOWBITS = 15
binding.Z_DEFAULT_WINDOWBITS = 15
binding.Z_MIN_CHUNK = 64
binding.Z_MAX_CHUNK = Infinity
binding.Z_DEFAULT_CHUNK = (16 * 1024)
binding.Z_MIN_MEMLEVEL = 1
binding.Z_MAX_MEMLEVEL = 9
binding.Z_DEFAULT_MEMLEVEL = 8
binding.Z_MIN_LEVEL = -1
binding.Z_MAX_LEVEL = 9
binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION
Object.keys(binding).forEach (k) ->
  exports[k] = binding[k]  if k.match(/^Z/)

exports.Deflate = Deflate
exports.Inflate = Inflate
exports.Gzip = Gzip
exports.Gunzip = Gunzip
exports.DeflateRaw = DeflateRaw
exports.InflateRaw = InflateRaw
exports.Unzip = Unzip
exports.createDeflate = (o) ->
  new Deflate(o)

exports.createInflate = (o) ->
  new Inflate(o)

exports.createDeflateRaw = (o) ->
  new DeflateRaw(o)

exports.createInflateRaw = (o) ->
  new InflateRaw(o)

exports.createGzip = (o) ->
  new Gzip(o)

exports.createGunzip = (o) ->
  new Gunzip(o)

exports.createUnzip = (o) ->
  new Unzip(o)

exports.deflate = (buffer, callback) ->
  zlibBuffer new Deflate(), buffer, callback

exports.gzip = (buffer, callback) ->
  zlibBuffer new Gzip(), buffer, callback

exports.deflateRaw = (buffer, callback) ->
  zlibBuffer new DeflateRaw(), buffer, callback

exports.unzip = (buffer, callback) ->
  zlibBuffer new Unzip(), buffer, callback

exports.inflate = (buffer, callback) ->
  zlibBuffer new Inflate(), buffer, callback

exports.gunzip = (buffer, callback) ->
  zlibBuffer new Gunzip(), buffer, callback

exports.inflateRaw = (buffer, callback) ->
  zlibBuffer new InflateRaw(), buffer, callback

util.inherits Zlib, stream.Stream
Zlib::write = write = (chunk, cb) ->
  return @emit("error", new Error("Cannot write after end"))  if @_ended
  if arguments.length == 1 and typeof chunk == "function"
    cb = chunk
    chunk = null
  unless chunk
    chunk = null
  else if typeof chunk == "string"
    chunk = new Buffer(chunk)
  else return @emit("error", new Error("Invalid argument"))  unless Buffer.isBuffer(chunk)
  empty = @_queue.length == 0
  @_queue.push [ chunk, cb ]
  @_process()
  @_needDrain = true  unless empty
  empty

Zlib::flush = flush = (cb) ->
  @_flush = binding.Z_SYNC_FLUSH
  @write cb

Zlib::end = end = (chunk, cb) ->
  self = this
  @_ending = true
  ret = @write(chunk, ->
    self.emit "end"
    cb()  if cb
  )
  @_ended = true
  ret

Zlib::_process = ->
  callback = (availInAfter, availOutAfter, buffer) ->
    have = availOutBefore - availOutAfter
    assert have >= 0, "have should not go down"
    if have > 0
      out = self._buffer.slice(self._offset, self._offset + have)
      self._offset += have
      self.emit "data", out
    if availOutAfter == 0 or self._offset >= self._chunkSize
      availOutBefore = self._chunkSize
      self._offset = 0
      self._buffer = new Buffer(self._chunkSize)
    if availOutAfter == 0
      inOff += (availInBefore - availInAfter)
      availInBefore = availInAfter
      newReq = self._binding.write(self._flush, chunk, inOff, availInBefore, self._buffer, self._offset, self._chunkSize)
      newReq.callback = callback
      newReq.buffer = chunk
      self._processing = newReq
      return
    self._processing = false
    cb()  if cb
    self._process()
  return  if @_processing or @_paused
  if @_queue.length == 0
    if @_needDrain
      @_needDrain = false
      @emit "drain"
    return
  req = @_queue.shift()
  cb = req.pop()
  chunk = req.pop()
  @_flush = binding.Z_FINISH  if @_ending and @_queue.length == 0
  self = this
  availInBefore = chunk and chunk.length
  availOutBefore = @_chunkSize - @_offset
  inOff = 0
  req = @_binding.write(@_flush, chunk, inOff, availInBefore, @_buffer, @_offset, availOutBefore)
  req.buffer = chunk
  req.callback = callback
  @_processing = req

Zlib::pause = ->
  @_paused = true
  @emit "pause"

Zlib::resume = ->
  @_paused = false
  @_process()

util.inherits Deflate, Zlib
util.inherits Inflate, Zlib
util.inherits Gzip, Zlib
util.inherits Gunzip, Zlib
util.inherits DeflateRaw, Zlib
util.inherits InflateRaw, Zlib
util.inherits Unzip, Zlib
