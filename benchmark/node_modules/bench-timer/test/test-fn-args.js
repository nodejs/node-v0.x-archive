var Timer = require('../lib/bench-timer');

Timer('correctArgs', function() {
  var args = [1,2,3];
  for (var i = 0; i < 1e8; i++) {
    testCall(args[0], args[1], args[2]);
  }
});


Timer('incorrectArgs', function() {
  var args = [1,2,3];
  for (var i = 0; i < 1e8; i++) {
    testCall(args[0], args[1], args[2], args[3], args[4], args[5]);
  }
});


function testCall(a,b,c) {
  return a + b + c;
}
