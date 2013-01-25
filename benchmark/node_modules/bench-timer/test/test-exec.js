/* Run test with the following:
 *
 * --exec test0
 *
 */

var Timer = require('../lib/bench-timer');
var params = Timer.parse(process.argv);

function fn() { }

Timer('test0', fn).oncomplete(function(name) {
  console.log(name + ' complete');
});

Timer('test1', fn).oncomplete(function(name) {
  console.log(name + ' complete');
});
