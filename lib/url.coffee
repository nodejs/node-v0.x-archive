urlParse = (url, parseQueryString, slashesDenoteHost) ->
  return url  if url and typeof (url) == "object" and url.href
  throw new TypeError("Parameter 'url' must be a string, not " + typeof url)  if typeof url != "string"
  out = {}
  rest = url
  i = 0
  l = rest.length
  
  while i < l
    break  if delims.indexOf(rest.charAt(i)) == -1
    i++
  rest = rest.substr(i)  if i != 0
  proto = protocolPattern.exec(rest)
  if proto
    proto = proto[0]
    lowerProto = proto.toLowerCase()
    out.protocol = lowerProto
    rest = rest.substr(proto.length)
  if slashesDenoteHost or proto or rest.match(/^\/\/[^@\/]+@[^@\/]+/)
    slashes = rest.substr(0, 2) == "//"
    if slashes and not (proto and hostlessProtocol[proto])
      rest = rest.substr(2)
      out.slashes = true
  if not hostlessProtocol[proto] and (slashes or (proto and not slashedProtocol[proto]))
    atSign = rest.indexOf("@")
    if atSign != -1
      hasAuth = true
      i = 0
      l = nonAuthChars.length
      
      while i < l
        index = rest.indexOf(nonAuthChars[i])
        if index != -1 and index < atSign
          hasAuth = false
          break
        i++
      if hasAuth
        out.auth = rest.substr(0, atSign)
        rest = rest.substr(atSign + 1)
    firstNonHost = -1
    i = 0
    l = nonHostChars.length
    
    while i < l
      index = rest.indexOf(nonHostChars[i])
      firstNonHost = index  if index != -1 and (firstNonHost < 0 or index < firstNonHost)
      i++
    if firstNonHost != -1
      out.host = rest.substr(0, firstNonHost)
      rest = rest.substr(firstNonHost)
    else
      out.host = rest
      rest = ""
    p = parseHost(out.host)
    keys = Object.keys(p)
    i = 0
    l = keys.length
    
    while i < l
      key = keys[i]
      out[key] = p[key]
      i++
    out.hostname = out.hostname or ""
    if out.hostname.length > hostnameMaxLen
      out.hostname = ""
    else
      hostparts = out.hostname.split(/\./)
      i = 0
      l = hostparts.length
      
      while i < l
        part = hostparts[i]
        continue  unless part
        unless part.match(hostnamePartPattern)
          newpart = ""
          j = 0
          k = part.length
          
          while j < k
            if part.charCodeAt(j) > 127
              newpart += "x"
            else
              newpart += part[j]
            j++
          unless newpart.match(hostnamePartPattern)
            validParts = hostparts.slice(0, i)
            notHost = hostparts.slice(i + 1)
            bit = part.match(hostnamePartStart)
            if bit
              validParts.push bit[1]
              notHost.unshift bit[2]
            rest = "/" + notHost.join(".") + rest  if notHost.length
            out.hostname = validParts.join(".")
            break
        i++
    out.hostname = out.hostname.toLowerCase()
    domainArray = out.hostname.split(".")
    newOut = []
    i = 0
    
    while i < domainArray.length
      s = domainArray[i]
      newOut.push (if s.match(/[^A-Za-z0-9_-]/) then "xn--" + punycode.encode(s) else s)
      ++i
    out.hostname = newOut.join(".")
    out.host = (out.hostname or "") + (if (out.port) then ":" + out.port else "")
    out.href += out.host
  unless unsafeProtocol[lowerProto]
    i = 0
    l = autoEscape.length
    
    while i < l
      ae = autoEscape[i]
      esc = encodeURIComponent(ae)
      esc = escape(ae)  if esc == ae
      rest = rest.split(ae).join(esc)
      i++
    chop = rest.length
    i = 0
    l = delims.length
    
    while i < l
      c = rest.indexOf(delims[i])
      chop = Math.min(c, chop)  if c != -1
      i++
    rest = rest.substr(0, chop)
  hash = rest.indexOf("#")
  if hash != -1
    out.hash = rest.substr(hash)
    rest = rest.slice(0, hash)
  qm = rest.indexOf("?")
  if qm != -1
    out.search = rest.substr(qm)
    out.query = rest.substr(qm + 1)
    out.query = querystring.parse(out.query)  if parseQueryString
    rest = rest.slice(0, qm)
  else if parseQueryString
    out.search = ""
    out.query = {}
  out.pathname = rest  if rest
  out.pathname = "/"  if slashedProtocol[proto] and out.hostname and not out.pathname
  out.path = (if out.pathname then out.pathname else "") + (if out.search then out.search else "")  if out.pathname or out.search
  out.href = urlFormat(out)
  out
urlFormat = (obj) ->
  obj = urlParse(obj)  if typeof (obj) == "string"
  auth = obj.auth or ""
  if auth
    auth = auth.split("@").join("%40")
    i = 0
    l = nonAuthChars.length
    
    while i < l
      nAC = nonAuthChars[i]
      auth = auth.split(nAC).join(encodeURIComponent(nAC))
      i++
    auth += "@"
  protocol = obj.protocol or ""
  host = (if (obj.host != undefined) then auth + obj.host else (if obj.hostname != undefined then (auth + obj.hostname + (if obj.port then ":" + obj.port else "")) else false))
  pathname = obj.pathname or ""
  query = obj.query and (if (typeof obj.query == "object" and Object.keys(obj.query).length) then querystring.stringify(obj.query) else "") or ""
  search = obj.search or (query and ("?" + query)) or ""
  hash = obj.hash or ""
  protocol += ":"  if protocol and protocol.substr(-1) != ":"
  if obj.slashes or (not protocol or slashedProtocol[protocol]) and host != false
    host = "//" + (host or "")
    pathname = "/" + pathname  if pathname and pathname.charAt(0) != "/"
  else host = ""  unless host
  hash = "#" + hash  if hash and hash.charAt(0) != "#"
  search = "?" + search  if search and search.charAt(0) != "?"
  protocol + host + pathname + search + hash
urlResolve = (source, relative) ->
  urlFormat urlResolveObject(source, relative)
urlResolveObject = (source, relative) ->
  return relative  unless source
  source = urlParse(urlFormat(source), false, true)
  relative = urlParse(urlFormat(relative), false, true)
  source.hash = relative.hash
  if relative.href == ""
    source.href = urlFormat(source)
    return source
  if relative.slashes and not relative.protocol
    relative.protocol = source.protocol
    relative.path = relative.pathname = "/"  if slashedProtocol[relative.protocol] and relative.hostname and not relative.pathname
    relative.href = urlFormat(relative)
    return relative
  if relative.protocol and relative.protocol != source.protocol
    unless slashedProtocol[relative.protocol]
      relative.href = urlFormat(relative)
      return relative
    source.protocol = relative.protocol
    if not relative.host and not hostlessProtocol[relative.protocol]
      relPath = (relative.pathname or "").split("/")
      while relPath.length and not (relative.host = relPath.shift())
        
      relative.host = ""  unless relative.host
      relative.hostname = ""  unless relative.hostname
      relPath.unshift ""  if relPath[0] != ""
      relPath.unshift ""  if relPath.length < 2
      relative.pathname = relPath.join("/")
    source.pathname = relative.pathname
    source.search = relative.search
    source.query = relative.query
    source.host = relative.host or ""
    source.auth = relative.auth
    source.hostname = relative.hostname or relative.host
    source.port = relative.port
    source.path = (if source.pathname then source.pathname else "") + (if source.search then source.search else "")  if source.pathname != undefined or source.search != undefined
    source.slashes = source.slashes or relative.slashes
    source.href = urlFormat(source)
    return source
  isSourceAbs = (source.pathname and source.pathname.charAt(0) == "/")
  isRelAbs = (relative.host != undefined or relative.pathname and relative.pathname.charAt(0) == "/")
  mustEndAbs = (isRelAbs or isSourceAbs or (source.host and relative.pathname))
  removeAllDots = mustEndAbs
  srcPath = source.pathname and source.pathname.split("/") or []
  relPath = relative.pathname and relative.pathname.split("/") or []
  psychotic = source.protocol and not slashedProtocol[source.protocol]
  if psychotic
    delete source.hostname
    
    delete source.port
    
    if source.host
      if srcPath[0] == ""
        srcPath[0] = source.host
      else
        srcPath.unshift source.host
    delete source.host
    
    if relative.protocol
      delete relative.hostname
      
      delete relative.port
      
      if relative.host
        if relPath[0] == ""
          relPath[0] = relative.host
        else
          relPath.unshift relative.host
      delete relative.host
    mustEndAbs = mustEndAbs and (relPath[0] == "" or srcPath[0] == "")
  if isRelAbs
    source.host = (if (relative.host or relative.host == "") then relative.host else source.host)
    source.hostname = (if (relative.hostname or relative.hostname == "") then relative.hostname else source.hostname)
    source.search = relative.search
    source.query = relative.query
    srcPath = relPath
  else if relPath.length
    srcPath = []  unless srcPath
    srcPath.pop()
    srcPath = srcPath.concat(relPath)
    source.search = relative.search
    source.query = relative.query
  else if "search" of relative
    if psychotic
      source.hostname = source.host = srcPath.shift()
      authInHost = (if source.host and source.host.indexOf("@") > 0 then source.host.split("@") else false)
      if authInHost
        source.auth = authInHost.shift()
        source.host = source.hostname = authInHost.shift()
    source.search = relative.search
    source.query = relative.query
    source.path = (if source.pathname then source.pathname else "") + (if source.search then source.search else "")  if source.pathname != undefined or source.search != undefined
    source.href = urlFormat(source)
    return source
  unless srcPath.length
    delete source.pathname
    
    unless source.search
      source.path = "/" + source.search
    else
      delete source.path
    source.href = urlFormat(source)
    return source
  last = srcPath.slice(-1)[0]
  hasTrailingSlash = ((source.host or relative.host) and (last == "." or last == "..") or last == "")
  up = 0
  i = srcPath.length
  
  while i >= 0
    last = srcPath[i]
    if last == "."
      srcPath.splice i, 1
    else if last == ".."
      srcPath.splice i, 1
      up++
    else if up
      srcPath.splice i, 1
      up--
    i--
  if not mustEndAbs and not removeAllDots
    while up--
      srcPath.unshift ".."
      up
  srcPath.unshift ""  if mustEndAbs and srcPath[0] != "" and (not srcPath[0] or srcPath[0].charAt(0) != "/")
  srcPath.push ""  if hasTrailingSlash and (srcPath.join("/").substr(-1) != "/")
  isAbsolute = srcPath[0] == "" or (srcPath[0] and srcPath[0].charAt(0) == "/")
  if psychotic
    source.hostname = source.host = (if isAbsolute then "" else (if srcPath.length then srcPath.shift() else ""))
    authInHost = (if source.host and source.host.indexOf("@") > 0 then source.host.split("@") else false)
    if authInHost
      source.auth = authInHost.shift()
      source.host = source.hostname = authInHost.shift()
  mustEndAbs = mustEndAbs or (source.host and srcPath.length)
  srcPath.unshift ""  if mustEndAbs and not isAbsolute
  source.pathname = srcPath.join("/")
  source.path = (if source.pathname then source.pathname else "") + (if source.search then source.search else "")  if source.pathname != undefined or source.search != undefined
  source.auth = relative.auth or source.auth
  source.slashes = source.slashes or relative.slashes
  source.href = urlFormat(source)
  source
parseHost = (host) ->
  out = {}
  port = portPattern.exec(host)
  if port
    port = port[0]
    out.port = port.substr(1)
    host = host.substr(0, host.length - port.length)
  out.hostname = host  if host
  out
punycode = require("punycode")
exports.parse = urlParse
exports.resolve = urlResolve
exports.resolveObject = urlResolveObject
exports.format = urlFormat
protocolPattern = /^([a-z0-9.+-]+:)/i
portPattern = /:[0-9]+$/
delims = [ "<", ">", "\"", "`", " ", "\r", "\n", "\t" ]
unwise = [ "{", "}", "|", "\\", "^", "~", "[", "]", "`" ].concat(delims)
autoEscape = [ "'" ]
nonHostChars = [ "%", "/", "?", ";", "#" ].concat(unwise).concat(autoEscape)
nonAuthChars = [ "/", "@", "?", "#" ].concat(delims)
hostnameMaxLen = 255
hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/
hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/
unsafeProtocol = 
  javascript: true
  "javascript:": true

hostlessProtocol = 
  javascript: true
  "javascript:": true

pathedProtocol = 
  http: true
  https: true
  ftp: true
  gopher: true
  file: true
  "http:": true
  "ftp:": true
  "gopher:": true
  "file:": true

slashedProtocol = 
  http: true
  https: true
  ftp: true
  gopher: true
  file: true
  "http:": true
  "https:": true
  "ftp:": true
  "gopher:": true
  "file:": true

querystring = require("querystring")
