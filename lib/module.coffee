hasOwnProperty = (obj, prop) ->
  Object::hasOwnProperty.call obj, prop
Module = (id, parent) ->
  @id = id
  @exports = {}
  @parent = parent
  @filename = null
  @loaded = false
  @exited = false
  @children = []
statPath = (path) ->
  fs = NativeModule.require("fs")
  try
    return fs.statSync(path)
  false
readPackage = (requestPath) ->
  return packageCache[requestPath]  if hasOwnProperty(packageCache, requestPath)
  fs = NativeModule.require("fs")
  try
    jsonPath = path.resolve(requestPath, "package.json")
    json = fs.readFileSync(jsonPath, "utf8")
  catch e
    return false
  try
    pkg = packageCache[requestPath] = JSON.parse(json)
  catch e
    e.path = jsonPath
    e.message = "Error parsing " + jsonPath + ": " + e.message
    throw e
  pkg
tryPackage = (requestPath, exts) ->
  pkg = readPackage(requestPath)
  return false  if not pkg or not pkg.main
  filename = path.resolve(requestPath, pkg.main)
  tryFile(filename) or tryExtensions(filename, exts) or tryExtensions(path.resolve(filename, "index"), exts)
tryFile = (requestPath) ->
  fs = NativeModule.require("fs")
  stats = statPath(requestPath)
  return fs.realpathSync(requestPath, Module._realpathCache)  if stats and not stats.isDirectory()
  false
tryExtensions = (p, exts) ->
  i = 0
  EL = exts.length
  
  while i < EL
    filename = tryFile(p + exts[i])
    return filename  if filename
    i++
  false
stripBOM = (content) ->
  content = content.slice(1)  if content.charCodeAt(0) == 0xFEFF
  content
NativeModule = require("native_module")
Script = process.binding("evals").NodeScript
runInThisContext = Script.runInThisContext
runInNewContext = Script.runInNewContext
assert = require("assert").ok
module.exports = Module
Module._contextLoad = (+process.env["NODE_MODULE_CONTEXTS"] > 0)
Module._cache = {}
Module._pathCache = {}
Module._extensions = {}
modulePaths = []
Module.globalPaths = []
Module.wrapper = NativeModule.wrapper
Module.wrap = NativeModule.wrap
path = NativeModule.require("path")
Module._debug = ->

if process.env.NODE_DEBUG and /module/.test(process.env.NODE_DEBUG)
  Module._debug = (x) ->
    console.error x
debug = Module._debug
packageCache = {}
Module._realpathCache = {}
Module._findPath = (request, paths) ->
  fs = NativeModule.require("fs")
  exts = Object.keys(Module._extensions)
  paths = [ "" ]  if request.charAt(0) == "/"
  trailingSlash = (request.slice(-1) == "/")
  cacheKey = JSON.stringify(
    request: request
    paths: paths
  )
  return Module._pathCache[cacheKey]  if Module._pathCache[cacheKey]
  i = 0
  PL = paths.length
  
  while i < PL
    basePath = path.resolve(paths[i], request)
    
    unless trailingSlash
      filename = tryFile(basePath)
      filename = tryExtensions(basePath, exts)  if not filename and not trailingSlash
    filename = tryPackage(basePath, exts)  unless filename
    filename = tryExtensions(path.resolve(basePath, "index"), exts)  unless filename
    if filename
      Module._pathCache[cacheKey] = filename
      return filename
    i++
  false

Module._nodeModulePaths = (from) ->
  from = path.resolve(from)
  splitRe = (if process.platform == "win32" then /[\/\\]/ else /\//)
  joiner = (if process.platform == "win32" then "\\" else "/")
  paths = []
  parts = from.split(splitRe)
  tip = parts.length - 1
  
  while tip >= 0
    continue  if parts[tip] == "node_modules"
    dir = parts.slice(0, tip + 1).concat("node_modules").join(joiner)
    paths.push dir
    tip--
  paths

Module._resolveLookupPaths = (request, parent) ->
  return [ request, [] ]  if NativeModule.exists(request)
  start = request.substring(0, 2)
  if start != "./" and start != ".."
    paths = modulePaths
    if parent
      parent.paths = []  unless parent.paths
      paths = parent.paths.concat(paths)
    return [ request, paths ]
  if not parent or not parent.id or not parent.filename
    mainPaths = [ "." ].concat(modulePaths)
    mainPaths = Module._nodeModulePaths(".").concat(mainPaths)
    return [ request, mainPaths ]
  isIndex = /^index\.\w+?$/.test(path.basename(parent.filename))
  parentIdPath = (if isIndex then parent.id else path.dirname(parent.id))
  id = path.resolve(parentIdPath, request)
  id = "./" + id  if parentIdPath == "." and id.indexOf("/") == -1
  debug "RELATIVE: requested:" + request + " set ID to: " + id + " from " + parent.id
  [ id, [ path.dirname(parent.filename) ] ]

Module._load = (request, parent, isMain) ->
  debug "Module._load REQUEST  " + (request) + " parent: " + parent.id  if parent
  resolved = Module._resolveFilename(request, parent)
  id = resolved[0]
  filename = resolved[1]
  cachedModule = Module._cache[filename]
  return cachedModule.exports  if cachedModule
  if NativeModule.exists(id)
    if id == "repl"
      replModule = new Module("repl")
      replModule._compile NativeModule.getSource("repl"), "repl.js"
      NativeModule._cache.repl = replModule
      return replModule.exports
    debug "load native module " + request
    return NativeModule.require(id)
  module = new Module(id, parent)
  if isMain
    process.mainModule = module
    module.id = "."
  Module._cache[filename] = module
  try
    module.load filename
  catch err
    delete Module._cache[filename]
    
    throw err
  module.exports

Module._resolveFilename = (request, parent) ->
  return [ request, request ]  if NativeModule.exists(request)
  resolvedModule = Module._resolveLookupPaths(request, parent)
  id = resolvedModule[0]
  paths = resolvedModule[1]
  debug "looking for " + JSON.stringify(id) + " in " + JSON.stringify(paths)
  filename = Module._findPath(request, paths)
  unless filename
    err = new Error("Cannot find module '" + request + "'")
    err.code = "MODULE_NOT_FOUND"
    throw err
  id = filename
  [ id, filename ]

Module::load = (filename) ->
  debug "load " + JSON.stringify(filename) + " for module " + JSON.stringify(@id)
  assert not @loaded
  @filename = filename
  @paths = Module._nodeModulePaths(path.dirname(filename))
  extension = path.extname(filename) or ".js"
  extension = ".js"  unless Module._extensions[extension]
  Module._extensions[extension] this, filename
  @loaded = true

Module::require = (path) ->
  Module._load path, this

Module::_compile = (content, filename) ->
  require = (path) ->
    self.require path
  self = this
  content = content.replace(/^\#\!.*/, "")
  require.resolve = (request) ->
    Module._resolveFilename(request, self)[1]
  
  Object.defineProperty require, "paths", get: ->
    throw new Error("require.paths is removed. Use " + "node_modules folders, or the NODE_PATH " + "environment variable instead.")
  
  require.main = process.mainModule
  require.extensions = Module._extensions
  require.registerExtension = ->
    throw new Error("require.registerExtension() removed. Use " + "require.extensions instead.")
  
  require.cache = Module._cache
  dirname = path.dirname(filename)
  if Module._contextLoad
    if self.id != "."
      debug "load submodule"
      sandbox = {}
      for k of global
        sandbox[k] = global[k]
      sandbox.require = require
      sandbox.exports = self.exports
      sandbox.__filename = filename
      sandbox.__dirname = dirname
      sandbox.module = self
      sandbox.global = sandbox
      sandbox.root = root
      return runInNewContext(content, sandbox, filename, true)
    debug "load root module"
    global.require = require
    global.exports = self.exports
    global.__filename = filename
    global.__dirname = dirname
    global.module = self
    return runInThisContext(content, filename, true)
  wrapper = Module.wrap(content)
  compiledWrapper = runInThisContext(wrapper, filename, true)
  global.v8debug.Debug.setBreakPoint compiledWrapper, 0, 0  if filename == process.argv[1] and global.v8debug
  args = [ self.exports, require, self, filename, dirname ]
  compiledWrapper.apply self.exports, args

Module._extensions[".js"] = (module, filename) ->
  content = NativeModule.require("fs").readFileSync(filename, "utf8")
  module._compile stripBOM(content), filename

Module._extensions[".json"] = (module, filename) ->
  content = NativeModule.require("fs").readFileSync(filename, "utf8")
  module.exports = JSON.parse(stripBOM(content))

Module._extensions[".node"] = (module, filename) ->
  process.dlopen filename, module.exports

Module.runMain = ->
  Module._load process.argv[1], null, true

Module._initPaths = ->
  paths = [ path.resolve(process.execPath, "..", "..", "lib", "node") ]
  if process.env["HOME"]
    paths.unshift path.resolve(process.env["HOME"], ".node_libraries")
    paths.unshift path.resolve(process.env["HOME"], ".node_modules")
  if process.env["NODE_PATH"]
    splitter = (if process.platform == "win32" then ";" else ":")
    paths = process.env["NODE_PATH"].split(splitter).concat(paths)
  modulePaths = paths
  Module.globalPaths = modulePaths.slice(0)

Module.requireRepl = ->
  Module._load "repl", "."

Module._initPaths()
Module.Module = Module
