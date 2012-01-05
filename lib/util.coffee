inspect = (obj, showHidden, depth, colors) ->
  ctx = 
    showHidden: showHidden
    seen: []
    stylize: (if colors then stylizeWithColor else stylizeNoColor)
  
  formatValue ctx, obj, (if typeof depth == "undefined" then 2 else depth)
stylizeWithColor = (str, styleType) ->
  style = styles[styleType]
  if style
    "\u001b[" + colors[style][0] + "m" + str + "\u001b[" + colors[style][1] + "m"
  else
    str
stylizeNoColor = (str, styleType) ->
  str
formatValue = (ctx, value, recurseTimes) ->
  return value.inspect(recurseTimes)  if value and typeof value.inspect == "function" and value.inspect != exports.inspect and not (value.constructor and value.constructor:: == value)
  primitive = formatPrimitive(ctx, value)
  return primitive  if primitive
  visibleKeys = Object.keys(value)
  keys = (if ctx.showHidden then Object.getOwnPropertyNames(value) else visibleKeys)
  if keys.length == 0
    if typeof value == "function"
      name = (if value.name then ": " + value.name else "")
      return ctx.stylize("[Function" + name + "]", "special")
    return ctx.stylize(RegExp::toString.call(value), "regexp")  if isRegExp(value)
    return ctx.stylize(Date::toString.call(value), "date")  if isDate(value)
    return formatError(value)  if isError(value)
  base = ""
  array = false
  braces = [ "{", "}" ]
  if isArray(value)
    array = true
    braces = [ "[", "]" ]
  if typeof value == "function"
    n = (if value.name then ": " + value.name else "")
    base = " [Function" + n + "]"
  base = " " + RegExp::toString.call(value)  if isRegExp(value)
  base = " " + Date::toUTCString.call(value)  if isDate(value)
  base = " " + formatError(value)  if isError(value)
  return braces[0] + base + braces[1]  if keys.length == 0 and (not array or value.length == 0)
  if recurseTimes < 0
    if isRegExp(value)
      return ctx.stylize(RegExp::toString.call(value), "regexp")
    else
      return ctx.stylize("[Object]", "special")
  ctx.seen.push value
  
  if array
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys)
  else
    output = keys.map((key) ->
      formatProperty ctx, value, recurseTimes, visibleKeys, key, array
    )
  ctx.seen.pop()
  reduceToSingleString output, base, braces
formatPrimitive = (ctx, value) ->
  switch typeof value
    when "undefined"
      return ctx.stylize("undefined", "undefined")
    when "string"
      simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, "\"") + "'"
      return ctx.stylize(simple, "string")
    when "number"
      return ctx.stylize("" + value, "number")
    when "boolean"
      return ctx.stylize("" + value, "boolean")
  ctx.stylize "null", "null"  if value == null
formatError = (value) ->
  "[" + Error::toString.call(value) + "]"
formatArray = (ctx, value, recurseTimes, visibleKeys, keys) ->
  output = []
  i = 0
  l = value.length
  
  while i < l
    if Object::hasOwnProperty.call(value, String(i))
      output.push formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true)
    else
      output.push ""
    ++i
  keys.forEach (key) ->
    output.push formatProperty(ctx, value, recurseTimes, visibleKeys, key, true)  unless key.match(/^\d+$/)
  
  output
formatProperty = (ctx, value, recurseTimes, visibleKeys, key, array) ->
  if value.__lookupGetter__
    if value.__lookupGetter__(key)
      if value.__lookupSetter__(key)
        str = ctx.stylize("[Getter/Setter]", "special")
      else
        str = ctx.stylize("[Getter]", "special")
    else
      str = ctx.stylize("[Setter]", "special")  if value.__lookupSetter__(key)
  name = "[" + key + "]"  if visibleKeys.indexOf(key) < 0
  unless str
    if ctx.seen.indexOf(value[key]) < 0
      if recurseTimes == null
        str = formatValue(ctx, value[key], null)
      else
        str = formatValue(ctx, value[key], recurseTimes - 1)
      if str.indexOf("\n") > -1
        if array
          str = str.split("\n").map((line) ->
            "  " + line
          ).join("\n").substr(2)
        else
          str = "\n" + str.split("\n").map((line) ->
            "   " + line
          ).join("\n")
    else
      str = ctx.stylize("[Circular]", "special")
  if typeof name == "undefined"
    return str  if array and key.match(/^\d+$/)
    name = JSON.stringify("" + key)
    if name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)
      name = name.substr(1, name.length - 2)
      name = ctx.stylize(name, "name")
    else
      name = name.replace(/'/g, "\\'").replace(/\\"/g, "\"").replace(/(^"|"$)/g, "'")
      name = ctx.stylize(name, "string")
  name + ": " + str
reduceToSingleString = (output, base, braces) ->
  numLinesEst = 0
  length = output.reduce((prev, cur) ->
    numLinesEst++
    numLinesEst++  if cur.indexOf("\n") >= 0
    prev + cur.length + 1
  , 0)
  return braces[0] + (if base == "" then "" else base + "\n ") + " " + output.join(",\n  ") + " " + braces[1]  if length > 60
  braces[0] + base + " " + output.join(", ") + " " + braces[1]
isArray = (ar) ->
  Array.isArray(ar) or (typeof ar == "object" and objectToString(ar) == "[object Array]")
isRegExp = (re) ->
  typeof re == "object" and objectToString(re) == "[object RegExp]"
isDate = (d) ->
  typeof d == "object" and objectToString(d) == "[object Date]"
isError = (e) ->
  typeof e == "object" and objectToString(e) == "[object Error]"
objectToString = (o) ->
  Object::toString.call o
pad = (n) ->
  (if n < 10 then "0" + n.toString(10) else n.toString(10))
timestamp = ->
  d = new Date()
  time = [ pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()) ].join(":")
  [ d.getDate(), months[d.getMonth()], time ].join " "
formatRegExp = /%[sdj%]/g
exports.format = (f) ->
  if typeof f != "string"
    objects = []
    i = 0
    
    while i < arguments.length
      objects.push inspect(arguments[i])
      i++
    return objects.join(" ")
  i = 1
  args = arguments
  len = args.length
  str = String(f).replace(formatRegExp, (x) ->
    return x  if i >= len
    switch x
      when "%s"
        String args[i++]
      when "%d"
        Number args[i++]
      when "%j"
        JSON.stringify args[i++]
      when "%%"
        "%"
      else
        x
  )
  x = args[i]
  
  while i < len
    if x == null or typeof x != "object"
      str += " " + x
    else
      str += " " + inspect(x)
    x = args[++i]
  str

exports.print = ->
  i = 0
  len = arguments.length
  
  while i < len
    process.stdout.write String(arguments[i])
    ++i

exports.puts = ->
  i = 0
  len = arguments.length
  
  while i < len
    process.stdout.write arguments[i] + "\n"
    ++i

exports.debug = (x) ->
  process.stderr.write "DEBUG: " + x + "\n"

error = exports.error = (x) ->
  i = 0
  len = arguments.length
  
  while i < len
    process.stderr.write arguments[i] + "\n"
    ++i

exports.inspect = inspect
colors = 
  bold: [ 1, 22 ]
  italic: [ 3, 23 ]
  underline: [ 4, 24 ]
  inverse: [ 7, 27 ]
  white: [ 37, 39 ]
  grey: [ 90, 39 ]
  black: [ 30, 39 ]
  blue: [ 34, 39 ]
  cyan: [ 36, 39 ]
  green: [ 32, 39 ]
  magenta: [ 35, 39 ]
  red: [ 31, 39 ]
  yellow: [ 33, 39 ]

styles = 
  special: "cyan"
  number: "yellow"
  boolean: "yellow"
  undefined: "grey"
  null: "bold"
  string: "green"
  date: "magenta"
  regexp: "red"

exports.isArray = isArray
exports.isRegExp = isRegExp
exports.isDate = isDate
exports.isError = isError

exports.p = ->
  unless pWarning
    pWarning = "util.p will be removed in future versions of Node. " + "Use util.puts(util.inspect()) instead.\n"
    exports.error pWarning
  i = 0
  len = arguments.length
  
  while i < len
    error exports.inspect(arguments[i])
    ++i

months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
exports.log = (msg) ->
  exports.puts timestamp() + " - " + msg.toString()


exports.exec = ->
  unless execWarning
    execWarning = "util.exec has moved to the \"child_process\" module." + " Please update your source code."
    error execWarning
  require("child_process").exec.apply this, arguments

exports.pump = (readStream, writeStream, callback) ->
  call = (a, b, c) ->
    if callback and not callbackCalled
      callback a, b, c
      callbackCalled = true
  callbackCalled = false
  readStream.addListener "data", (chunk) ->
    readStream.pause()  if writeStream.write(chunk) == false
  
  writeStream.addListener "drain", ->
    readStream.resume()
  
  readStream.addListener "end", ->
    writeStream.end()
  
  readStream.addListener "close", ->
    call()
  
  readStream.addListener "error", (err) ->
    writeStream.end()
    call err
  
  writeStream.addListener "error", (err) ->
    readStream.destroy()
    call err

exports.inherits = (ctor, superCtor) ->
  ctor.super_ = superCtor
  ctor:: = Object.create(superCtor::, constructor: 
    value: ctor
    enumerable: false
    writable: true
    configurable: true
  )


exports._deprecationWarning = (moduleId, message) ->
  unless deprecationWarnings
    deprecationWarnings = {}
  else return  if message of deprecationWarnings
  deprecationWarnings[message] = true
  if (new RegExp("\\b" + moduleId + "\\b")).test(process.env.NODE_DEBUG)
    console.trace message
  else
    console.error message
