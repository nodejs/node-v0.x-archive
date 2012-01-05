init = (list) ->
  list._idleNext = list
  list._idlePrev = list
peek = (list) ->
  return null  if list._idlePrev == list
  list._idlePrev
shift = (list) ->
  first = list._idlePrev
  remove first
  first
remove = (item) ->
  item._idleNext._idlePrev = item._idlePrev  if item._idleNext
  item._idlePrev._idleNext = item._idleNext  if item._idlePrev
  item._idleNext = null
  item._idlePrev = null
append = (list, item) ->
  remove item
  item._idleNext = list._idleNext
  list._idleNext._idlePrev = item
  item._idlePrev = list
  list._idleNext = item
isEmpty = (list) ->
  list._idleNext == list
exports.init = init
exports.peek = peek
exports.shift = shift
exports.remove = remove
exports.append = append
exports.isEmpty = isEmpty
