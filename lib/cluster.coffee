isObject = (o) ->
  typeof o == "object" and o != null
extendObject = (origin, add) ->
  keys = Object.keys(add)
  i = keys.length
  while i--
    origin[keys[i]] = add[keys[i]]
  origin
startMaster = ->
  assert cluster.isMaster
  return  if masterStarted
  masterStarted = true
  workerFilename = process.argv[1]
  workerArgs = process.argv.slice(2)
  process.on_ "uncaughtException", (e) ->
    eachWorker (worker) ->
      debug "kill worker " + worker.pid
      worker.kill()
    
    console.error "Exception in cluster master process: " + e.message + "\n" + e.stack
    process.exit 1
handleWorkerMessage = (worker, message) ->
  assert cluster.isMaster
  debug "recv " + JSON.stringify(message)
  switch message.cmd
    when "online"
      debug "Worker " + worker.pid + " online"
      worker.online = true
    when "queryServer"
      key = message.address + ":" + message.port + ":" + message.addressType
      response = _queryId: message._queryId
      unless (key of servers)
        debug "create new server " + key
        servers[key] = net._createServerHandle(message.address, message.port, message.addressType)
      worker.send response, servers[key]
    else
eachWorker = (cb) ->
  assert cluster.isMaster
  for id of workers
    cb workers[id]  if workers[id]
queryMaster = (msg, cb) ->
  assert cluster.isWorker
  debug "send " + JSON.stringify(msg)
  msg._queryId = (++queryIds)
  msg._workerId = workerId
  queryCallbacks[msg._queryId] = cb  if cb
  process.send msg
assert = require("assert")
fork = require("child_process").fork
net = require("net")
EventEmitter = require("events").EventEmitter
cluster = module.exports = new EventEmitter()

if process.env.NODE_DEBUG and /cluster/.test(process.env.NODE_DEBUG)
  debug = (x) ->
    prefix = process.pid + "," + (if process.env.NODE_WORKER_ID then "Worker" else "Master")
    console.error prefix, x
else
  debug = ->
masterStarted = false
ids = 0
workers = []
servers = {}


workerId = 0
queryIds = 0
queryCallbacks = {}
cluster.isWorker = "NODE_WORKER_ID" of process.env
cluster.isMaster = not cluster.isWorker
cluster.fork = (env) ->
  assert cluster.isMaster
  startMaster()
  id = ++ids
  envCopy = extendObject({}, process.env)
  envCopy["NODE_WORKER_ID"] = id
  envCopy = extendObject(envCopy, env)  if isObject(env)
  worker = fork(workerFilename, workerArgs, env: envCopy)
  workers[id] = worker
  worker.on_ "message", (message) ->
    handleWorkerMessage worker, message
  
  worker.on_ "exit", ->
    debug "worker id=" + id + " died"
    delete workers[id]
    
    cluster.emit "death", worker
  
  worker

cluster._startWorker = ->
  assert cluster.isWorker
  workerId = parseInt(process.env.NODE_WORKER_ID, 10)
  queryMaster cmd: "online"
  process.on_ "message", (msg, handle) ->
    debug "recv " + JSON.stringify(msg)
    if msg._queryId and msg._queryId of queryCallbacks
      cb = queryCallbacks[msg._queryId]
      cb msg, handle  if typeof cb == "function"
      delete queryCallbacks[msg._queryId]

cluster._getServer = (address, port, addressType, cb) ->
  assert cluster.isWorker
  queryMaster 
    cmd: "queryServer"
    address: address
    port: port
    addressType: addressType
  , (msg, handle) ->
    cb handle
