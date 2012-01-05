util = require("util")
exports.log = ->
  process.stdout.write util.format.apply(this, arguments) + "\n"

exports.info = exports.log
exports.warn = ->
  process.stderr.write util.format.apply(this, arguments) + "\n"

exports.error = exports.warn
exports.dir = (object) ->
  process.stdout.write util.inspect(object) + "\n"

times = {}
exports.time = (label) ->
  times[label] = Date.now()

exports.timeEnd = (label) ->
  duration = Date.now() - times[label]
  exports.log "%s: %dms", label, duration

exports.trace = (label) ->
  err = new Error
  err.name = "Trace"
  err.message = label or ""
  Error.captureStackTrace err, arguments.callee
  console.error err.stack

exports.assert = (expression) ->
  unless expression
    arr = Array::slice.call(arguments, 1)
    require("assert").ok false, util.format.apply(this, arr)
