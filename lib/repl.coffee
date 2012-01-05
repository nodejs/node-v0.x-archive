hasOwnProperty = (obj, prop) ->
  Object::hasOwnProperty.call obj, prop
REPLServer = (prompt, stream, eval, useGlobal, ignoreUndefined) ->
  complete = (text, callback) ->
    self.complete text, callback
  self = this
  self.useGlobal = useGlobal
  self.eval = eval or (code, context, file, cb) ->
    try
      if useGlobal
        result = vm.runInThisContext(code, file)
      else
        result = vm.runInContext(code, context, file)
    catch e
      err = e
    cb err, result
  
  self.resetContext()
  self.bufferedCommand = ""
  if stream
    if stream.stdin or stream.stdout
      self.outputStream = stream.stdout
      self.inputStream = stream.stdin
    else
      self.outputStream = stream
      self.inputStream = stream
  else
    self.outputStream = process.stdout
    self.inputStream = process.stdin
    process.stdin.resume()
  self.prompt = (if prompt != undefined then prompt else "> ")
  rli = rl.createInterface(self.inputStream, self.outputStream, complete)
  self.rli = rli
  @commands = {}
  defineDefaultCommands this
  if rli.enabled and not exports.disableColors and exports.writer == util.inspect
    exports.writer = (obj, showHidden, depth) ->
      util.inspect obj, showHidden, depth, true
  rli.setPrompt self.prompt
  sawSIGINT = false
  rli.on_ "SIGINT", ->
    if sawSIGINT
      rli.close()
      process.exit()
    rli.line = ""
    if not (self.bufferedCommand and self.bufferedCommand.length > 0) and rli.line.length == 0
      rli.output.write "\n(^C again to quit)\n"
      sawSIGINT = true
    else
      rli.output.write "\n"
    self.bufferedCommand = ""
    self.displayPrompt()
  
  rli.addListener "line", (cmd) ->
    isSyntaxError = (e) ->
      e = e and (e.stack or e.toString())
      e and e.match(/^SyntaxError/) and not (e.match(/^SyntaxError: Unexpected token .*\n/) and e.match(/\n    at Object.parse \(native\)\n/))
    finish = (e, ret) ->
      self.memory cmd
      if isSyntaxError(e)
        self.bufferedCommand += cmd + "\n"
        self.displayPrompt()
        return
      else self.outputStream.write (e.stack or e) + "\n"  if e
      self.bufferedCommand = ""
      if not e and (not ignoreUndefined or ret != undefined)
        self.context._ = ret
        self.outputStream.write exports.writer(ret) + "\n"
      self.displayPrompt()
    sawSIGINT = false
    skipCatchall = false
    cmd = trimWhitespace(cmd)
    if cmd and cmd.charAt(0) == "."
      matches = cmd.match(/^(\.[^\s]+)\s*(.*)$/)
      keyword = matches and matches[1]
      rest = matches and matches[2]
      if self.parseREPLKeyword(keyword, rest) == true
        return
      else
        self.outputStream.write "Invalid REPL keyword\n"
        skipCatchall = true
    unless skipCatchall
      evalCmd = self.bufferedCommand + cmd + "\n"
      self.eval "(" + evalCmd + ")", self.context, "repl", (e, ret) ->
        return finish(e)  if e and not isSyntaxError(e)
        if typeof ret == "function" or e
          self.eval evalCmd, self.context, "repl", finish
        else
          finish null, ret
    else
      finish null
  
  rli.addListener "close", ->
    self.inputStream.destroy()
  
  self.displayPrompt()
ArrayStream = ->
  @run = (data) ->
    self = this
    data.forEach (line) ->
      self.emit "data", line
defineDefaultCommands = (repl) ->
  repl.defineCommand "break", 
    help: "Sometimes you get stuck, this gets you out"
    action: ->
      @bufferedCommand = ""
      @displayPrompt()
  
  repl.defineCommand "clear", 
    help: "Break, and also clear the local context"
    action: ->
      @outputStream.write "Clearing context...\n"
      @bufferedCommand = ""
      @resetContext true
      @displayPrompt()
  
  repl.defineCommand "exit", 
    help: "Exit the repl"
    action: ->
      @rli.close()
  
  repl.defineCommand "help", 
    help: "Show repl options"
    action: ->
      self = this
      Object.keys(@commands).sort().forEach (name) ->
        cmd = self.commands[name]
        self.outputStream.write name + "\t" + (cmd.help or "") + "\n"
      
      @displayPrompt()
  
  repl.defineCommand "save", 
    help: "Save all evaluated commands in this REPL session to a file"
    action: (file) ->
      try
        fs.writeFileSync file, @lines.join("\n") + "\n"
        @outputStream.write "Session saved to:" + file + "\n"
      catch e
        @outputStream.write "Failed to save:" + file + "\n"
      @displayPrompt()
  
  repl.defineCommand "load", 
    help: "Load JS from a file into the REPL session"
    action: (file) ->
      try
        stats = fs.statSync(file)
        if stats and stats.isFile()
          self = this
          data = fs.readFileSync(file, "utf8")
          lines = data.split("\n")
          @displayPrompt()
          lines.forEach (line) ->
            self.rli.write line + "\n"  if line
      catch e
        @outputStream.write "Failed to load:" + file + "\n"
      @displayPrompt()
trimWhitespace = (cmd) ->
  trimmer = /^\s*(.+)\s*$/m
  matches = trimmer.exec(cmd)
  matches[1]  if matches and matches.length == 2
regexpEscape = (s) ->
  s.replace /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"
util = require("util")
vm = require("vm")
path = require("path")
fs = require("fs")
rl = require("readline")

exports.disableColors = (if process.env.NODE_DISABLE_COLORS then true else false)
module.filename = process.cwd() + "/repl"
module.paths = require("module")._nodeModulePaths(module.filename)
exports.writer = util.inspect
exports.REPLServer = REPLServer
exports.start = (prompt, source, eval, useGlobal) ->
  repl = new REPLServer(prompt, source, eval, useGlobal)
  exports.repl = repl  unless exports.repl
  repl

REPLServer::createContext = ->
  unless @useGlobal
    context = vm.createContext()
    for i of global
      context[i] = global[i]
  else
    context = global
  context.module = module
  context.require = require
  context.global = context
  context.global.global = context
  @lines = []
  @lines.level = []
  context

REPLServer::resetContext = (force) ->
  if not context or force
    context = @createContext()
    for i of require.cache
      delete require.cache[i]
  @context = context

REPLServer::displayPrompt = (preserveCursor) ->
  @rli.setPrompt (if @bufferedCommand.length then "..." + new Array(@lines.level.length).join("..") + " " else @prompt)
  @rli.prompt preserveCursor

REPLServer::readline = (cmd) ->

util.inherits ArrayStream, require("stream").Stream
ArrayStream::readable = true
ArrayStream::writable = true
ArrayStream::resume = ->

ArrayStream::write = ->

requireRE = /\brequire\s*\(['"](([\w\.\/-]+\/)?([\w\.\/-]*))/
simpleExpressionRE = /(([a-zA-Z_$](?:\w|\$)*)\.)*([a-zA-Z_$](?:\w|\$)*)\.?$/
REPLServer::complete = (line, callback) ->
  completionGroupsLoaded = (err) ->
    throw err  if err
    if completionGroups.length and filter
      newCompletionGroups = []
      i = 0
      while i < completionGroups.length
        group = completionGroups[i].filter((elem) ->
          elem.indexOf(filter) == 0
        )
        newCompletionGroups.push group  if group.length
        i++
      completionGroups = newCompletionGroups
    if completionGroups.length
      uniq = {}
      completions = []
      i = completionGroups.length - 1
      while i >= 0
        group = completionGroups[i]
        group.sort()
        j = 0
        
        while j < group.length
          c = group[j]
          unless hasOwnProperty(c)
            completions.push c
            uniq[c] = true
          j++
        completions.push ""
        i--
      while completions.length and completions[completions.length - 1] == ""
        completions.pop()
    callback null, [ completions or [], completeOn ]
  if @bufferedCommand != undefined and @bufferedCommand.length
    tmp = @lines.slice()
    @lines.level.forEach (kill) ->
      tmp[kill.line] = ""  if kill.isFunction
    
    flat = new ArrayStream()
    magic = new REPLServer("", flat)
    magic.context = magic.createContext()
    flat.run tmp
    return magic.complete(line, callback)  unless magic.bufferedCommand
  
  completionGroups = []
  
  match = null
  match = line.match(/^\s*(\.\w*)$/)
  if match
    completionGroups.push Object.keys(@commands)
    completeOn = match[1]
    filter = match[1]  if match[1].length > 1
    completionGroupsLoaded()
  else if match = line.match(requireRE)
    exts = [ ".js", ".node" ]
    indexRe = new RegExp("^index(" + exts.map(regexpEscape).join("|") + ")$")
    completeOn = match[1]
    subdir = match[2] or ""
    filter = match[1]
    
    group = []
    paths = module.paths.concat(require("module").globalPaths)
    i = 0
    while i < paths.length
      dir = path.resolve(paths[i], subdir)
      try
        files = fs.readdirSync(dir)
      catch e
        continue
      f = 0
      while f < files.length
        name = files[f]
        ext = path.extname(name)
        base = name.slice(0, -ext.length)
        continue  if base.match(/-\d+\.\d+(\.\d+)?/) or name == ".npm"
        if exts.indexOf(ext) != -1
          group.push subdir + base  if not subdir or base != "index"
        else
          abs = path.resolve(dir, name)
          try
            if fs.statSync(abs).isDirectory()
              group.push subdir + name + "/"
              subfiles = fs.readdirSync(abs)
              s = 0
              while s < subfiles.length
                group.push subdir + name  if indexRe.test(subfiles[s])
                s++
        f++
      i++
    completionGroups.push group  if group.length
    unless subdir
      builtinLibs = [ "assert", "buffer", "child_process", "crypto", "dgram", "dns", "events", "file", "freelist", "fs", "http", "net", "os", "path", "querystring", "readline", "repl", "string_decoder", "util", "tcp", "url" ]
      completionGroups.push builtinLibs
    completionGroupsLoaded()
  else if line.length == 0 or line[line.length - 1].match(/\w|\.|\$/)
    match = simpleExpressionRE.exec(line)
    if line.length == 0 or match
      completeOn = (if match then match[0] else "")
      if line.length == 0
        filter = ""
        expr = ""
      else if line[line.length - 1] == "."
        filter = ""
        expr = match[0].slice(0, match[0].length - 1)
      else
        bits = match[0].split(".")
        filter = bits.pop()
        expr = bits.join(".")
      memberGroups = []
      unless expr
        addStandardGlobals = ->
          completionGroups.push [ "NaN", "Infinity", "undefined", "eval", "parseInt", "parseFloat", "isNaN", "isFinite", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "Object", "Function", "Array", "String", "Boolean", "Number", "Date", "RegExp", "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError", "Math", "JSON" ]
          completionGroups.push [ "break", "case", "catch", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "let", "new", "null", "return", "switch", "this", "throw", "true", "try", "typeof", "undefined", "var", "void", "while", "with", "yield" ]  if filter
        if @useGlobal or @context.constructor and @context.constructor.name == "Context"
          completionGroups.push Object.getOwnPropertyNames(@context)
          addStandardGlobals()
          completionGroupsLoaded()
        else
          @eval ".scope", @context, "repl", (err, globals) ->
            if err or not globals
              addStandardGlobals()
            else if Array.isArray(globals[0])
              globals.forEach (group) ->
                completionGroups.push group
            else
              completionGroups.push globals
              addStandardGlobals()
            completionGroupsLoaded()
      else
        @eval expr, @context, "repl", (e, obj) ->
          if obj?
            memberGroups.push Object.getOwnPropertyNames(obj)  if typeof obj == "object" or typeof obj == "function"
            try
              p = Object.getPrototypeOf(obj)
              sentinel = 5
              while p != null
                memberGroups.push Object.getOwnPropertyNames(p)
                p = Object.getPrototypeOf(p)
                sentinel--
                break  if sentinel <= 0
          if memberGroups.length
            i = 0
            while i < memberGroups.length
              completionGroups.push memberGroups[i].map((member) ->
                expr + "." + member
              )
              i++
            filter = expr + "." + filter  if filter
          completionGroupsLoaded()
    else
      completionGroupsLoaded()

REPLServer::parseREPLKeyword = (keyword, rest) ->
  cmd = @commands[keyword]
  if cmd
    cmd.action.call this, rest
    return true
  false

REPLServer::defineCommand = (keyword, cmd) ->
  if typeof cmd == "function"
    cmd = action: cmd
  else throw new Error("bad argument, action must be a function")  if typeof cmd.action != "function"
  @commands["." + keyword] = cmd

REPLServer::memory = memory = (cmd) ->
  self = this
  self.lines = self.lines or []
  self.lines.level = self.lines.level or []
  if cmd
    self.lines.push new Array(self.lines.level.length).join("  ") + cmd
  else
    self.lines.push ""
  if cmd
    dw = cmd.match(/{|\(/g)
    up = cmd.match(/}|\)/g)
    up = (if up then up.length else 0)
    dw = (if dw then dw.length else 0)
    depth = dw - up
    if depth
      (workIt = ->
        if depth > 0
          self.lines.level.push 
            line: self.lines.length - 1
            depth: depth
            isFunction: /\s*function\s*/.test(cmd)
        else if depth < 0
          curr = self.lines.level.pop()
          if curr
            tmp = curr.depth + depth
            if tmp < 0
              depth += curr.depth
              workIt()
            else if tmp > 0
              curr.depth += depth
              self.lines.level.push curr
      )()
  else
    self.lines.level = []

REPLServer::convertToContext = (cmd) ->
  self = this
  scopeVar = /^\s*var\s*([_\w\$]+)(.*)$/m
  scopeFunc = /^\s*function\s*([_\w\$]+)/
  matches = scopeVar.exec(cmd)
  return "self.context." + matches[1] + matches[2]  if matches and matches.length == 3
  matches = scopeFunc.exec(self.bufferedCommand)
  return matches[1] + " = " + self.bufferedCommand  if matches and matches.length == 2
  cmd
