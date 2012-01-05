StringDecoder = exports.StringDecoder = (encoding) ->
  @encoding = (encoding or "utf8").toLowerCase().replace(/[-_]/, "")
  if @encoding == "utf8"
    @charBuffer = new Buffer(4)
    @charReceived = 0
    @charLength = 0

StringDecoder::write = (buffer) ->
  return buffer.toString(@encoding)  if @encoding != "utf8"
  charStr = ""
  if @charLength
    i = (if (buffer.length >= @charLength - @charReceived) then @charLength - @charReceived else buffer.length)
    buffer.copy @charBuffer, @charReceived, 0, i
    @charReceived += i
    return ""  if @charReceived < @charLength
    charStr = @charBuffer.slice(0, @charLength).toString()
    @charReceived = @charLength = 0
    return charStr  if i == buffer.length
    buffer = buffer.slice(i, buffer.length)
  i = (if (buffer.length >= 3) then 3 else buffer.length)
  while i > 0
    c = buffer[buffer.length - i]
    if i == 1 and c >> 5 == 0x06
      @charLength = 2
      break
    if i <= 2 and c >> 4 == 0x0E
      @charLength = 3
      break
    if i <= 3 and c >> 3 == 0x1E
      @charLength = 4
      break
    i--
  return charStr + buffer.toString()  unless @charLength
  buffer.copy @charBuffer, 0, buffer.length - i, buffer.length
  @charReceived = i
  return charStr + buffer.toString("utf8", 0, buffer.length - i)  if buffer.length - i > 0
  charStr
