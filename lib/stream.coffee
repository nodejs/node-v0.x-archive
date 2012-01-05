Stream = ->
  events.EventEmitter.call this
events = require("events")
util = require("util")
util.inherits Stream, events.EventEmitter
module.exports = Stream
Stream.Stream = Stream
Stream::pipe = (dest, options) ->
  ondata = (chunk) ->
    source.pause()  if false == dest.write(chunk) and source.pause  if dest.writable
  ondrain = ->
    source.resume()  if source.readable and source.resume
  onend = ->
    return  if didOnEnd
    didOnEnd = true
    cleanup()
    dest.end()
  onclose = ->
    return  if didOnEnd
    didOnEnd = true
    cleanup()
    dest.destroy()
  onerror = (er) ->
    cleanup()
    throw er  if @listeners("error").length == 0
  cleanup = ->
    source.removeListener "data", ondata
    dest.removeListener "drain", ondrain
    source.removeListener "end", onend
    source.removeListener "close", onclose
    source.removeListener "error", onerror
    dest.removeListener "error", onerror
    source.removeListener "end", cleanup
    source.removeListener "close", cleanup
    dest.removeListener "end", cleanup
    dest.removeListener "close", cleanup
  source = this
  source.on_ "data", ondata
  dest.on_ "drain", ondrain
  if not dest._isStdio and (not options or options.end != false)
    source.on_ "end", onend
    source.on_ "close", onclose
  didOnEnd = false
  source.on_ "error", onerror
  dest.on_ "error", onerror
  source.on_ "end", cleanup
  source.on_ "close", cleanup
  dest.on_ "end", cleanup
  dest.on_ "close", cleanup
  dest.emit "pipe", source
  dest
