exports.FreeList = (name, max, constructor) ->
  @name = name
  @constructor = constructor
  @max = max
  @list = []

exports.FreeList::alloc = ->
  (if @list.length then @list.shift() else @constructor.apply(this, arguments))

exports.FreeList::free = (obj) ->
  @list.push obj  if @list.length < @max
