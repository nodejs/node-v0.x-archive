var times = 0;

setInterval(function() {
  process.stderr.write('.')
}, 0);

setTimeout(function() {
  process.exit(times === 3 ? 0 : 1);
}, 102);

var a = setTimeout(function() {
  ++times;
}, 100.3);

var b = setTimeout(function() {
  ++times;
}, 4.3);

var c = setTimeout(function() {
  ++times;
}, 100);
