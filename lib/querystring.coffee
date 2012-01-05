hasOwnProperty = (obj, prop) ->
  Object::hasOwnProperty.call obj, prop
charCode = (c) ->
  c.charCodeAt 0
QueryString = exports
urlDecode = process.binding("http_parser").urlDecode
QueryString.unescapeBuffer = (s, decodeSpaces) ->
  out = new Buffer(s.length)
  state = "CHAR"
  
  inIndex = 0
  outIndex = 0
  
  while inIndex <= s.length
    c = s.charCodeAt(inIndex)
    switch state
      when "CHAR"
        switch c
          when charCode("%")
            n = 0
            m = 0
            state = "HEX0"
          when charCode("+")
            c = charCode(" ")  if decodeSpaces
          else
            out[outIndex++] = c
      when "HEX0"
        state = "HEX1"
        hexchar = c
        if charCode("0") <= c and c <= charCode("9")
          n = c - charCode("0")
        else if charCode("a") <= c and c <= charCode("f")
          n = c - charCode("a") + 10
        else if charCode("A") <= c and c <= charCode("F")
          n = c - charCode("A") + 10
        else
          out[outIndex++] = charCode("%")
          out[outIndex++] = c
          state = "CHAR"
          break
      when "HEX1"
        state = "CHAR"
        if charCode("0") <= c and c <= charCode("9")
          m = c - charCode("0")
        else if charCode("a") <= c and c <= charCode("f")
          m = c - charCode("a") + 10
        else if charCode("A") <= c and c <= charCode("F")
          m = c - charCode("A") + 10
        else
          out[outIndex++] = charCode("%")
          out[outIndex++] = hexchar
          out[outIndex++] = c
          break
        out[outIndex++] = 16 * n + m
    inIndex++
  out.slice 0, outIndex - 1

QueryString.unescape = (s, decodeSpaces) ->
  QueryString.unescapeBuffer(s, decodeSpaces).toString()

QueryString.escape = (str) ->
  encodeURIComponent str

stringifyPrimitive = (v) ->
  switch typeof v
    when "string"
      v
    when "boolean"
      (if v then "true" else "false")
    when "number"
      (if isFinite(v) then v else "")
    else
      ""

QueryString.stringify = QueryString.encode = (obj, sep, eq, name) ->
  sep = sep or "&"
  eq = eq or "="
  obj = (if (obj == null) then undefined else obj)
  switch typeof obj
    when "object"
      Object.keys(obj).map((k) ->
        if Array.isArray(obj[k])
          obj[k].map((v) ->
            QueryString.escape(stringifyPrimitive(k)) + eq + QueryString.escape(stringifyPrimitive(v))
          ).join sep
        else
          QueryString.escape(stringifyPrimitive(k)) + eq + QueryString.escape(stringifyPrimitive(obj[k]))
      ).join sep
    else
      return ""  unless name
      QueryString.escape(stringifyPrimitive(name)) + eq + QueryString.escape(stringifyPrimitive(obj))

QueryString.parse = QueryString.decode = (qs, sep, eq) ->
  sep = sep or "&"
  eq = eq or "="
  obj = {}
  return obj  if typeof qs != "string" or qs.length == 0
  qs.split(sep).forEach (kvp) ->
    x = kvp.split(eq)
    k = QueryString.unescape(x[0], true)
    v = QueryString.unescape(x.slice(1).join(eq), true)
    unless hasOwnProperty(obj, k)
      obj[k] = v
    else unless Array.isArray(obj[k])
      obj[k] = [ obj[k], v ]
    else
      obj[k].push v
  
  obj
