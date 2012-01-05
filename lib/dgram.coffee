noop = ->
isIP = (address) ->
  net = require("net")  unless net
  net.isIP address
lookup = (address, family, callback) ->
  matchedFamily = isIP(address)
  return callback(null, address, matchedFamily)  if matchedFamily
  dns = require("dns")  unless dns
  dns.lookup address, family, callback
lookup4 = (address, callback) ->
  lookup address or "0.0.0.0", 4, callback
lookup6 = (address, callback) ->
  lookup address or "::0", 6, callback
newHandle = (type) ->
  if type == "udp4"
    handle = new UDP
    handle.lookup = lookup4
    return handle
  if type == "udp6"
    handle = new UDP
    handle.lookup = lookup6
    handle.bind = handle.bind6
    handle.send = handle.send6
    return handle
  throw new Error("unix_dgram sockets are not supported any more.")  if type == "unix_dgram"
  throw new Error("Bad socket type specified. Valid types are: udp4, udp6")
Socket = (type, listener) ->
  events.EventEmitter.call this
  handle = newHandle(type)
  handle.socket = this
  @_handle = handle
  @_receiving = false
  @_bound = false
  @type = type
  @fd = null
  @on_ "message", listener  if typeof listener == "function"
afterSend = (status, handle, req, buffer) ->
  self = handle.socket
  undefined  if handle != self._handle
  req.cb null, buffer.length  if req.cb
onMessage = (handle, nread, buf, rinfo) ->
  self = handle.socket
  if nread == -1
    self.emit "error", errnoException(errno, "recvmsg")
  else
    rinfo.size = buf.length
    self.emit "message", buf, rinfo
errnoException = (errorno, syscall) ->
  e = new Error(syscall + " " + errorno)
  e.errno = e.code = errorno
  e.syscall = syscall
  e
util = require("util")
events = require("events")
UDP = process.binding("udp_wrap").UDP
dns = null
net = null
util.inherits Socket, events.EventEmitter
exports.Socket = Socket
exports.createSocket = (type, listener) ->
  new Socket(type, listener)

Socket::bind = (port, address) ->
  self = this
  self._healthCheck()
  self._handle.lookup address, (err, ip) ->
    unless err
      if self._handle.bind(ip, port or 0, 0)
        err = errnoException(errno, "bind")
      else
        self._bound = true
        self.emit "listening"
        self._startReceiving()
    if err
      process.nextTick ->
        self.emit "error", err

Socket::sendto = (buffer, offset, length, port, address, callback) ->
  throw new Error("send takes offset and length as args 2 and 3")  if typeof offset != "number" or typeof length != "number"
  throw new Error(@type + " sockets must send to port, address")  if typeof address != "string"
  @send buffer, offset, length, port, address, callback

Socket::send = (buffer, offset, length, port, address, callback) ->
  self = this
  callback = callback or noop
  self._healthCheck()
  self._startReceiving()
  self._handle.lookup address, (err, ip) ->
    if err
      callback err  if callback
      self.emit "error", err
    else
      req = self._handle.send(buffer, offset, length, port, ip)
      if req
        req.oncomplete = afterSend
        req.cb = callback
      else
        callback errnoException(errno, "send")

Socket::close = ->
  @_healthCheck()
  @_stopReceiving()
  @_handle.close()
  @_handle = null
  @emit "close"

Socket::address = ->
  @_healthCheck()
  address = @_handle.getsockname()
  throw errnoException(errno, "getsockname")  unless address
  address

Socket::setBroadcast = (arg) ->
  throw new Error("not yet implemented")

Socket::setTTL = (arg) ->
  throw new Error("not yet implemented")

Socket::setMulticastTTL = (arg) ->
  throw new Error("not yet implemented")

Socket::setMulticastLoopback = (arg) ->
  throw new Error("not yet implemented")

Socket::addMembership = (multicastAddress, multicastInterface) ->
  throw new Error("not yet implemented")

Socket::dropMembership = (multicastAddress, multicastInterface) ->
  throw new Error("not yet implemented")

Socket::_healthCheck = ->
  throw new Error("Not running")  unless @_handle

Socket::_startReceiving = ->
  return  if @_receiving
  unless @_bound
    @bind()
    throw new Error("implicit bind failed")  unless @_bound
  @_handle.onmessage = onMessage
  @_handle.recvStart()
  @_receiving = true
  @fd = -42

Socket::_stopReceiving = ->
  return  unless @_receiving
  @_handle.onmessage = noop
  @_handle.recvStop()
  @_receiving = false
  @fd = null
