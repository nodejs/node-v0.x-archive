replacer = (key, value) ->
  return "" + value  if value == undefined
  return value.toString()  if typeof value == "number" and (isNaN(value) or not isFinite(value))
  return value.toString()  if typeof value == "function" or value instanceof RegExp
  value
truncate = (s, n) ->
  if typeof s == "string"
    (if s.length < n then s else s.slice(0, n))
  else
    s
fail = (actual, expected, message, operator, stackStartFunction) ->
  throw new assert.AssertionError(
    message: message
    actual: actual
    expected: expected
    operator: operator
    stackStartFunction: stackStartFunction
  )
ok = (value, message) ->
  fail value, true, message, "==", assert.ok  unless not not value
_deepEqual = (actual, expected) ->
  if actual == expected
    true
  else if Buffer.isBuffer(actual) and Buffer.isBuffer(expected)
    return false  unless actual.length == expected.length
    i = 0
    
    while i < actual.length
      return false  if actual[i] != expected[i]
      i++
    true
  else if actual instanceof Date and expected instanceof Date
    actual.getTime() == expected.getTime()
  else if actual instanceof RegExp and expected instanceof RegExp
    actual.source == expected.source and actual.global == expected.global and actual.multiline == expected.multiline and actual.lastIndex == expected.lastIndex and actual.ignoreCase == expected.ignoreCase
  else if typeof actual != "object" and typeof expected != "object"
    actual == expected
  else
    objEquiv actual, expected
isUndefinedOrNull = (value) ->
  value == null or value == undefined
isArguments = (object) ->
  Object::toString.call(object) == "[object Arguments]"
objEquiv = (a, b) ->
  return false  if isUndefinedOrNull(a) or isUndefinedOrNull(b)
  return false  if a:: != b::
  if isArguments(a)
    return false  unless isArguments(b)
    a = pSlice.call(a)
    b = pSlice.call(b)
    return _deepEqual(a, b)
  try
    ka = Object.keys(a)
    kb = Object.keys(b)
  catch e
    return false
  return false  unless ka.length == kb.length
  ka.sort()
  kb.sort()
  i = ka.length - 1
  while i >= 0
    return false  unless ka[i] == kb[i]
    i--
  i = ka.length - 1
  while i >= 0
    key = ka[i]
    return false  unless _deepEqual(a[key], b[key])
    i--
  true
expectedException = (actual, expected) ->
  return false  if not actual or not expected
  if expected instanceof RegExp
    return expected.test(actual)
  else if actual instanceof expected
    return true
  else return true  if expected.call({}, actual) == true
  false
_throws = (shouldThrow, block, expected, message) ->
  if typeof expected == "string"
    message = expected
    expected = null
  try
    block()
  catch e
    actual = e
  message = (if expected and expected.name then " (" + expected.name + ")." else ".") + (if message then " " + message else ".")
  fail "Missing expected exception" + message  if shouldThrow and not actual
  fail "Got unwanted exception" + message  if not shouldThrow and expectedException(actual, expected)
  throw actual  if (shouldThrow and actual and expected and not expectedException(actual, expected)) or (not shouldThrow and actual)
util = require("util")
pSlice = Array::slice
assert = module.exports = ok
assert.AssertionError = AssertionError = (options) ->
  @name = "AssertionError"
  @message = options.message
  @actual = options.actual
  @expected = options.expected
  @operator = options.operator
  stackStartFunction = options.stackStartFunction or fail
  Error.captureStackTrace this, stackStartFunction  if Error.captureStackTrace

util.inherits assert.AssertionError, Error
assert.AssertionError::toString = ->
  if @message
    [ @name + ":", @message ].join " "
  else
    [ @name + ":", truncate(JSON.stringify(@actual, replacer), 128), @operator, truncate(JSON.stringify(@expected, replacer), 128) ].join " "

assert.AssertionError.__proto__ = Error::
assert.fail = fail
assert.ok = ok
assert.equal = equal = (actual, expected, message) ->
  fail actual, expected, message, "==", assert.equal  unless actual == expected

assert.notEqual = notEqual = (actual, expected, message) ->
  fail actual, expected, message, "!=", assert.notEqual  if actual == expected

assert.deepEqual = deepEqual = (actual, expected, message) ->
  fail actual, expected, message, "deepEqual", assert.deepEqual  unless _deepEqual(actual, expected)

assert.notDeepEqual = notDeepEqual = (actual, expected, message) ->
  fail actual, expected, message, "notDeepEqual", assert.notDeepEqual  if _deepEqual(actual, expected)

assert.strictEqual = strictEqual = (actual, expected, message) ->
  fail actual, expected, message, "===", assert.strictEqual  if actual != expected

assert.notStrictEqual = notStrictEqual = (actual, expected, message) ->
  fail actual, expected, message, "!==", assert.notStrictEqual  if actual == expected

assert.throws = (block, error, message) ->
  _throws.apply this, [ true ].concat(pSlice.call(arguments))

assert.doesNotThrow = (block, error, message) ->
  _throws.apply this, [ false ].concat(pSlice.call(arguments))

assert.ifError = (err) ->
  throw err  if err
