exports.readIEEE754 = (buffer, offset, isBE, mLen, nBytes) ->
  eLen = nBytes * 8 - mLen - 1
  eMax = (1 << eLen) - 1
  eBias = eMax >> 1
  nBits = -7
  i = (if isBE then 0 else (nBytes - 1))
  d = (if isBE then 1 else -1)
  s = buffer[offset + i]
  i += d
  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  while nBits > 0
    e = e * 256 + buffer[offset + i]
    i += d
    nBits -= 8
  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  while nBits > 0
    m = m * 256 + buffer[offset + i]
    i += d
    nBits -= 8
  if e == 0
    e = 1 - eBias
  else if e == eMax
    return (if m then NaN else ((if s then -1 else 1) * Infinity))
  else
    m = m + Math.pow(2, mLen)
    e = e - eBias
  (if s then -1 else 1) * m * Math.pow(2, e - mLen)

exports.writeIEEE754 = (buffer, value, offset, isBE, mLen, nBytes) ->
  eLen = nBytes * 8 - mLen - 1
  eMax = (1 << eLen) - 1
  eBias = eMax >> 1
  rt = (if mLen == 23 then Math.pow(2, -24) - Math.pow(2, -77) else 0)
  i = (if isBE then (nBytes - 1) else 0)
  d = (if isBE then -1 else 1)
  s = (if value < 0 or (value == 0 and 1 / value < 0) then 1 else 0)
  value = Math.abs(value)
  if isNaN(value) or value == Infinity
    m = (if isNaN(value) then 1 else 0)
    e = eMax
  else
    e = Math.floor(Math.log(value) / Math.LN2)
    if value * (c = Math.pow(2, -e)) < 1
      e--
      c *= 2
    if e + eBias >= 1
      value += rt / c
    else
      value += rt * Math.pow(2, 1 - eBias)
    if value * c >= 2
      e++
      c /= 2
    if e + eBias >= eMax
      m = 0
      e = eMax
    else if e + eBias >= 1
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    else
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
  while mLen >= 8
    buffer[offset + i] = m & 0xff
    i += d
    m /= 256
    mLen -= 8
  e = (e << mLen) | m
  eLen += mLen
  while eLen > 0
    buffer[offset + i] = e & 0xff
    i += d
    e /= 256
    eLen -= 8
  buffer[offset + i - d] |= s * 128
