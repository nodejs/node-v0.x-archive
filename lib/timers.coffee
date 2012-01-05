insert = (item, msecs) ->
  item._idleStart = new Date()
  item._idleTimeout = msecs
  return  if msecs < 0
  
  if lists[msecs]
    list = lists[msecs]
  else
    list = new Timer()
    list.start msecs, 0
    L.init list
    lists[msecs] = list
    list.ontimeout = ->
      debug "timeout callback " + msecs
      now = new Date()
      debug "now: " + now
      
      while first = L.peek(list)
        diff = now - first._idleStart
        if diff + 1 < msecs
          list.start msecs - diff, 0
          debug msecs + " list wait because diff is " + diff
          return
        else
          L.remove first
          assert first != L.peek(list)
          first._onTimeout()  if first._onTimeout
      debug msecs + " list empty"
      assert L.isEmpty(list)
      list.close()
      delete lists[msecs]
  L.append list, item
  assert not L.isEmpty(list)
Timer = process.binding("timer_wrap").Timer
L = require("_linklist")
assert = require("assert").ok

if process.env.NODE_DEBUG and /timer/.test(process.env.NODE_DEBUG)
  debug = ->
    require("util").error.apply this, arguments
else
  debug = ->
lists = {}
unenroll = exports.unenroll = (item) ->
  L.remove item
  list = lists[item._idleTimeout]
  debug "unenroll"
  if list and L.isEmpty(list)
    debug "unenroll: list empty"
    list.close()
    delete lists[item._idleTimeout]
  delete item._idleTimeout

exports.enroll = (item, msecs) ->
  unenroll item  if item._idleNext
  item._idleTimeout = msecs
  L.init item

exports.active = (item) ->
  msecs = item._idleTimeout
  if msecs >= 0
    list = lists[msecs]
    if not list or L.isEmpty(list)
      insert item, msecs
    else
      item._idleStart = new Date()
      L.append list, item

exports.setTimeout = (callback, after) ->
  if after <= 0
    timer = new Timer()
    if arguments.length <= 2
      timer._onTimeout = ->
        callback()
        timer.close()
    else
      args = Array::slice.call(arguments, 2)
      timer._onTimeout = ->
        callback.apply timer, args
        timer.close()
    timer.ontimeout = timer._onTimeout
    timer.start 0, 0
  else
    timer = _idleTimeout: after
    timer._idlePrev = timer
    timer._idleNext = timer
    if arguments.length <= 2
      timer._onTimeout = callback
    else
      args = Array::slice.call(arguments, 2)
      timer._onTimeout = ->
        callback.apply timer, args
    exports.active timer
  timer

exports.clearTimeout = (timer) ->
  if timer and (timer.ontimeout or timer._onTimeout)
    timer.ontimeout = timer._onTimeout = null
    if timer instanceof Timer
      timer.close()
    else
      exports.unenroll timer

exports.setInterval = (callback, repeat) ->
  timer = new Timer()
  args = Array::slice.call(arguments, 2)
  timer.ontimeout = ->
    callback.apply timer, args
  
  timer.start repeat, (if repeat then repeat else 1)
  timer

exports.clearInterval = (timer) ->
  if timer instanceof Timer
    timer.ontimeout = null
    timer.close()
