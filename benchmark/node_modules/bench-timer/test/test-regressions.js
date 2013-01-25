var Timer = require('../lib/bench-timer');
var params = Timer.parse(process.argv);
var iter = params.iter || 1e6;
var offset = params.offset || 1e5;


Timer('regression0', function regression0() {
  var arr = [1];
  for (var i = 0; i < iter; i++) {
    simpleExternal(arr[0]);
    if (i % offset === 0)
      simpleExternal(arr[0], arr[1]);
  }
});


function simpleExternal(arg0) { }
