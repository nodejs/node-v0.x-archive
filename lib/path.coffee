normalizeArray = (parts, allowAboveRoot) ->
  up = 0
  i = parts.length - 1
  
  while i >= 0
    last = parts[i]
    if last == "."
      parts.splice i, 1
    else if last == ".."
      parts.splice i, 1
      up++
    else if up
      parts.splice i, 1
      up--
    i--
  if allowAboveRoot
    while up--
      parts.unshift ".."
      up
  parts
isWindows = process.platform == "win32"
if isWindows
  splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?([\\\/])?([\s\S]*?)$/
  splitTailRe = /^([\s\S]+[\\\/](?!$)|[\\\/])?((?:[\s\S]+?)?(\.[^.]*)?)$/
  splitPath = (filename) ->
    result = splitDeviceRe.exec(filename)
    device = (result[1] or "") + (result[2] or "")
    tail = result[3] or ""
    result2 = splitTailRe.exec(tail)
    dir = result2[1] or ""
    basename = result2[2] or ""
    ext = result2[3] or ""
    [ device, dir, basename, ext ]
  
  exports.resolve = ->
    f = (p) ->
      not not p
    resolvedDevice = ""
    resolvedTail = ""
    resolvedAbsolute = false
    i = arguments.length - 1
    
    while i >= -1
      if i >= 0
        path = arguments[i]
      else unless resolvedDevice
        path = process.cwd()
      else
        path = process._cwdForDrive(resolvedDevice[0])
      continue  if typeof path != "string" or not path
      result = splitDeviceRe.exec(path)
      device = result[1] or ""
      isUnc = device and device.charAt(1) != ":"
      isAbsolute = not not result[2] or isUnc
      tail = result[3]
      continue  if device and resolvedDevice and device.toLowerCase() != resolvedDevice.toLowerCase()
      resolvedDevice = device  unless resolvedDevice
      unless resolvedAbsolute
        resolvedTail = tail + "\\" + resolvedTail
        resolvedAbsolute = isAbsolute
      break  if resolvedDevice and resolvedAbsolute
      i--
    resolvedDevice = resolvedDevice.replace(/\//g, "\\")
    resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/).filter(f), not resolvedAbsolute).join("\\")
    (resolvedDevice + (if resolvedAbsolute then "\\" else "") + resolvedTail) or "."
  
  exports.normalize = (path) ->
    result = splitDeviceRe.exec(path)
    device = result[1] or ""
    isUnc = device and device.charAt(1) != ":"
    isAbsolute = not not result[2] or isUnc
    tail = result[3]
    trailingSlash = /[\\\/]$/.test(tail)
    tail = normalizeArray(tail.split(/[\\\/]+/).filter((p) ->
      not not p
    ), not isAbsolute).join("\\")
    tail = "."  if not tail and not isAbsolute
    tail += "\\"  if tail and trailingSlash
    device + (if isAbsolute then "\\" else "") + tail
  
  exports.join = ->
    f = (p) ->
      p and typeof p == "string"
    paths = Array::slice.call(arguments, 0).filter(f)
    joined = paths.join("\\")
    joined = joined.slice(1)  if /^[\\\/]{2}/.test(joined) and not /^[\\\/]{2}/.test(paths[0])
    exports.normalize joined
  
  exports.relative = (from, to) ->
    trim = (arr) ->
      start = 0
      while start < arr.length
        break  if arr[start] != ""
        start++
      end = arr.length - 1
      while end >= 0
        break  if arr[end] != ""
        end--
      return []  if start > end
      arr.slice start, end - start + 1
    from = exports.resolve(from)
    to = exports.resolve(to)
    lowerFrom = from.toLowerCase()
    lowerTo = to.toLowerCase()
    toParts = trim(to.split("\\"))
    lowerFromParts = trim(lowerFrom.split("\\"))
    lowerToParts = trim(lowerTo.split("\\"))
    length = Math.min(lowerFromParts.length, lowerToParts.length)
    samePartsLength = length
    i = 0
    
    while i < length
      if lowerFromParts[i] != lowerToParts[i]
        samePartsLength = i
        break
      i++
    return to  if samePartsLength == 0
    outputParts = []
    i = samePartsLength
    
    while i < lowerFromParts.length
      outputParts.push ".."
      i++
    outputParts = outputParts.concat(toParts.slice(samePartsLength))
    outputParts.join "\\"
else
  splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:[\s\S]+?)?(\.[^.]*)?)$/
  splitPath = (filename) ->
    result = splitPathRe.exec(filename)
    [ result[1] or "", result[2] or "", result[3] or "", result[4] or "" ]
  
  exports.resolve = ->
    resolvedPath = ""
    resolvedAbsolute = false
    i = arguments.length - 1
    
    while i >= -1 and not resolvedAbsolute
      path = (if (i >= 0) then arguments[i] else process.cwd())
      continue  if typeof path != "string" or not path
      resolvedPath = path + "/" + resolvedPath
      resolvedAbsolute = path.charAt(0) == "/"
      i--
    resolvedPath = normalizeArray(resolvedPath.split("/").filter((p) ->
      not not p
    ), not resolvedAbsolute).join("/")
    ((if resolvedAbsolute then "/" else "") + resolvedPath) or "."
  
  exports.normalize = (path) ->
    isAbsolute = path.charAt(0) == "/"
    trailingSlash = path.slice(-1) == "/"
    path = normalizeArray(path.split("/").filter((p) ->
      not not p
    ), not isAbsolute).join("/")
    path = "."  if not path and not isAbsolute
    path += "/"  if path and trailingSlash
    (if isAbsolute then "/" else "") + path
  
  exports.join = ->
    paths = Array::slice.call(arguments, 0)
    exports.normalize paths.filter((p, index) ->
      p and typeof p == "string"
    ).join("/")
  
  exports.relative = (from, to) ->
    trim = (arr) ->
      start = 0
      while start < arr.length
        break  if arr[start] != ""
        start++
      end = arr.length - 1
      while end >= 0
        break  if arr[end] != ""
        end--
      return []  if start > end
      arr.slice start, end - start + 1
    from = exports.resolve(from).substr(1)
    to = exports.resolve(to).substr(1)
    fromParts = trim(from.split("/"))
    toParts = trim(to.split("/"))
    length = Math.min(fromParts.length, toParts.length)
    samePartsLength = length
    i = 0
    
    while i < length
      if fromParts[i] != toParts[i]
        samePartsLength = i
        break
      i++
    outputParts = []
    i = samePartsLength
    
    while i < fromParts.length
      outputParts.push ".."
      i++
    outputParts = outputParts.concat(toParts.slice(samePartsLength))
    outputParts.join "/"
exports.dirname = (path) ->
  result = splitPath(path)
  root = result[0]
  dir = result[1]
  return "."  if not root and not dir
  dir = dir.substring(0, dir.length - 1)  if dir
  root + dir

exports.basename = (path, ext) ->
  f = splitPath(path)[2]
  f = f.substr(0, f.length - ext.length)  if ext and f.substr(-1 * ext.length) == ext
  f

exports.extname = (path) ->
  splitPath(path)[3]

exports.exists = (path, callback) ->
  process.binding("fs").stat path, (err, stats) ->
    callback (if err then false else true)  if callback

exports.existsSync = (path) ->
  try
    process.binding("fs").stat path
    return true
  catch e
    return false

exports._makeLong = (if isWindows then (path) ->
  resolvedPath = exports.resolve(path)
  if resolvedPath.match(/^[a-zA-Z]\:\\/)
    return "\\\\?\\" + resolvedPath
  else return "\\\\?\\UNC\\" + resolvedPath.substring(2)  if resolvedPath.match(/^\\\\[^?.]/)
  path
 else (path) ->
  path
)
