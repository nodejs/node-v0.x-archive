EventEmitter = ->
isArray = Array.isArray
exports.EventEmitter = EventEmitter
defaultMaxListeners = 10
EventEmitter::setMaxListeners = (n) ->
  @_events = {}  unless @_events
  @_maxListeners = n

EventEmitter::emit = ->
  type = arguments[0]
  if type == "error"
    if not @_events or not @_events.error or (isArray(@_events.error) and not @_events.error.length)
      if arguments[1] instanceof Error
        throw arguments[1]
      else
        throw new Error("Uncaught, unspecified 'error' event.")
      return false
  return false  unless @_events
  handler = @_events[type]
  return false  unless handler
  if typeof handler == "function"
    switch arguments.length
      when 1
        handler.call this
      when 2
        handler.call this, arguments[1]
      when 3
        handler.call this, arguments[1], arguments[2]
      else
        l = arguments.length
        args = new Array(l - 1)
        i = 1
        
        while i < l
          args[i - 1] = arguments[i]
          i++
        handler.apply this, args
    true
  else if isArray(handler)
    l = arguments.length
    args = new Array(l - 1)
    i = 1
    
    while i < l
      args[i - 1] = arguments[i]
      i++
    listeners = handler.slice()
    i = 0
    l = listeners.length
    
    while i < l
      listeners[i].apply this, args
      i++
    true
  else
    false

EventEmitter::addListener = (type, listener) ->
  throw new Error("addListener only takes instances of Function")  if "function" != typeof listener
  @_events = {}  unless @_events
  @emit "newListener", type, listener
  unless @_events[type]
    @_events[type] = listener
  else if isArray(@_events[type])
    @_events[type].push listener
    unless @_events[type].warned
      if @_maxListeners != undefined
        m = @_maxListeners
      else
        m = defaultMaxListeners
      if m and m > 0 and @_events[type].length > m
        @_events[type].warned = true
        console.error "(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", @_events[type].length
        console.trace()
  else
    @_events[type] = [ @_events[type], listener ]
  this

EventEmitter::on_ = EventEmitter::addListener
EventEmitter::once = (type, listener) ->
  g = ->
    self.removeListener type, g
    listener.apply this, arguments
  throw new Error(".once only takes instances of Function")  if "function" != typeof listener
  self = this
  g.listener = listener
  self.on_ type, g
  this

EventEmitter::removeListener = (type, listener) ->
  throw new Error("removeListener only takes instances of Function")  if "function" != typeof listener
  return this  if not @_events or not @_events[type]
  list = @_events[type]
  if isArray(list)
    position = -1
    i = 0
    length = list.length
    
    while i < length
      if list[i] == listener or (list[i].listener and list[i].listener == listener)
        position = i
        break
      i++
    return this  if position < 0
    list.splice position, 1
    delete @_events[type]  if list.length == 0
  else delete @_events[type]  if list == listener or (list.listener and list.listener == listener)
  this

EventEmitter::removeAllListeners = (type) ->
  if arguments.length == 0
    @_events = {}
    return this
  @_events[type] = null  if type and @_events and @_events[type]
  this

EventEmitter::listeners = (type) ->
  @_events = {}  unless @_events
  @_events[type] = []  unless @_events[type]
  @_events[type] = [ @_events[type] ]  unless isArray(@_events[type])
  @_events[type]
