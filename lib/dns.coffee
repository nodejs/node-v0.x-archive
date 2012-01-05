errnoException = (errorno, syscall) ->
  e = new Error(syscall + " " + errorno)
  errorno = "ENOTFOUND"  if errorno == "ENOENT"
  e.errno = e.code = errorno
  e.syscall = syscall
  e
familyToSym = (family) ->
  switch family
    when 4
      cares.AF_INET
    when 6
      cares.AF_INET6
    else
      cares.AF_UNSPEC
symToFamily = (family) ->
  switch family
    when cares.AF_INET
      4
    when cares.AF_INET6
      6
    else
      undefined
makeAsync = (callback) ->
  return callback  if typeof callback != "function"
  asyncCallback = ->
    if asyncCallback.immediately
      callback.apply null, arguments
    else
      args = arguments
      process.nextTick ->
        callback.apply null, args
resolver = (bindingName) ->
  binding = cares[bindingName]
  query = (name, callback) ->
    onanswer = (status, result) ->
      unless status
        callback null, result
      else
        callback errnoException(errno, bindingName)
    callback = makeAsync(callback)
    wrap = binding(name, onanswer)
    throw errnoException(errno, bindingName)  unless wrap
    callback.immediately = true
    wrap
cares = process.binding("cares_wrap")
net = require("net")
isIp = net.isIP
exports.lookup = (domain, family, callback) ->
  onanswer = (addresses) ->
    if addresses
      if family
        callback null, addresses[0], family
      else
        callback null, addresses[0], (if addresses[0].indexOf(":") >= 0 then 6 else 4)
    else
      callback errnoException(errno, "getaddrinfo")
  if arguments.length == 2
    callback = family
    family = 0
  else unless family
    family = 0
  else
    family = +family
    throw new Error("invalid argument: `family` must be 4 or 6")  if family != 4 and family != 6
  callback = makeAsync(callback)
  unless domain
    callback null, null, (if family == 6 then 6 else 4)
    return {}
  if process.platform == "win32" and domain == "localhost"
    callback null, "127.0.0.1", 4
    return {}
  matchedFamily = net.isIP(domain)
  if matchedFamily
    callback null, domain, matchedFamily
    return {}
  wrap = cares.getaddrinfo(domain, family)
  throw errnoException(errno, "getaddrinfo")  unless wrap
  wrap.oncomplete = onanswer
  callback.immediately = true
  wrap

resolveMap = {}
exports.resolve4 = resolveMap.A = resolver("queryA")
exports.resolve6 = resolveMap.AAAA = resolver("queryAaaa")
exports.resolveCname = resolveMap.CNAME = resolver("queryCname")
exports.resolveMx = resolveMap.MX = resolver("queryMx")
exports.resolveNs = resolveMap.NS = resolver("queryNs")
exports.resolveTxt = resolveMap.TXT = resolver("queryTxt")
exports.resolveSrv = resolveMap.SRV = resolver("querySrv")
exports.reverse = resolveMap.PTR = resolver("getHostByAddr")
exports.resolve = (domain, type_, callback_) ->
  if typeof type_ == "string"
    resolver = resolveMap[type_]
    callback = callback_
  else
    resolver = exports.resolve4
    callback = type_
  if typeof resolver == "function"
    resolver domain, callback
  else
    throw new Error("Unknown type \"" + type + "\"")

exports.BADNAME = "EBADNAME"
exports.BADRESP = "EBADRESP"
exports.CONNREFUSED = "ECONNREFUSED"
exports.DESTRUCTION = "EDESTRUCTION"
exports.REFUSED = "EREFUSED"
exports.FORMERR = "EFORMERR"
exports.NODATA = "ENODATA"
exports.NOMEM = "ENOMEM"
exports.NOTFOUND = "ENOTFOUND"
exports.NOTIMP = "ENOTIMP"
exports.SERVFAIL = "ESERVFAIL"
exports.TIMEOUT = "ETIMEOUT"
