noop = ->
createPipe = ->
  Pipe = process.binding("pipe_wrap").Pipe
  new Pipe()
createTCP = ->
  TCP = process.binding("tcp_wrap").TCP
  new TCP()
isPipeName = (s) ->
  typeof s == "string" and toPort(s) == false
initSocketHandle = (self) ->
  self._pendingWriteReqs = 0
  self._flags = 0
  self._connectQueueSize = 0
  self.destroyed = false
  self.bytesRead = 0
  self.bytesWritten = 0
  if self._handle
    self._handle.socket = self
    self._handle.onread = onread
Socket = (options) ->
  return new Socket(options)  unless (this instanceof Socket)
  stream.Stream.call this
  if typeof options == "number"
    fd = options
    @_handle = createPipe()
    @_handle.open fd
    @readable = @writable = true
    initSocketHandle this
  else
    @_handle = options and options.handle
    initSocketHandle this
    @allowHalfOpen = options and options.allowHalfOpen
afterShutdown = (status, handle, req) ->
  self = handle.socket
  assert.ok self._flags & FLAG_SHUTDOWN
  assert.ok not self.writable
  return  if self.destroyed
  if self._flags & FLAG_GOT_EOF or not self.readable
    self.destroy()
  else
onread = (buffer, offset, length) ->
  handle = this
  self = handle.socket
  assert.equal handle, self._handle
  timers.active self
  end = offset + length
  if buffer
    if self._decoder
      string = self._decoder.write(buffer.slice(offset, end))
      self.emit "data", string  if string.length
    else
      self.emit "data", buffer.slice(offset, end)  if self._events and self._events["data"]
    self.bytesRead += length
    self.ondata buffer, offset, end  if self.ondata
  else if errno == "EOF"
    self.readable = false
    assert.ok not (self._flags & FLAG_GOT_EOF)
    self._flags |= FLAG_GOT_EOF
    self.destroy()  unless self.writable
    self.end()  unless self.allowHalfOpen
    self.emit "end"  if self._events and self._events["end"]
    self.onend()  if self.onend
  else
    if errno == "ECONNRESET"
      self.destroy()
    else
      self.destroy errnoException(errno, "read")
afterWrite = (status, handle, req, buffer) ->
  self = handle.socket
  return  if self.destroyed
  if status
    self.destroy errnoException(errno, "write")
    return
  timers.active this
  self._pendingWriteReqs--
  if self._pendingWriteReqs == 0
    self.ondrain()  if self.ondrain
    self.emit "drain"
  req.cb()  if req.cb
  self.destroy()  if self._pendingWriteReqs == 0 and self._flags & FLAG_DESTROY_SOON
connect = (self, address, port, addressType) ->
  self.remotePort = port  if port
  self.remoteAddress = address
  assert.ok self._connecting
  
  if addressType == 6
    connectReq = self._handle.connect6(address, port)
  else if addressType == 4
    connectReq = self._handle.connect(address, port)
  else
    connectReq = self._handle.connect(address, afterConnect)
  if connectReq != null
    connectReq.oncomplete = afterConnect
  else
    self.destroy errnoException(errno, "connect")
afterConnect = (status, handle, req) ->
  self = handle.socket
  return  if self.destroyed
  assert.equal handle, self._handle
  debug "afterConnect"
  assert.ok self._connecting
  self._connecting = false
  if status == 0
    self.readable = self.writable = true
    timers.active self
    handle.readStart()
    self.emit "connect"
    if self._connectQueue
      debug "Drain the connect queue"
      i = 0
      
      while i < self._connectQueue.length
        self._write.apply self, self._connectQueue[i]
        i++
      self._connectQueueCleanUp()
    if self._flags & FLAG_SHUTDOWNQUED
      self._flags &= ~FLAG_SHUTDOWNQUED
      self.end()
  else
    self._connectQueueCleanUp()
    self.destroy errnoException(errno, "connect")
errnoException = (errorno, syscall) ->
  e = new Error(syscall + " " + errorno)
  e.errno = e.code = errorno
  e.syscall = syscall
  e
Server = ->
  return new Server(arguments[0], arguments[1])  unless (this instanceof Server)
  events.EventEmitter.call this
  self = this
  
  if typeof arguments[0] == "function"
    options = {}
    self.on_ "connection", arguments[0]
  else
    options = arguments[0] or {}
    self.on_ "connection", arguments[1]  if typeof arguments[1] == "function"
  @connections = 0
  @allowHalfOpen = options.allowHalfOpen or false
  @_handle = null
toPort = (x) ->
  (if (x = Number(x)) >= 0 then x else false)
listen = (self, address, port, addressType) ->
  if process.env.NODE_WORKER_ID
    require("cluster")._getServer address, port, addressType, (handle) ->
      self._handle = handle
      self._listen2 address, port, addressType
  else
    self._listen2 address, port, addressType
onconnection = (clientHandle) ->
  handle = this
  self = handle.socket
  debug "onconnection"
  unless clientHandle
    self.emit "error", errnoException(errno, "accept")
    return
  if self.maxConnections and self.connections >= self.maxConnections
    clientHandle.close()
    return
  socket = new Socket(
    handle: clientHandle
    allowHalfOpen: self.allowHalfOpen
  )
  socket.readable = socket.writable = true
  socket.resume()
  self.connections++
  socket.server = self
  DTRACE_NET_SERVER_CONNECTION socket
  self.emit "connection", socket
  socket.emit "connect"
events = require("events")
stream = require("stream")
timers = require("timers")
util = require("util")
assert = require("assert")
FLAG_GOT_EOF = 1 << 0
FLAG_SHUTDOWN = 1 << 1
FLAG_DESTROY_SOON = 1 << 2
FLAG_SHUTDOWNQUED = 1 << 3

if process.env.NODE_DEBUG and /net/.test(process.env.NODE_DEBUG)
  debug = (x) ->
    console.error "NET:", x
else
  debug = ->
exports.createServer = ->
  new Server(arguments[0], arguments[1])

exports.connect = exports.createConnection = (port) ->
  if isPipeName(port)
    s = new Socket(handle: createPipe())
  else
    s = new Socket()
  s.connect port, arguments[1], arguments[2]

util.inherits Socket, stream.Stream
exports.Socket = Socket
exports.Stream = Socket
Socket::listen = ->
  self = this
  self.on_ "connection", arguments[0]
  listen self, null, null

Socket::setTimeout = (msecs, callback) ->
  if msecs > 0
    timers.enroll this, msecs
    timers.active this
    @once "timeout", callback  if callback
  else timers.unenroll this  if msecs == 0

Socket::_onTimeout = ->
  debug "_onTimeout"
  @emit "timeout"

Socket::setNoDelay = ->
  @_handle.setNoDelay()  if @_handle and @_handle.setNoDelay

Socket::setKeepAlive = (setting, msecs) ->
  @_handle.setKeepAlive setting, ~~(msecs / 1000)  if @_handle and @_handle.setKeepAlive

Socket::address = ->
  @_handle.getsockname()

Object.defineProperty Socket::, "readyState", get: ->
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

Object.defineProperty Socket::, "bufferSize", get: ->
  @_handle.writeQueueSize + @_connectQueueSize

Socket::pause = ->
  if @_handle
    @_handle.readStop()
    @_handle.unref()  if @_handle.unref

Socket::resume = ->
  if @_handle
    @_handle.readStart()
    @_handle.ref()  if @_handle.ref

Socket::end = (data, encoding) ->
  if @_connecting and ((@_flags & FLAG_SHUTDOWNQUED) == 0)
    @write data, encoding  if data
    @writable = false
    @_flags |= FLAG_SHUTDOWNQUED
  return  unless @writable
  @writable = false
  @write data, encoding  if data
  DTRACE_NET_STREAM_END this
  unless @readable
    @destroySoon()
  else
    @_flags |= FLAG_SHUTDOWN
    shutdownReq = @_handle.shutdown()
    unless shutdownReq
      @destroy errnoException(errno, "shutdown")
      return false
    shutdownReq.oncomplete = afterShutdown
  true

Socket::destroySoon = ->
  @writable = false
  @_flags |= FLAG_DESTROY_SOON
  @destroy()  if @_pendingWriteReqs == 0

Socket::_connectQueueCleanUp = (exception) ->
  @_connecting = false
  @_connectQueueSize = 0
  @_connectQueue = null

Socket::destroy = (exception) ->
  return  if @destroyed
  self = this
  self._connectQueueCleanUp()
  debug "destroy"
  @readable = @writable = false
  timers.unenroll this
  if @server
    @server.connections--
    @server._emitCloseIfDrained()
  debug "close"
  if @_handle
    @_handle.close()
    @_handle.onread = noop
    @_handle = null
  process.nextTick ->
    self.emit "error", exception  if exception
    self.emit "close", (if exception then true else false)
  
  @destroyed = true

Socket::setEncoding = (encoding) ->
  StringDecoder = require("string_decoder").StringDecoder
  @_decoder = new StringDecoder(encoding)

Socket::_getpeername = ->
  return {}  if not @_handle or not @_handle.getpeername
  @_peername = @_handle.getpeername()  unless @_peername
  @_peername

Socket::__defineGetter__ "remoteAddress", ->
  @_getpeername().address

Socket::__defineGetter__ "remotePort", ->
  @_getpeername().port

Socket::write = (data, arg1, arg2) ->
  if arg1
    if typeof arg1 == "string"
      encoding = arg1
      cb = arg2
    else if typeof arg1 == "function"
      cb = arg1
    else
      throw new Error("bad arg")
  data = new Buffer(data, encoding)  if typeof data == "string"
  @bytesWritten += data.length
  if @_connecting
    @_connectQueueSize += data.length
    if @_connectQueue
      @_connectQueue.push [ data, encoding, cb ]
    else
      @_connectQueue = [ [ data, encoding, cb ] ]
    return false
  @_write data, encoding, cb

Socket::_write = (data, encoding, cb) ->
  timers.active this
  writeReq = @_handle.write(data)
  unless writeReq
    @destroy errnoException(errno, "write")
    return false
  writeReq.oncomplete = afterWrite
  writeReq.cb = cb
  @_pendingWriteReqs++
  @_handle.writeQueueSize == 0

Socket::connect = (port) ->
  self = this
  pipe = isPipeName(port)
  if @destroyed or not @_handle
    @_handle = (if pipe then createPipe() else createTCP())
    initSocketHandle this
  
  if typeof arguments[1] == "function"
    self.on_ "connect", arguments[1]
  else
    host = arguments[1]
    self.on_ "connect", arguments[2]  if typeof arguments[2] == "function"
  timers.active this
  self._connecting = true
  self.writable = true
  if pipe
    connect self, port
  else if typeof host == "string"
    debug "connect: find host " + host
    require("dns").lookup host, (err, ip, addressType) ->
      return  unless self._connecting
      if err
        process.nextTick ->
          self.emit "error", err
      else
        timers.active self
        addressType = addressType or 4
        ip = ip or (if addressType == 4 then "127.0.0.1" else "0:0:0:0:0:0:0:1")
        connect self, ip, port, addressType
  else
    debug "connect: missing host"
    connect self, "127.0.0.1", port, 4
  self

util.inherits Server, events.EventEmitter
exports.Server = Server
createServerHandle = exports._createServerHandle = (address, port, addressType) ->
  r = 0
  
  if port == -1 and addressType == -1
    handle = createPipe()
    if process.platform == "win32"
      instances = parseInt(process.env.NODE_PENDING_PIPE_INSTANCES)
      handle.setPendingInstances instances  unless isNaN(instances)
  else
    handle = createTCP()
  if address or port
    debug "bind to " + address
    if addressType == 6
      r = handle.bind6(address, port)
    else
      r = handle.bind(address, port)
  if r
    handle.close()
    handle = null
  handle

Server::_listen2 = (address, port, addressType) ->
  self = this
  r = 0
  unless self._handle
    self._handle = createServerHandle(address, port, addressType)
    unless self._handle
      process.nextTick ->
        self.emit "error", errnoException(errno, "listen")
      
      return
  self._handle.onconnection = onconnection
  self._handle.socket = self
  r = self._handle.listen(self._backlog or 128)
  if r
    self._handle.close()
    self._handle = null
    process.nextTick ->
      self.emit "error", errnoException(errno, "listen")
    
    return
  process.nextTick ->
    self.emit "listening"

Server::listen = ->
  self = this
  lastArg = arguments[arguments.length - 1]
  self.once "listening", lastArg  if typeof lastArg == "function"
  port = toPort(arguments[0])
  TCP = process.binding("tcp_wrap").TCP
  if arguments.length == 0 or typeof arguments[0] == "function"
    listen self, null, null
  else if arguments[0] instanceof TCP
    self._handle = arguments[0]
    listen self, null, -1, -1
  else if isPipeName(arguments[0])
    pipeName = self._pipeName = arguments[0]
    listen self, pipeName, -1, -1
  else if typeof arguments[1] == "undefined" or typeof arguments[1] == "function"
    listen self, "0.0.0.0", port, 4
  else
    require("dns").lookup arguments[1], (err, ip, addressType) ->
      if err
        self.emit "error", err
      else
        listen self, ip or "0.0.0.0", port, (if ip then addressType else 4)
  self

Server::address = ->
  if @_handle and @_handle.getsockname
    @_handle.getsockname()
  else if @_pipeName
    @_pipeName
  else
    null

Server::close = ->
  throw new Error("Not running")  unless @_handle
  @_handle.close()
  @_handle = null
  @_emitCloseIfDrained()
  this

Server::_emitCloseIfDrained = ->
  @emit "close"  if not @_handle and not @connections

Server::listenFD = (fd, type) ->
  throw new Error("This API is no longer supported. See child_process.fork")

exports.isIP = (input) ->
  unless input
    4
  else if /^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/.test(input)
    parts = input.split(".")
    i = 0
    
    while i < parts.length
      part = parseInt(parts[i])
      return 0  if part < 0 or 255 < part
      i++
    4
  else if /^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/.test(input)
    6
  else
    0

exports.isIPv4 = (input) ->
  exports.isIP(input) == 4

exports.isIPv6 = (input) ->
  exports.isIP(input) == 6
