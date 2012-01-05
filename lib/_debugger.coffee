Protocol = ->
  @_newRes()
Client = ->
  net.Stream.call this
  protocol = @protocol = new Protocol(this)
  @_reqCallbacks = []
  socket = this
  @currentFrame = NO_FRAME
  @currentSourceLine = -1
  @currentSource = null
  @handles = {}
  @scripts = {}
  @breakpoints = []
  socket.setEncoding "utf8"
  socket.on_ "data", (d) ->
    protocol.execute d
  
  protocol.onResponse = @_onResponse.bind(this)
SourceUnderline = (sourceText, position, tty) ->
  return ""  unless sourceText
  head = sourceText.slice(0, position)
  tail = sourceText.slice(position)
  tail = tail.replace(/(.+?)([^\w]|$)/, "\u001b[32m$1\u001b[39m$2")  if tty and not repl.disableColors
  [ head, tail ].join ""
SourceInfo = (body) ->
  result = (if body.exception then "exception in " else "break in ")
  if body.script
    if body.script.name
      name = body.script.name
      dir = path.resolve() + "/"
      name = name.slice(dir.length)  if name.indexOf(dir) == 0
      result += name
    else
      result += "[unnamed]"
  result += ":"
  result += body.sourceLine + 1
  result += "\n" + body.exception.text  if body.exception
  result
Interface = (stdin, stdout, args) ->
  defineProperty = (key, protoKey) ->
    fn = proto[protoKey].bind(self)
    if proto[protoKey].length == 0
      Object.defineProperty self.repl.context, key, 
        get: fn
        enumerable: true
        configurable: false
    else
      self.repl.context[key] = fn
  self = this
  @stdin = stdin
  @stdout = stdout
  @args = args
  streams = 
    stdin: stdin
    stdout: stdout
  
  @repl = new repl.REPLServer("debug> ", streams, @controlEval.bind(this), false, true)
  @repl.rli.addListener "close", ->
    self.killed = true
    self.killChild()
  
  process.on_ "exit", ->
    self.killChild()
  
  proto = Interface::
  ignored = [ "pause", "resume", "exitRepl", "handleBreak", "requireConnection", "killChild", "trySpawn", "controlEval", "debugEval", "print", "childPrint", "clearline" ]
  shortcut = 
    run: "r"
    cont: "c"
    next: "n"
    step: "s"
    out: "o"
    backtrace: "bt"
    setBreakpoint: "sb"
    clearBreakpoint: "cb"
    pause_: "pause"
  
  for i of proto
    if Object::hasOwnProperty.call(proto, i) and ignored.indexOf(i) == -1
      defineProperty i, i
      defineProperty shortcut[i], i  if shortcut[i]
  @killed = false
  @waiting = null
  @paused = 0
  @context = @repl.context
  @history = 
    debug: []
    control: []
  
  @breakpoints = []
  @_watchers = []
  @pause()
  setTimeout (->
    self.run ->
      self.resume()
  ), 10
intChars = (n) ->
  if n < 50
    3
  else if n < 950
    4
  else if n < 9950
    5
  else
    6
leftPad = (n, prefix) ->
  s = n.toString()
  nchars = intChars(n)
  nspaces = nchars - s.length - 1
  prefix or (prefix = " ")
  i = 0
  
  while i < nspaces
    prefix += " "
    i++
  prefix + s
util = require("util")
path = require("path")
net = require("net")
vm = require("vm")
repl = require("repl")
inherits = util.inherits
spawn = require("child_process").spawn
exports.start = (argv, stdin, stdout) ->
  argv or (argv = process.argv.slice(2))
  if argv.length < 1
    console.error "Usage: node debug script.js"
    process.exit 1
  stdin = stdin or process.openStdin()
  stdout = stdout or process.stdout
  args = [ "--debug-brk" ].concat(argv)
  interface = new Interface(stdin, stdout, args)
  stdin.resume()
  process.on_ "uncaughtException", (e) ->
    console.error "There was an internal error in Node's debugger. " + "Please report this bug."
    console.error e.message
    console.error e.stack
    interface.child.kill()  if interface.child
    process.exit 1

exports.port = 5858
exports.Protocol = Protocol
Protocol::_newRes = (raw) ->
  @res = 
    raw: raw or ""
    headers: {}
  
  @state = "headers"
  @reqSeq = 1
  @execute ""

Protocol::execute = (d) ->
  res = @res
  res.raw += d
  switch @state
    when "headers"
      endHeaderIndex = res.raw.indexOf("\r\n\r\n")
      break  if endHeaderIndex < 0
      rawHeader = res.raw.slice(0, endHeaderIndex)
      endHeaderByteIndex = Buffer.byteLength(rawHeader, "utf8")
      lines = rawHeader.split("\r\n")
      i = 0
      
      while i < lines.length
        kv = lines[i].split(/: +/)
        res.headers[kv[0]] = kv[1]
        i++
      @contentLength = +res.headers["Content-Length"]
      @bodyStartByteIndex = endHeaderByteIndex + 4
      @state = "body"
      break  if Buffer.byteLength(res.raw, "utf8") - @bodyStartByteIndex < @contentLength
    when "body"
      resRawByteLength = Buffer.byteLength(res.raw, "utf8")
      if resRawByteLength - @bodyStartByteIndex >= @contentLength
        buf = new Buffer(resRawByteLength)
        buf.write res.raw, 0, resRawByteLength, "utf8"
        res.body = buf.slice(@bodyStartByteIndex, @bodyStartByteIndex + @contentLength).toString("utf8")
        res.body = (if res.body.length then JSON.parse(res.body) else {})
        @onResponse res
        @_newRes buf.slice(@bodyStartByteIndex + @contentLength).toString("utf8")
    else
      throw new Error("Unknown state")

Protocol::serialize = (req) ->
  req.type = "request"
  req.seq = @reqSeq++
  json = JSON.stringify(req)
  "Content-Length: " + Buffer.byteLength(json, "utf8") + "\r\n\r\n" + json

NO_FRAME = -1
inherits Client, net.Stream
exports.Client = Client
Client::_addHandle = (desc) ->
  return  if typeof desc != "object" or typeof desc.handle != "number"
  @handles[desc.handle] = desc
  @_addScript desc  if desc.type == "script"

natives = process.binding("natives")
Client::_addScript = (desc) ->
  @scripts[desc.id] = desc
  desc.isNative = (desc.name.replace(".js", "") of natives) or desc.name == "node.js"  if desc.name

Client::_removeScript = (desc) ->
  @scripts[desc.id] = undefined

Client::_onResponse = (res) ->
  index = -1
  @_reqCallbacks.some (fn, i) ->
    if fn.request_seq == res.body.request_seq
      cb = fn
      index = i
      true
  
  self = this
  handled = false
  if res.headers.Type == "connect"
    self.reqScripts()
    self.emit "ready"
    handled = true
  else if res.body and res.body.event == "break"
    @emit "break", res.body
    handled = true
  else if res.body and res.body.event == "exception"
    @emit "exception", res.body
    handled = true
  else if res.body and res.body.event == "afterCompile"
    @_addHandle res.body.body.script
    handled = true
  else if res.body and res.body.event == "scriptCollected"
    @_removeScript res.body.body.script
    handled = true
  if cb
    @_reqCallbacks.splice index, 1
    handled = true
    err = res.success == false and (res.message or true) or res.body.success == false and (res.body.message or true)
    cb err, res.body and res.body.body or res.body, res
  @emit "unhandledResponse", res.body  unless handled

Client::req = (req, cb) ->
  @write @protocol.serialize(req)
  cb.request_seq = req.seq
  @_reqCallbacks.push cb

Client::reqVersion = (cb) ->
  cb = cb or ->
  
  @req command: "version", (err, body, res) ->
    return cb(err)  if err
    cb null, res.body.body.V8Version, res.body.running

Client::reqLookup = (refs, cb) ->
  self = this
  req = 
    command: "lookup"
    arguments: handles: refs
  
  cb = cb or ->
  
  @req req, (err, res) ->
    return cb(err)  if err
    for ref of res
      self._addHandle res[ref]  if typeof res[ref] == "object"
    cb null, res

Client::reqScopes = (cb) ->
  self = this
  req = 
    command: "scopes"
    arguments: {}
  
  cb = cb or ->
  
  @req req, (err, res) ->
    return cb(err)  if err
    refs = res.scopes.map((scope) ->
      scope.object.ref
    )
    self.reqLookup refs, (err, res) ->
      return cb(err)  if err
      globals = Object.keys(res).map((key) ->
        res[key].properties.map (prop) ->
          prop.name
      )
      cb null, globals.reverse()

Client::reqEval = (expression, cb) ->
  self = this
  if @currentFrame == NO_FRAME
    @reqFrameEval expression, NO_FRAME, cb
    return
  cb = cb or ->
  
  @reqBacktrace (err, bt) ->
    return cb(null, {})  if err or not bt.frames
    frame = bt.frames[self.currentFrame]
    evalFrames = frame.scopes.map((s) ->
      return  unless s
      x = bt.frames[s.index]
      return  unless x
      x.index
    )
    self._reqFramesEval expression, evalFrames, cb

Client::_reqFramesEval = (expression, evalFrames, cb) ->
  if evalFrames.length == 0
    @reqFrameEval expression, NO_FRAME, cb
    return
  self = this
  i = evalFrames.shift()
  cb = cb or ->
  
  @reqFrameEval expression, i, (err, res) ->
    return cb(null, res)  unless err
    self._reqFramesEval expression, evalFrames, cb

Client::reqFrameEval = (expression, frame, cb) ->
  self = this
  req = 
    command: "evaluate"
    arguments: expression: expression
  
  if frame == NO_FRAME
    req.arguments.global = true
  else
    req.arguments.frame = frame
  cb = cb or ->
  
  @req req, (err, res) ->
    self._addHandle res  unless err
    cb err, res

Client::reqBacktrace = (cb) ->
  @req 
    command: "backtrace"
    arguments: inlineRefs: true
  , cb

Client::reqSetExceptionBreak = (type, cb) ->
  @req 
    command: "setexceptionbreak"
    arguments: 
      type: type
      enabled: true
  , cb

Client::reqScripts = (cb) ->
  self = this
  cb = cb or ->
  
  @req command: "scripts", (err, res) ->
    return cb(err)  if err
    i = 0
    
    while i < res.length
      self._addHandle res[i]
      i++
    cb null

Client::reqContinue = (cb) ->
  @currentFrame = NO_FRAME
  @req command: "continue", cb

Client::listbreakpoints = (cb) ->
  @req command: "listbreakpoints", cb

Client::setBreakpoint = (req, cb) ->
  req = 
    command: "setbreakpoint"
    arguments: req
  
  @req req, cb

Client::clearBreakpoint = (req, cb) ->
  req = 
    command: "clearbreakpoint"
    arguments: req
  
  @req req, cb

Client::reqSource = (from, to, cb) ->
  req = 
    command: "source"
    fromLine: from
    toLine: to
  
  @req req, cb

Client::step = (action, count, cb) ->
  req = 
    command: "continue"
    arguments: 
      stepaction: action
      stepcount: count
  
  @currentFrame = NO_FRAME
  @req req, cb

Client::mirrorObject = (handle, depth, cb) ->
  self = this
  
  if handle.type == "object"
    propertyRefs = handle.properties.map((p) ->
      p.ref
    )
    cb = cb or ->
    
    @reqLookup propertyRefs, (err, res) ->
      waitForOthers = ->
        if --waiting == 0 and cb
          keyValues.forEach (kv) ->
            mirror[kv.name] = kv.value
          
          cb null, mirror
      if err
        console.error "problem with reqLookup"
        cb null, handle
        return
      waiting = 1
      if handle.className == "Array"
        mirror = []
      else
        mirror = {}
      keyValues = []
      handle.properties.forEach (prop, i) ->
        value = res[prop.ref]
        
        if value
          mirrorValue = (if value.value then value.value else value.text)
        else
          mirrorValue = "[?]"
        return  if Array.isArray(mirror) and typeof prop.name != "number"
        keyValues[i] = 
          name: prop.name
          value: mirrorValue
        
        if value and value.handle and depth > 0
          waiting++
          self.mirrorObject value, depth - 1, (err, result) ->
            keyValues[i].value = result  unless err
            waitForOthers()
      
      waitForOthers()
    
    return
  else if handle.type == "function"
    val = ->
  else if handle.type == "null"
    val = null
  else if handle.value != undefined
    val = handle.value
  else if handle.type == "undefined"
    val = undefined
  else
    val = handle
  process.nextTick ->
    cb null, val

Client::fullTrace = (cb) ->
  self = this
  cb = cb or ->
  
  @reqBacktrace (err, trace) ->
    return cb(err)  if err
    return cb(Error("No frames"))  if trace.totalFrames <= 0
    refs = []
    i = 0
    
    while i < trace.frames.length
      frame = trace.frames[i]
      refs.push frame.script.ref
      refs.push frame.func.ref
      refs.push frame.receiver.ref
      i++
    self.reqLookup refs, (err, res) ->
      return cb(err)  if err
      i = 0
      
      while i < trace.frames.length
        frame = trace.frames[i]
        frame.script = res[frame.script.ref]
        frame.func = res[frame.func.ref]
        frame.receiver = res[frame.receiver.ref]
        i++
      cb null, trace

commands = [ [ "run (r)", "cont (c)", "next (n)", "step (s)", "out (o)", "backtrace (bt)", "setBreakpoint (sb)", "clearBreakpoint (cb)" ], [ "watch", "unwatch", "watchers", "repl", "restart", "kill", "list", "scripts", "breakpoints", "version" ] ]
helpMessage = "Commands: " + commands.map((group) ->
  group.join ", "
).join(",\n")
Interface::pause = ->
  return false  if @killed or @paused++ > 0
  @repl.rli.pause()
  @stdin.pause()

Interface::resume = (silent) ->
  return false  if @killed or @paused == 0 or --@paused != 0
  @repl.rli.resume()
  @repl.displayPrompt()  if silent != true
  @stdin.resume()
  if @waiting
    @waiting()
    @waiting = null

Interface::clearline = ->
  if @stdout.isTTY
    @stdout.cursorTo 0
    @stdout.clearLine 1
  else
    @stdout.write "\b"

Interface::print = (text, oneline) ->
  return  if @killed
  @clearline()
  @stdout.write (if typeof text == "string" then text else util.inspect(text))
  @stdout.write "\n"  if oneline != true

Interface::childPrint = (text) ->
  @print text.toString().split(/\r\n|\r|\n/g).filter((chunk) ->
    chunk
  ).map((chunk) ->
    "< " + chunk
  ).join("\n")
  @repl.displayPrompt true

Interface::error = (text) ->
  @print text
  @resume()

Interface::handleBreak = (r) ->
  self = this
  @pause()
  @client.currentSourceLine = r.sourceLine
  @client.currentSourceLineText = r.sourceLineText
  @client.currentSourceColumn = r.sourceColumn
  @client.currentFrame = 0
  @client.currentScript = r.script and r.script.name
  @print SourceInfo(r)
  @watchers true, (err) ->
    return self.error(err)  if err
    self.list 2
    self.resume true

Interface::requireConnection = ->
  unless @client
    @error "App isn't running... Try `run` instead"
    return false
  true

Interface::controlEval = (code, context, filename, callback) ->
  try
    code = "(" + @repl.rli.history[0] + "\n)"  if code == "(undefined\n)"  if @repl.rli.history and @repl.rli.history.length > 0
    result = vm.runInContext(code, context, filename)
    return callback(null, result)  if @paused == 0
    @waiting = ->
      callback null, result
  catch e
    callback e

Interface::debugEval = (code, context, filename, callback) ->
  return  unless @requireConnection()
  self = this
  client = @client
  if code == ".scope"
    client.reqScopes callback
    return
  frame = (if client.currentFrame == NO_FRAME then frame else undefined)
  self.pause()
  client.reqFrameEval code, frame, (err, res) ->
    if err
      callback err
      self.resume true
      return
    client.mirrorObject res, 3, (err, mirror) ->
      callback null, mirror
      self.resume true

Interface::help = ->
  @print helpMessage

Interface::run = ->
  callback = arguments[0]
  if @child
    @error "App is already running... Try `restart` instead"
    callback and callback(true)
  else
    @trySpawn callback

Interface::restart = ->
  return  unless @requireConnection()
  self = this
  self.pause()
  self.killChild()
  setTimeout (->
    self.trySpawn()
    self.resume()
  ), 1000

Interface::version = ->
  return  unless @requireConnection()
  self = this
  @pause()
  @client.reqVersion (err, v) ->
    if err
      self.error err
    else
      self.print v
    self.resume()

Interface::list = (delta) ->
  return  unless @requireConnection()
  delta or (delta = 5)
  self = this
  client = @client
  from = client.currentSourceLine - delta + 1
  to = client.currentSourceLine + delta + 1
  self.pause()
  client.reqSource from, to, (err, res) ->
    if err or not res
      self.error "You can't list source code right now"
      self.resume()
      return
    lines = res.source.split("\n")
    i = 0
    
    while i < lines.length
      lineno = res.fromLine + i + 1
      continue  if lineno < from or lineno > to
      current = lineno == 1 + client.currentSourceLine
      breakpoint = client.breakpoints.some((bp) ->
        bp.script == client.currentScript and bp.line == lineno
      )
      if lineno == 1
        wrapper = require("module").wrapper[0]
        lines[i] = lines[i].slice(wrapper.length)
        client.currentSourceColumn -= wrapper.length
      
      if current
        line = SourceUnderline(lines[i], client.currentSourceColumn, self.stdout.isTTY)
      else
        line = lines[i]
      self.print leftPad(lineno, breakpoint and "*") + " " + line
      i++
    self.resume()

Interface::backtrace = ->
  return  unless @requireConnection()
  self = this
  client = @client
  self.pause()
  client.fullTrace (err, bt) ->
    if err
      self.error "Can't request backtrace now"
      self.resume()
      return
    if bt.totalFrames == 0
      self.print "(empty stack)"
    else
      trace = []
      firstFrameNative = bt.frames[0].script.isNative
      i = 0
      
      while i < bt.frames.length
        frame = bt.frames[i]
        break  if not firstFrameNative and frame.script.isNative
        text = "#" + i + " "
        text += frame.func.inferredName + " "  if frame.func.inferredName and frame.func.inferredName.length > 0
        text += path.basename(frame.script.name) + ":"
        text += (frame.line + 1) + ":" + (frame.column + 1)
        trace.push text
        i++
      self.print trace.join("\n")
    self.resume()

Interface::scripts = ->
  return  unless @requireConnection()
  client = @client
  displayNatives = arguments[0] or false
  scripts = []
  @pause()
  for id of client.scripts
    script = client.scripts[id]
    scripts.push (if script.name == client.currentScript then "* " else "  ") + id + ": " + path.basename(script.name)  if displayNatives or script.name == client.currentScript or not script.isNative  if typeof script == "object" and script.name
  @print scripts.join("\n")
  @resume()

Interface::cont = ->
  return  unless @requireConnection()
  @pause()
  self = this
  @client.reqContinue (err) ->
    self.error err  if err
    self.resume()

Interface.stepGenerator = (type, count) ->
  ->
    return  unless @requireConnection()
    self = this
    self.pause()
    self.client.step type, count, (err, res) ->
      self.error err  if err
      self.resume()

Interface::next = Interface.stepGenerator("next", 1)
Interface::step = Interface.stepGenerator("in", 1)
Interface::out = Interface.stepGenerator("out", 1)
Interface::watch = (expr) ->
  @_watchers.push expr

Interface::unwatch = (expr) ->
  index = @_watchers.indexOf(expr)
  @_watchers.splice (if index != -1 then index else +expr), 1

Interface::watchers = ->
  wait = ->
    if --waiting == 0
      self.print "Watchers:"  if verbose
      self._watchers.forEach (watcher, i) ->
        self.print leftPad(i, " ") + ": " + watcher + " = " + JSON.stringify(values[i])
      
      self.print ""  if verbose
      self.resume()
      callback null
  self = this
  verbose = arguments[0] or false
  callback = arguments[1] or ->
  
  waiting = @_watchers.length
  values = []
  @pause()
  unless waiting
    @resume()
    return callback()
  @_watchers.forEach (watcher, i) ->
    self.debugEval watcher, null, null, (err, value) ->
      values[i] = (if err then "<error>" else value)
      wait()

Interface::setBreakpoint = (script, line, condition, silent) ->
  return  unless @requireConnection()
  self = this
  if script == undefined
    script = @client.currentScript
    line = @client.currentSourceLine + 1
  if line == undefined and typeof script == "number"
    line = script
    script = @client.currentScript
  if /\(\)$/.test(script)
    req = 
      type: "function"
      target: script.replace(/\(\)$/, "")
      condition: condition
  else
    if script != +script and not @client.scripts[script]
      scripts = @client.scripts
      Object.keys(scripts).forEach (id) ->
        if scripts[id] and scripts[id].name.indexOf(script) != -1
          ambiguous = true  if scriptId
          scriptId = id
    else
      scriptId = script
    return @error("Script : " + script + " not found")  unless scriptId
    return @error("Script name is ambiguous")  if ambiguous
    return @error("Line should be a positive value")  if line <= 0
    req = 
      type: "scriptId"
      target: scriptId
      line: line - 1
      condition: condition
  self.pause()
  self.client.setBreakpoint req, (err, res) ->
    if err
      self.error err  unless silent
    else
      self.list 5  unless silent
      unless scriptId
        scriptId = res.script_id
        line = res.line
      if scriptId
        self.client.breakpoints.push 
          id: res.breakpoint
          scriptId: scriptId
          script: (self.client.scripts[scriptId] or {}).name
          line: line
          condition: condition
    self.resume()

Interface::clearBreakpoint = (script, line) ->
  return  unless @requireConnection()
  
  @client.breakpoints.some (bp, i) ->
    if bp.scriptId == script or bp.script.indexOf(script) != -1
      ambiguous = true  if index != undefined
      if bp.line == line
        index = i
        breakpoint = bp.id
        true
  
  return @error("Script name is ambiguous")  if ambiguous
  return @error("Script : " + script + " not found")  if breakpoint == undefined
  self = this
  req = breakpoint: breakpoint
  self.pause()
  self.client.clearBreakpoint req, (err, res) ->
    if err
      self.error err
    else
      self.client.breakpoints.splice index, 1
      self.list 5
    self.resume()

Interface::breakpoints = ->
  return  unless @requireConnection()
  @pause()
  self = this
  @client.listbreakpoints (err, res) ->
    if err
      self.error err
    else
      self.print res
      self.resume()

Interface::pause_ = ->
  return  unless @requireConnection()
  self = this
  cmd = "process._debugPause();"
  @pause()
  @client.reqFrameEval cmd, NO_FRAME, (err, res) ->
    if err
      self.error err
    else
      self.resume()

Interface::kill = ->
  return  unless @child
  @killChild()

Interface::repl = ->
  return  unless @requireConnection()
  self = this
  self.print "Press Ctrl + C to leave debug repl"
  listeners = @repl.rli.listeners("SIGINT")
  @repl.rli.removeAllListeners "SIGINT"
  @repl.rli.once "SIGINT", ->
    process.nextTick ->
      listeners.forEach (listener) ->
        self.repl.rli.on_ "SIGINT", listener
    
    self.exitRepl()
  
  @repl.eval = @debugEval.bind(this)
  @repl.context = {}
  @history.control = @repl.rli.history
  @repl.rli.history = @history.debug
  @repl.prompt = "> "
  @repl.rli.setPrompt "> "
  @repl.displayPrompt()

Interface::exitRepl = ->
  @repl.eval = @controlEval.bind(this)
  @history.debug = @repl.rli.history
  @repl.rli.history = @history.control
  @repl.context = @context
  @repl.prompt = "debug> "
  @repl.rli.setPrompt "debug> "
  @repl.displayPrompt()

Interface::quit = ->
  @killChild()
  process.exit 0

Interface::killChild = ->
  if @child
    @child.kill()
    @child = null
  if @client
    @breakpoints = @client.breakpoints
    @client.destroy()
    @client = null

Interface::trySpawn = (cb) ->
  connectError = ->
    client.removeListener "error", connectError  if connectionAttempts >= 10
    setTimeout attemptConnect, 500
  attemptConnect = ->
    ++connectionAttempts
    self.stdout.write "."
    client.connect port, host
  self = this
  breakpoints = @breakpoints or []
  port = exports.port
  host = "localhost"
  @killChild()
  if @args.length == 2
    match = @args[1].match(/^([^:]+):(\d+)$/)
    if match
      host = match[1]
      port = parseInt(match[2], 10)
      @child = kill: ->
  else if @args.length == 3
    if @args[1] == "-p" and /^\d+$/.test(@args[2])
      @child = kill: ->
      
      process._debugProcess parseInt(@args[2], 10)
  unless @child
    @child = spawn(process.execPath, @args)
    @child.stdout.on_ "data", @childPrint.bind(this)
    @child.stderr.on_ "data", @childPrint.bind(this)
  @pause()
  client = self.client = new Client()
  connectionAttempts = 0
  client.once "ready", ->
    self.stdout.write " ok\n"
    breakpoints.forEach (bp) ->
      self.setBreakpoint bp.scriptId, bp.line, bp.condition, true
    
    client.reqSetExceptionBreak "all", (err, res) ->
      cb and cb()
      self.resume()
    
    client.on_ "close", ->
      self.pause()
      self.print "program terminated"
      self.resume()
      self.client = null
      self.killChild()
  
  client.on_ "unhandledResponse", (res) ->
    self.pause()
    self.print "\nunhandled res:" + JSON.stringify(res)
    self.resume()
  
  client.on_ "break", (res) ->
    self.handleBreak res.body
  
  client.on_ "exception", (res) ->
    self.handleBreak res.body
  
  client.on_ "error", connectError
  setTimeout (->
    self.print "connecting..", true
    attemptConnect()
  ), 50
