ReadStream = (fd) ->
  onData = (b) ->
    if keypressListeners.length
      self._emitKey b
    else
      self.removeListener "data", onData
      self.on_ "newListener", onNewListener
  onNewListener = (event) ->
    if event == "keypress"
      self.on_ "data", onData
      self.removeListener "newListener", onNewListener
  return new ReadStream(fd)  unless (this instanceof ReadStream)
  net.Socket.call this, handle: new TTY(fd, true)
  @writable = false
  self = this
  keypressListeners = @listeners("keypress")
  stdinHandle = @_handle  unless stdinHandle
  @on_ "newListener", onNewListener
WriteStream = (fd) ->
  return new WriteStream(fd)  unless (this instanceof WriteStream)
  net.Socket.call this, handle: new TTY(fd, false)
  @readable = false
  @writable = true
assert = require("assert")
inherits = require("util").inherits
net = require("net")
TTY = process.binding("tty_wrap").TTY
isTTY = process.binding("tty_wrap").isTTY

exports.isatty = (fd) ->
  isTTY fd

exports.setRawMode = (flag) ->
  assert.ok stdinHandle, "stdin must be initialized before calling setRawMode"
  stdinHandle.setRawMode flag

exports.getWindowSize = ->
  80

exports.setWindowSize = ->
  throw new Error("implement me")

inherits ReadStream, net.Socket
exports.ReadStream = ReadStream
ReadStream::pause = ->
  @_handle.unref()
  net.Socket::pause.call this

ReadStream::resume = ->
  @_handle.ref()
  net.Socket::resume.call this

ReadStream::isTTY = true
metaKeyCodeRe = /^(?:\x1b)([a-zA-Z0-9])$/
functionKeyCodeRe = /^(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/
ReadStream::_emitKey = (s) ->
  key = 
    name: undefined
    ctrl: false
    meta: false
    shift: false
  
  if Buffer.isBuffer(s)
    if s[0] > 127 and s[1] == undefined
      s[0] -= 128
      s = "\u001b" + s.toString(@encoding or "utf-8")
    else
      s = s.toString(@encoding or "utf-8")
  if s == "\r" or s == "\n"
    key.name = "enter"
  else if s == "\t"
    key.name = "tab"
  else if s == "\b" or s == "" or s == "\u001b" or s == "\u001b\b"
    key.name = "backspace"
    key.meta = (s.charAt(0) == "\u001b")
  else if s == "\u001b" or s == "\u001b\u001b"
    key.name = "escape"
    key.meta = (s.length == 2)
  else if s == " " or s == "\u001b "
    key.name = "space"
    key.meta = (s.length == 2)
  else if s <= "\u001a"
    key.name = String.fromCharCode(s.charCodeAt(0) + "a".charCodeAt(0) - 1)
    key.ctrl = true
  else if s.length == 1 and s >= "a" and s <= "z"
    key.name = s
  else if s.length == 1 and s >= "A" and s <= "Z"
    key.name = s.toLowerCase()
    key.shift = true
  else if parts = metaKeyCodeRe.exec(s)
    key.name = parts[1].toLowerCase()
    key.meta = true
    key.shift = /^[A-Z]$/.test(parts[1])
  else if parts = functionKeyCodeRe.exec(s)
    code = (parts[1] or "") + (parts[2] or "") + (parts[4] or "") + (parts[6] or "")
    modifier = (parts[3] or parts[5] or 1) - 1
    key.ctrl = not not (modifier & 4)
    key.meta = not not (modifier & 10)
    key.shift = not not (modifier & 1)
    switch code
      when "OP"
        key.name = "f1"
      when "OQ"
        key.name = "f2"
      when "OR"
        key.name = "f3"
      when "OS"
        key.name = "f4"
      when "[11~"
        key.name = "f1"
      when "[12~"
        key.name = "f2"
      when "[13~"
        key.name = "f3"
      when "[14~"
        key.name = "f4"
      when "[15~"
        key.name = "f5"
      when "[17~"
        key.name = "f6"
      when "[18~"
        key.name = "f7"
      when "[19~"
        key.name = "f8"
      when "[20~"
        key.name = "f9"
      when "[21~"
        key.name = "f10"
      when "[23~"
        key.name = "f11"
      when "[24~"
        key.name = "f12"
      when "[A"
        key.name = "up"
      when "[B"
        key.name = "down"
      when "[C"
        key.name = "right"
      when "[D"
        key.name = "left"
      when "[E"
        key.name = "clear"
      when "[F"
        key.name = "end"
      when "[H"
        key.name = "home"
      when "OA"
        key.name = "up"
      when "OB"
        key.name = "down"
      when "OC"
        key.name = "right"
      when "OD"
        key.name = "left"
      when "OE"
        key.name = "clear"
      when "OF"
        key.name = "end"
      when "OH"
        key.name = "home"
      when "[1~"
        key.name = "home"
      when "[2~"
        key.name = "insert"
      when "[3~"
        key.name = "delete"
      when "[4~"
        key.name = "end"
      when "[5~"
        key.name = "pageup"
      when "[6~"
        key.name = "pagedown"
      when "[[5~"
        key.name = "pageup"
      when "[[6~"
        key.name = "pagedown"
      when "[7~"
        key.name = "home"
      when "[8~"
        key.name = "end"
      when "[a"
        key.name = "up"
        key.shift = true
      when "[b"
        key.name = "down"
        key.shift = true
      when "[c"
        key.name = "right"
        key.shift = true
      when "[d"
        key.name = "left"
        key.shift = true
      when "[e"
        key.name = "clear"
        key.shift = true
      when "[2$"
        key.name = "insert"
        key.shift = true
      when "[3$"
        key.name = "delete"
        key.shift = true
      when "[5$"
        key.name = "pageup"
        key.shift = true
      when "[6$"
        key.name = "pagedown"
        key.shift = true
      when "[7$"
        key.name = "home"
        key.shift = true
      when "[8$"
        key.name = "end"
        key.shift = true
      when "Oa"
        key.name = "up"
        key.ctrl = true
      when "Ob"
        key.name = "down"
        key.ctrl = true
      when "Oc"
        key.name = "right"
        key.ctrl = true
      when "Od"
        key.name = "left"
        key.ctrl = true
      when "Oe"
        key.name = "clear"
        key.ctrl = true
      when "[2^"
        key.name = "insert"
        key.ctrl = true
      when "[3^"
        key.name = "delete"
        key.ctrl = true
      when "[5^"
        key.name = "pageup"
        key.ctrl = true
      when "[6^"
        key.name = "pagedown"
        key.ctrl = true
      when "[7^"
        key.name = "home"
        key.ctrl = true
      when "[8^"
        key.name = "end"
        key.ctrl = true
      when "[Z"
        key.name = "tab"
        key.shift = true
  else if s.length > 1 and s[0] != "\u001b"
    Array::forEach.call s, @_emitKey, this
    return
  key = undefined  if key.name == undefined
  char = s  if s.length == 1
  @emit "keypress", char, key  if key or char

inherits WriteStream, net.Socket
exports.WriteStream = WriteStream
WriteStream::isTTY = true
WriteStream::cursorTo = (x, y) ->
  return  if typeof x != "number" and typeof y != "number"
  throw new Error("Can't set cursor row without also setting it's column")  if typeof x != "number"
  if typeof y != "number"
    @write "\u001b[" + (x + 1) + "G"
  else
    @write "\u001b[" + (y + 1) + ";" + (x + 1) + "H"

WriteStream::moveCursor = (dx, dy) ->
  if dx < 0
    @write "\u001b[" + (-dx) + "D"
  else @write "\u001b[" + dx + "C"  if dx > 0
  if dy < 0
    @write "\u001b[" + (-dy) + "A"
  else @write "\u001b[" + dy + "B"  if dy > 0

WriteStream::clearLine = (dir) ->
  if dir < 0
    @write "\u001b[1K"
  else if dir > 0
    @write "\u001b[0K"
  else
    @write "\u001b[2K"

WriteStream::getWindowSize = ->
  @_handle.getWindowSize()
