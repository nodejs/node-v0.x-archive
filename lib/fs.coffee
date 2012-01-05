stringToFlags = (flag) ->
  return flag  if typeof flag != "string"
  switch flag
    when "r"
      constants.O_RDONLY
    when "r+"
      constants.O_RDWR
    when "w"
      constants.O_CREAT | constants.O_TRUNC | constants.O_WRONLY
    when "w+"
      constants.O_CREAT | constants.O_TRUNC | constants.O_RDWR
    when "a"
      constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY
    when "a+"
      constants.O_APPEND | constants.O_CREAT | constants.O_RDWR
    else
      throw new Error("Unknown file open flag: " + flag)
noop = ->
modeNum = (m, def) ->
  switch typeof m
    when "number"
      m
    when "string"
      parseInt m, 8
    else
      if def
        modeNum def
      else
        undefined
toUnixTimestamp = (time) ->
  return time  if typeof time == "number"
  return time.getTime() / 1000  if time instanceof Date
  throw new Error("Cannot parse time: " + time)
writeAll = (fd, buffer, offset, length, callback) ->
  fs.write fd, buffer, offset, length, offset, (writeErr, written) ->
    if writeErr
      fs.close fd, ->
        callback writeErr  if callback
    else
      if written == length
        fs.close fd, callback
      else
        writeAll fd, buffer, offset + written, length - written, callback
errnoException = (errorno, syscall) ->
  e = new Error(syscall + " " + errorno)
  e.errno = e.code = errorno
  e.syscall = syscall
  e
FSWatcher = ->
  self = this
  FSEvent = process.binding("fs_event_wrap").FSEvent
  @_handle = new FSEvent()
  @_handle.onchange = (status, event, filename) ->
    if status
      self.emit "error", errnoException(errno, "watch")
    else
      self.emit "change", event, filename
StatWatcher = ->
  self = this
  @_handle = new binding.StatWatcher()
  @_handle.onchange = (current, previous) ->
    self.emit "change", current, previous
  
  @_handle.onstop = ->
    self.emit "stop"
inStatWatchers = (filename) ->
  Object::hasOwnProperty.call(statWatchers, filename) and statWatchers[filename]
allocNewPool = ->
  pool = new Buffer(kPoolSize)
  pool.used = 0
SyncWriteStream = (fd) ->
  @fd = fd
  @writable = true
  @readable = false
util = require("util")
pathModule = require("path")
binding = process.binding("fs")
constants = process.binding("constants")
fs = exports
Stream = require("stream").Stream
EventEmitter = require("events").EventEmitter
kMinPoolSpace = 128
kPoolSize = 40 * 1024
fs.Stats = binding.Stats
fs.Stats::_checkModeProperty = (property) ->
  (@mode & constants.S_IFMT) == property

fs.Stats::isDirectory = ->
  @_checkModeProperty constants.S_IFDIR

fs.Stats::isFile = ->
  @_checkModeProperty constants.S_IFREG

fs.Stats::isBlockDevice = ->
  @_checkModeProperty constants.S_IFBLK

fs.Stats::isCharacterDevice = ->
  @_checkModeProperty constants.S_IFCHR

fs.Stats::isSymbolicLink = ->
  @_checkModeProperty constants.S_IFLNK

fs.Stats::isFIFO = ->
  @_checkModeProperty constants.S_IFIFO

fs.Stats::isSocket = ->
  @_checkModeProperty constants.S_IFSOCK

fs.readFile = (path, encoding_) ->
  encoding = (if typeof (encoding_) == "string" then encoding_ else null)
  callback = arguments[arguments.length - 1]
  callback = noop  if typeof (callback) != "function"
  readStream = fs.createReadStream(path)
  buffers = []
  nread = 0
  readStream.on_ "data", (chunk) ->
    buffers.push chunk
    nread += chunk.length
  
  readStream.on_ "error", (er) ->
    callback er
    readStream.destroy()
  
  readStream.on_ "end", ->
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
    if encoding
      try
        buffer = buffer.toString(encoding)
      catch er
        return callback(er)
    callback null, buffer

fs.readFileSync = (path, encoding) ->
  fd = fs.openSync(path, constants.O_RDONLY, 438)
  buffer = new Buffer(4048)
  buffers = []
  nread = 0
  lastRead = 0
  loop
    if lastRead
      buffer._bytesRead = lastRead
      nread += lastRead
      buffers.push buffer
    buffer = new Buffer(4048)
    lastRead = fs.readSync(fd, buffer, 0, buffer.length, null)
    break unless lastRead > 0
  fs.closeSync fd
  if buffers.length > 1
    offset = 0
    
    buffer = new Buffer(nread)
    buffers.forEach (i) ->
      return  unless i._bytesRead
      i.copy buffer, offset, 0, i._bytesRead
      offset += i._bytesRead
  else if buffers.length
    buffer = buffers[0].slice(0, buffers[0]._bytesRead)
  else
    buffer = new Buffer(0)
  buffer = buffer.toString(encoding)  if encoding
  buffer

fs.close = (fd, callback) ->
  binding.close fd, callback or noop

fs.closeSync = (fd) ->
  binding.close fd

fs.open = (path, flags, mode, callback) ->
  callback = arguments[arguments.length - 1]
  callback = noop  if typeof (callback) != "function"
  mode = modeNum(mode, 438)
  binding.open pathModule._makeLong(path), stringToFlags(flags), mode, callback

fs.openSync = (path, flags, mode) ->
  mode = modeNum(mode, 438)
  binding.open pathModule._makeLong(path), stringToFlags(flags), mode

fs.read = (fd, buffer, offset, length, position, callback) ->
  wrapper = (err, bytesRead) ->
    callback and callback(err, bytesRead or 0, buffer)
  unless Buffer.isBuffer(buffer)
    cb = arguments[4]
    encoding = arguments[3]
    position = arguments[2]
    length = arguments[1]
    buffer = new Buffer(length)
    offset = 0
    callback = (err, bytesRead) ->
      return  unless cb
      str = (if (bytesRead > 0) then buffer.toString(encoding, 0, bytesRead) else "")
      (cb) err, str, bytesRead
  binding.read fd, buffer, offset, length, position, wrapper

fs.readSync = (fd, buffer, offset, length, position) ->
  legacy = false
  unless Buffer.isBuffer(buffer)
    legacy = true
    encoding = arguments[3]
    position = arguments[2]
    length = arguments[1]
    buffer = new Buffer(length)
    offset = 0
  r = binding.read(fd, buffer, offset, length, position)
  return r  unless legacy
  str = (if (r > 0) then buffer.toString(encoding, 0, r) else "")
  [ str, r ]

fs.write = (fd, buffer, offset, length, position, callback) ->
  wrapper = (err, written) ->
    callback and callback(err, written or 0, buffer)
  unless Buffer.isBuffer(buffer)
    callback = arguments[4]
    position = arguments[2]
    buffer = new Buffer("" + arguments[1], arguments[3])
    offset = 0
    length = buffer.length
  unless length
    if typeof callback == "function"
      process.nextTick ->
        callback undefined, 0
    return
  binding.write fd, buffer, offset, length, position, wrapper

fs.writeSync = (fd, buffer, offset, length, position) ->
  unless Buffer.isBuffer(buffer)
    position = arguments[2]
    buffer = new Buffer("" + arguments[1], arguments[3])
    offset = 0
    length = buffer.length
  return 0  unless length
  binding.write fd, buffer, offset, length, position

fs.rename = (oldPath, newPath, callback) ->
  binding.rename pathModule._makeLong(oldPath), pathModule._makeLong(newPath), callback or noop

fs.renameSync = (oldPath, newPath) ->
  binding.rename pathModule._makeLong(oldPath), pathModule._makeLong(newPath)

fs.truncate = (fd, len, callback) ->
  binding.truncate fd, len, callback or noop

fs.truncateSync = (fd, len) ->
  binding.truncate fd, len

fs.rmdir = (path, callback) ->
  binding.rmdir pathModule._makeLong(path), callback or noop

fs.rmdirSync = (path) ->
  binding.rmdir pathModule._makeLong(path)

fs.fdatasync = (fd, callback) ->
  binding.fdatasync fd, callback or noop

fs.fdatasyncSync = (fd) ->
  binding.fdatasync fd

fs.fsync = (fd, callback) ->
  binding.fsync fd, callback or noop

fs.fsyncSync = (fd) ->
  binding.fsync fd

fs.mkdir = (path, mode, callback) ->
  callback = mode  if typeof mode == "function"
  binding.mkdir pathModule._makeLong(path), modeNum(mode, 511), callback or noop

fs.mkdirSync = (path, mode) ->
  binding.mkdir pathModule._makeLong(path), modeNum(mode, 511)

fs.sendfile = (outFd, inFd, inOffset, length, callback) ->
  binding.sendfile outFd, inFd, inOffset, length, callback or noop

fs.sendfileSync = (outFd, inFd, inOffset, length) ->
  binding.sendfile outFd, inFd, inOffset, length

fs.readdir = (path, callback) ->
  binding.readdir pathModule._makeLong(path), callback or noop

fs.readdirSync = (path) ->
  binding.readdir pathModule._makeLong(path)

fs.fstat = (fd, callback) ->
  binding.fstat fd, callback or noop

fs.lstat = (path, callback) ->
  binding.lstat pathModule._makeLong(path), callback or noop

fs.stat = (path, callback) ->
  binding.stat pathModule._makeLong(path), callback or noop

fs.fstatSync = (fd) ->
  binding.fstat fd

fs.lstatSync = (path) ->
  binding.lstat pathModule._makeLong(path)

fs.statSync = (path) ->
  binding.stat pathModule._makeLong(path)

fs.readlink = (path, callback) ->
  binding.readlink pathModule._makeLong(path), callback or noop

fs.readlinkSync = (path) ->
  binding.readlink pathModule._makeLong(path)

fs.symlink = (destination, path, type_, callback) ->
  type = (if typeof (type_) == "string" then type_ else null)
  callback_ = arguments[arguments.length - 1]
  callback = (if typeof (callback_) == "function" then callback_ else null)
  binding.symlink pathModule._makeLong(destination), pathModule._makeLong(path), type, callback

fs.symlinkSync = (destination, path, type) ->
  binding.symlink pathModule._makeLong(destination), pathModule._makeLong(path), type

fs.link = (srcpath, dstpath, callback) ->
  binding.link pathModule._makeLong(srcpath), pathModule._makeLong(dstpath), callback or noop

fs.linkSync = (srcpath, dstpath) ->
  binding.link pathModule._makeLong(srcpath), pathModule._makeLong(dstpath)

fs.unlink = (path, callback) ->
  binding.unlink pathModule._makeLong(path), callback or noop

fs.unlinkSync = (path) ->
  binding.unlink pathModule._makeLong(path)

fs.fchmod = (fd, mode, callback) ->
  binding.fchmod fd, modeNum(mode), callback or noop

fs.fchmodSync = (fd, mode) ->
  binding.fchmod fd, modeNum(mode)

if constants.hasOwnProperty("O_SYMLINK")
  fs.lchmod = (path, mode, callback) ->
    callback = callback or noop
    fs.open path, constants.O_WRONLY | constants.O_SYMLINK, (err, fd) ->
      if err
        callback err
        return
      fs.fchmod fd, mode, (err) ->
        fs.close fd, (err2) ->
          callback err or err2
  
  fs.lchmodSync = (path, mode) ->
    fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK)
    
    try
      ret = fs.fchmodSync(fd, mode)
    catch er
      err = er
    try
      fs.closeSync fd
    catch er
      err2 = er
    throw (err or err2)  if err or err2
    ret
fs.chmod = (path, mode, callback) ->
  binding.chmod pathModule._makeLong(path), modeNum(mode), callback or noop

fs.chmodSync = (path, mode) ->
  binding.chmod pathModule._makeLong(path), modeNum(mode)

if constants.hasOwnProperty("O_SYMLINK")
  fs.lchown = (path, uid, gid, callback) ->
    callback = callback or noop
    fs.open path, constants.O_WRONLY | constants.O_SYMLINK, (err, fd) ->
      if err
        callback err
        return
      fs.fchown fd, uid, gid, callback
  
  fs.lchownSync = (path, uid, gid) ->
    fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK)
    fs.fchownSync fd, uid, gid
fs.fchown = (fd, uid, gid, callback) ->
  binding.fchown fd, uid, gid, callback or noop

fs.fchownSync = (fd, uid, gid) ->
  binding.fchown fd, uid, gid

fs.chown = (path, uid, gid, callback) ->
  binding.chown pathModule._makeLong(path), uid, gid, callback or noop

fs.chownSync = (path, uid, gid) ->
  binding.chown pathModule._makeLong(path), uid, gid

fs._toUnixTimestamp = toUnixTimestamp
fs.utimes = (path, atime, mtime, callback) ->
  atime = toUnixTimestamp(atime)
  mtime = toUnixTimestamp(mtime)
  binding.utimes pathModule._makeLong(path), atime, mtime, callback or noop

fs.utimesSync = (path, atime, mtime) ->
  atime = toUnixTimestamp(atime)
  mtime = toUnixTimestamp(mtime)
  binding.utimes pathModule._makeLong(path), atime, mtime

fs.futimes = (fd, atime, mtime, callback) ->
  atime = toUnixTimestamp(atime)
  mtime = toUnixTimestamp(mtime)
  binding.futimes fd, atime, mtime, callback or noop

fs.futimesSync = (fd, atime, mtime) ->
  atime = toUnixTimestamp(atime)
  mtime = toUnixTimestamp(mtime)
  binding.futimes fd, atime, mtime

fs.writeFile = (path, data, encoding_, callback) ->
  encoding = (if typeof (encoding_) == "string" then encoding_ else "utf8")
  callback_ = arguments[arguments.length - 1]
  callback = (if typeof (callback_) == "function" then callback_ else null)
  fs.open path, "w", 438, (openErr, fd) ->
    if openErr
      callback openErr  if callback
    else
      buffer = (if Buffer.isBuffer(data) then data else new Buffer("" + data, encoding))
      writeAll fd, buffer, 0, buffer.length, callback

fs.writeFileSync = (path, data, encoding) ->
  fd = fs.openSync(path, "w")
  data = new Buffer("" + data, encoding or "utf8")  unless Buffer.isBuffer(data)
  written = 0
  length = data.length
  while written < length
    written += fs.writeSync(fd, data, written, length - written, written)
  fs.closeSync fd

util.inherits FSWatcher, EventEmitter
FSWatcher::start = (filename, persistent) ->
  r = @_handle.start(pathModule._makeLong(filename), persistent)
  if r
    @_handle.close()
    throw errnoException(errno, "watch")

FSWatcher::close = ->
  @_handle.close()

fs.watch = (filename) ->
  if "object" == typeof arguments[1]
    options = arguments[1]
    listener = arguments[2]
  else
    options = {}
    listener = arguments[1]
  throw new Error("watch requires a listener function")  unless listener
  options.persistent = true  if options.persistent == undefined
  watcher = new FSWatcher()
  watcher.start filename, options.persistent
  watcher.addListener "change", listener
  watcher

util.inherits StatWatcher, EventEmitter
StatWatcher::start = (filename, persistent, interval) ->
  @_handle.start pathModule._makeLong(filename), persistent, interval

StatWatcher::stop = ->
  @_handle.stop()

statWatchers = {}
fs.watchFile = (filename) ->
  throw new Error("use fs.watch api instead")  if isWindows
  
  
  
  if "object" == typeof arguments[1]
    options = arguments[1]
    listener = arguments[2]
  else
    options = {}
    listener = arguments[1]
  throw new Error("watchFile requires a listener function")  unless listener
  options.persistent = true  if options.persistent == undefined
  options.interval = 0  if options.interval == undefined
  if inStatWatchers(filename)
    stat = statWatchers[filename]
  else
    stat = statWatchers[filename] = new StatWatcher()
    stat.start filename, options.persistent, options.interval
  stat.addListener "change", listener
  stat

fs.unwatchFile = (filename) ->
  if inStatWatchers(filename)
    stat = statWatchers[filename]
    stat.stop()
    statWatchers[filename] = undefined

normalize = pathModule.normalize
isWindows = process.platform == "win32"
if isWindows
  fs.realpathSync = realpathSync = (p, cache) ->
    p = pathModule.resolve(p)
    return cache[p]  if cache and Object::hasOwnProperty.call(cache, p)
    fs.statSync p
    cache[p] = p  if cache
    p
  
  fs.realpath = (p, cache, cb) ->
    if typeof cb != "function"
      cb = cache
      cache = null
    p = pathModule.resolve(p)
    return cb(null, cache[p])  if cache and Object::hasOwnProperty.call(cache, p)
    fs.stat p, (err) ->
      return cb(err)  if err
      cache[p] = p  if cache
      cb null, p
else
  nextPartRe = /(.*?)(?:[\/]+|$)/g
  fs.realpathSync = realpathSync = (p, cache) ->
    p = pathModule.resolve(p)
    return cache[p]  if cache and Object::hasOwnProperty.call(cache, p)
    original = p
    seenLinks = {}
    knownHard = {}
    pos = 0
    current = ""
    base = ""
    previous = ""
    while pos < p.length
      nextPartRe.lastIndex = pos
      result = nextPartRe.exec(p)
      previous = current
      current += result[0]
      base = previous + result[1]
      pos = nextPartRe.lastIndex
      continue  if not base or knownHard[base] or (cache and cache[base] == base)
      
      if cache and Object::hasOwnProperty.call(cache, base)
        resolvedLink = cache[base]
      else
        stat = fs.lstatSync(base)
        unless stat.isSymbolicLink()
          knownHard[base] = true
          cache[base] = base  if cache
          continue
        id = stat.dev.toString(32) + ":" + stat.ino.toString(32)
        unless seenLinks[id]
          fs.statSync base
          seenLinks[id] = fs.readlinkSync(base)
          resolvedLink = pathModule.resolve(previous, seenLinks[id])
          cache[base] = resolvedLink  if cache
      p = pathModule.resolve(resolvedLink, p.slice(pos))
      pos = 0
      previous = base = current = ""
    cache[original] = p  if cache
    p
  
  fs.realpath = realpath = (p, cache, cb) ->
    LOOP = ->
      if pos >= p.length
        cache[original] = p  if cache
        return cb(null, p)
      nextPartRe.lastIndex = pos
      result = nextPartRe.exec(p)
      previous = current
      current += result[0]
      base = previous + result[1]
      pos = nextPartRe.lastIndex
      return process.nextTick(LOOP)  if not base or knownHard[base] or (cache and cache[base] == base)
      return gotResolvedLink(cache[base])  if cache and Object::hasOwnProperty.call(cache, base)
      fs.lstat base, gotStat
    gotStat = (err, stat) ->
      return cb(err)  if err
      unless stat.isSymbolicLink()
        knownHard[base] = true
        cache[base] = base  if cache
        return process.nextTick(LOOP)
      id = stat.dev.toString(32) + ":" + stat.ino.toString(32)
      return gotTarget(null, seenLinks[id], base)  if seenLinks[id]
      fs.stat base, (err) ->
        return cb(err)  if err
        fs.readlink base, (err, target) ->
          gotTarget err, seenLinks[id] = target
    gotTarget = (err, target, base) ->
      return cb(err)  if err
      resolvedLink = pathModule.resolve(previous, target)
      cache[base] = resolvedLink  if cache
      gotResolvedLink resolvedLink
    gotResolvedLink = (resolvedLink) ->
      p = pathModule.resolve(resolvedLink, p.slice(pos))
      pos = 0
      previous = base = current = ""
      process.nextTick LOOP
    if typeof cb != "function"
      cb = cache
      cache = null
    p = pathModule.resolve(p)
    return cb(null, cache[p])  if cache and Object::hasOwnProperty.call(cache, p)
    original = p
    seenLinks = {}
    knownHard = {}
    pos = 0
    current = ""
    base = ""
    previous = ""
    LOOP()

fs.createReadStream = (path, options) ->
  new ReadStream(path, options)

ReadStream = fs.ReadStream = (path, options) ->
  return new ReadStream(path, options)  unless (this instanceof ReadStream)
  Stream.call this
  self = this
  @path = path
  @fd = null
  @readable = true
  @paused = false
  @flags = "r"
  @mode = 438
  @bufferSize = 64 * 1024
  options = options or {}
  keys = Object.keys(options)
  index = 0
  length = keys.length
  
  while index < length
    key = keys[index]
    this[key] = options[key]
    index++
  @setEncoding @encoding  if @encoding
  if @start != undefined
    @end = Infinity  if @end == undefined
    throw new Error("start must be <= end")  if @start > @end
    @pos = @start
  return  if @fd != null
  fs.open @path, @flags, @mode, (err, fd) ->
    if err
      self.emit "error", err
      self.readable = false
      return
    self.fd = fd
    self.emit "open", fd
    self._read()

util.inherits ReadStream, Stream
fs.FileReadStream = fs.ReadStream
ReadStream::setEncoding = (encoding) ->
  StringDecoder = require("string_decoder").StringDecoder
  @_decoder = new StringDecoder(encoding)

ReadStream::_read = ->
  afterRead = (err, bytesRead) ->
    self.reading = false
    if err
      self.emit "error", err
      self.readable = false
      return
    if bytesRead == 0
      self.emit "end"
      self.destroy()
      return
    b = thisPool.slice(start, start + bytesRead)
    if self.paused
      self.buffer = b
      return
    return  unless self.readable
    self._emitData b
    self._read()
  self = this
  return  if not @readable or @paused or @reading
  @reading = true
  if not pool or pool.length - pool.used < kMinPoolSpace
    pool = null
    allocNewPool()
  thisPool = pool
  toRead = Math.min(pool.length - pool.used, ~~@bufferSize)
  start = pool.used
  toRead = Math.min(@end - @pos + 1, toRead)  if @pos != undefined
  fs.read @fd, pool, pool.used, toRead, @pos, afterRead
  @pos += toRead  if @pos != undefined
  pool.used += toRead

ReadStream::_emitData = (d) ->
  if @_decoder
    string = @_decoder.write(d)
    @emit "data", string  if string.length
  else
    @emit "data", d

ReadStream::destroy = (cb) ->
  close = ->
    fs.close self.fd, (err) ->
      if err
        cb err  if cb
        self.emit "error", err
        return
      cb null  if cb
      self.emit "close"
  self = this
  @readable = false
  if @fd
    close()
  else
    @addListener "open", close

ReadStream::pause = ->
  @paused = true

ReadStream::resume = ->
  @paused = false
  if @buffer
    @_emitData @buffer
    @buffer = null
  return  if null == @fd
  @_read()

fs.createWriteStream = (path, options) ->
  new WriteStream(path, options)

WriteStream = fs.WriteStream = (path, options) ->
  return new WriteStream(path, options)  unless (this instanceof WriteStream)
  Stream.call this
  @path = path
  @fd = null
  @writable = true
  @flags = "w"
  @encoding = "binary"
  @mode = 438
  @bytesWritten = 0
  options = options or {}
  keys = Object.keys(options)
  index = 0
  length = keys.length
  
  while index < length
    key = keys[index]
    this[key] = options[key]
    index++
  if @start != undefined
    throw new Error("start must be >= zero")  if @start < 0
    @pos = @start
  @busy = false
  @_queue = []
  if @fd == null
    @_queue.push [ fs.open, @path, @flags, @mode, undefined ]
    @flush()

util.inherits WriteStream, Stream
fs.FileWriteStream = fs.WriteStream
WriteStream::flush = ->
  return  if @busy
  self = this
  args = @_queue.shift()
  unless args
    @emit "drain"  if @drainable
    return
  @busy = true
  method = args.shift()
  cb = args.pop()
  args.push (err) ->
    self.busy = false
    if err
      self.writable = false
      cb err  if cb
      self.emit "error", err
      return
    if method == fs.write
      self.bytesWritten += arguments[1]
      cb null, arguments[1]  if cb
    else if method == fs.open
      self.fd = arguments[1]
      self.emit "open", self.fd
    else if method == fs.close
      cb null  if cb
      self.emit "close"
      return
    self.flush()
  
  args.unshift @fd  if method != fs.open
  method.apply this, args

WriteStream::write = (data) ->
  unless @writable
    @emit "error", new Error("stream not writable")
    return false
  @drainable = true
  
  cb = arguments[arguments.length - 1]  if typeof (arguments[arguments.length - 1]) == "function"
  unless Buffer.isBuffer(data)
    encoding = "utf8"
    encoding = arguments[1]  if typeof (arguments[1]) == "string"
    data = new Buffer("" + data, encoding)
  @_queue.push [ fs.write, data, 0, data.length, @pos, cb ]
  @pos += data.length  if @pos != undefined
  @flush()
  false

WriteStream::end = (data, encoding, cb) ->
  if typeof (data) == "function"
    cb = data
  else if typeof (encoding) == "function"
    cb = encoding
    @write data
  else @write data, encoding  if arguments.length > 0
  @writable = false
  @_queue.push [ fs.close, cb ]
  @flush()

WriteStream::destroy = (cb) ->
  close = ->
    fs.close self.fd, (err) ->
      if err
        cb err  if cb
        self.emit "error", err
        return
      cb null  if cb
      self.emit "close"
  self = this
  @writable = false
  if @fd
    close()
  else
    @addListener "open", close

WriteStream::destroySoon = WriteStream::end
util.inherits SyncWriteStream, Stream
fs.SyncWriteStream = SyncWriteStream
SyncWriteStream::write = (data, arg1, arg2) ->
  if arg1
    if typeof arg1 == "string"
      encoding = arg1
      cb = arg2
    else if typeof arg1 == "function"
      cb = arg1
    else
      throw new Error("bad arg")
  data = new Buffer(data, encoding)  if typeof data == "string"
  fs.writeSync @fd, data, 0, data.length
  process.nextTick cb  if cb
  true

SyncWriteStream::end = (data, arg1, arg2) ->
  @write data, arg1, arg2  if data
  @destroy()

SyncWriteStream::destroy = ->
  fs.closeSync @fd
  @fd = null
  @emit "close"
  true

SyncWriteStream::destroySoon = SyncWriteStream::destroy
