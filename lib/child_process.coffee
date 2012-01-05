createPipe = (ipc) ->
  Pipe = process.binding("pipe_wrap").Pipe  unless Pipe
  new Pipe(ipc)
createSocket = (pipe, readable) ->
  s = new net.Socket(handle: pipe)
  if readable
    s.writable = false
    s.readable = true
    s.resume()
  else
    s.writable = true
    s.readable = false
  s
mergeOptions = (target, overrides) ->
  if overrides
    keys = Object.keys(overrides)
    i = 0
    len = keys.length
    
    while i < len
      k = keys[i]
      target[k] = overrides[k]  if overrides[k] != undefined
      i++
  target
setupChannel = (target, channel) ->
  isWindows = process.platform == "win32"
  target._channel = channel
  jsonBuffer = ""
  if isWindows
    setSimultaneousAccepts = (handle) ->
      simultaneousAccepts = (if (process.env.NODE_MANY_ACCEPTS and process.env.NODE_MANY_ACCEPTS != "0") then true else false)
      unless handle._simultaneousAccepts == simultaneousAccepts
        handle.setSimultaneousAccepts simultaneousAccepts
        handle._simultaneousAccepts = simultaneousAccepts
  channel.onread = (pool, offset, length, recvHandle) ->
    setSimultaneousAccepts recvHandle  if recvHandle and setSimultaneousAccepts
    if pool
      jsonBuffer += pool.toString("ascii", offset, offset + length)
      start = 0
      while (i = jsonBuffer.indexOf("\n", start)) >= 0
        json = jsonBuffer.slice(start, i)
        message = JSON.parse(json)
        target.emit "message", message, recvHandle
        start = i + 1
      jsonBuffer = jsonBuffer.slice(start)
    else
      channel.close()
      target._channel = null
  
  target.send = (message, sendHandle) ->
    throw new TypeError("message cannot be undefined")  if typeof message == "undefined"
    throw new Error("channel closed")  unless target._channel
    return false  if channel.writeQueueSize > 1024 * 1024
    buffer = Buffer(JSON.stringify(message) + "\n")
    setSimultaneousAccepts sendHandle  if sendHandle and setSimultaneousAccepts
    writeReq = channel.write(buffer, 0, buffer.length, sendHandle)
    throw new Error(errno + "cannot write to IPC channel.")  unless writeReq
    writeReq.oncomplete = nop
    true
  
  channel.readStart()
nop = ->
maybeExit = (subprocess) ->
  subprocess._closesGot++
  subprocess.emit "exit", subprocess.exitCode, subprocess.signalCode  if subprocess._closesGot == subprocess._closesNeeded
ChildProcess = ->
  self = this
  @_closesNeeded = 1
  @_closesGot = 0
  @signalCode = null
  @exitCode = null
  @killed = false
  @_internal = new Process()
  @_internal.onexit = (exitCode, signalCode) ->
    if signalCode
      self.signalCode = signalCode
    else
      self.exitCode = exitCode
    self.stdin.destroy()  if self.stdin
    self._internal.close()
    self._internal = null
    maybeExit self
setStreamOption = (name, index, options) ->
  return  if options[name]
  if options.customFds and typeof options.customFds[index] == "number" and options.customFds[index] != -1
    if options.customFds[index] == index
      options[name] = null
    else
      throw new Error("customFds not yet supported")
  else
    options[name] = createPipe()
errnoException = (errorno, syscall) ->
  e = new Error(syscall + " " + errorno)
  e.errno = e.code = errorno
  e.syscall = syscall
  e
EventEmitter = require("events").EventEmitter
net = require("net")
Process = process.binding("process_wrap").Process
inherits = require("util").inherits


exports.fork = (modulePath, args, options) ->
  options = {}  unless options
  args = (if args then args.slice(0) else [])
  args.unshift modulePath
  throw new Error("stdinStream not allowed for fork()")  if options.stdinStream
  throw new Error("customFds not allowed for fork()")  if options.customFds
  options.customFds = (if options.silent then [ -1, -1, -1 ] else [ -1, 1, 2 ])
  options.env = {}  unless options.env
  options.env.NODE_CHANNEL_FD = 42
  options.stdinStream = createPipe(true)
  child = spawn(process.execPath, args, options)
  setupChannel child, options.stdinStream
  child.on_ "exit", ->
    child._channel.close()  if child._channel
  
  child

exports._forkChild = ->
  p = createPipe(true)
  p.open 0
  setupChannel process, p

exports.exec = (command) ->
  if typeof arguments[1] == "function"
    options = undefined
    callback = arguments[1]
  else
    options = arguments[1]
    callback = arguments[2]
  if process.platform == "win32"
    file = "cmd.exe"
    args = [ "/s", "/c", "\"" + command + "\"" ]
    options = mergeOptions({}, options)
    options.windowsVerbatimArguments = true
  else
    file = "/bin/sh"
    args = [ "-c", command ]
  exports.execFile file, args, options, callback

exports.execFile = (file) ->
  exithandler = (code, signal) ->
    return  if exited
    exited = true
    if timeoutId
      clearTimeout timeoutId
      timeoutId = null
    return  unless callback
    if err
      callback err, stdout, stderr
    else if code == 0 and signal == null
      callback null, stdout, stderr
    else
      e = new Error("Command failed: " + stderr)
      e.killed = child.killed or killed
      e.code = code
      e.signal = signal
      callback e, stdout, stderr
  kill = ->
    killed = true
    child.kill options.killSignal
    process.nextTick ->
      exithandler null, options.killSignal
  
  options = 
    encoding: "utf8"
    timeout: 0
    maxBuffer: 200 * 1024
    killSignal: "SIGTERM"
    setsid: false
    cwd: null
    env: null
  
  callback = arguments[arguments.length - 1]  if typeof arguments[arguments.length - 1] == "function"
  if Array.isArray(arguments[1])
    args = arguments[1]
    optionArg = arguments[2]  if typeof arguments[2] == "object"
  else
    args = []
    optionArg = arguments[1]  if typeof arguments[1] == "object"
  mergeOptions options, optionArg
  child = spawn(file, args, 
    cwd: options.cwd
    env: options.env
    windowsVerbatimArguments: not not options.windowsVerbatimArguments
  )
  stdout = ""
  stderr = ""
  killed = false
  exited = false
  
  
  if options.timeout > 0
    timeoutId = setTimeout(->
      kill()
      timeoutId = null
    , options.timeout)
  child.stdout.setEncoding options.encoding
  child.stderr.setEncoding options.encoding
  child.stdout.addListener "data", (chunk) ->
    stdout += chunk
    if stdout.length > options.maxBuffer
      err = new Error("maxBuffer exceeded.")
      kill()
  
  child.stderr.addListener "data", (chunk) ->
    stderr += chunk
    if stderr.length > options.maxBuffer
      err = new Error("maxBuffer exceeded.")
      kill()
  
  child.addListener "exit", exithandler
  child

spawn = exports.spawn = (file, args, options) ->
  args = (if args then args.slice(0) else [])
  args.unshift file
  env = (if options then options.env else null) or process.env
  envPairs = []
  for key of env
    envPairs.push key + "=" + env[key]
  child = new ChildProcess()
  child.spawn 
    file: file
    args: args
    cwd: (if options then options.cwd else null)
    windowsVerbatimArguments: not not (options and options.windowsVerbatimArguments)
    envPairs: envPairs
    customFds: (if options then options.customFds else null)
    stdinStream: (if options then options.stdinStream else null)
  
  child

inherits ChildProcess, EventEmitter
ChildProcess::spawn = (options) ->
  self = this
  setStreamOption "stdinStream", 0, options
  setStreamOption "stdoutStream", 1, options
  setStreamOption "stderrStream", 2, options
  r = @_internal.spawn(options)
  if r
    options.stdinStream.close()  if options.stdinStream
    options.stdoutStream.close()  if options.stdoutStream
    options.stderrStream.close()  if options.stderrStream
    @_internal.close()
    @_internal = null
    throw errnoException(errno, "spawn")
  @pid = @_internal.pid
  @stdin = createSocket(options.stdinStream, false)  if options.stdinStream
  if options.stdoutStream
    @stdout = createSocket(options.stdoutStream, true)
    @_closesNeeded++
    @stdout.on_ "close", ->
      maybeExit self
  if options.stderrStream
    @stderr = createSocket(options.stderrStream, true)
    @_closesNeeded++
    @stderr.on_ "close", ->
      maybeExit self
  r

ChildProcess::kill = (sig) ->
  constants = process.binding("constants")  unless constants
  sig = sig or "SIGTERM"
  signal = constants[sig]
  throw new Error("Unknown signal: " + sig)  unless signal
  if @_internal
    @killed = true
    r = @_internal.kill(signal)
