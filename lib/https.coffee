Server = (opts, requestListener) ->
  return new Server(opts, requestListener)  unless (this instanceof Server)
  opts.NPNProtocols = [ "http/1.1", "http/1.0" ]  if process.features.tls_npn and not opts.NPNProtocols
  tls.Server.call this, opts, http._connectionListener
  @httpAllowHalfOpen = false
  @addListener "request", requestListener  if requestListener
createConnection = (port, host, options) ->
  tls.connect port, host, options
Agent = (options) ->
  http.Agent.call this, options
  @createConnection = createConnection
tls = require("tls")
http = require("http")
inherits = require("util").inherits
inherits Server, tls.Server
exports.Server = Server
exports.createServer = (opts, requestListener) ->
  new Server(opts, requestListener)

inherits Agent, http.Agent
Agent::defaultPort = 443
globalAgent = new Agent()
exports.globalAgent = globalAgent
exports.Agent = Agent
exports.request = (options, cb) ->
  throw new Error("Protocol:" + options.protocol + " not supported.")  if options.protocol and options.protocol != "https:"
  options.agent = globalAgent  if options.agent == undefined
  options.createConnection = createConnection
  options.defaultPort = options.defaultPort or 443
  new http.ClientRequest(options, cb)

exports.get = (options, cb) ->
  options.method = "GET"
  req = exports.request(options, cb)
  req.end()
  req
