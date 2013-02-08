/* Usage:
 *
 * --exec: specify which test(s) to run
 * --iter: how many iterations each test should run (default: 1e6)
 * --slow: toggle use of slow buffer
 *
 * Example:
 *
 *   node buffer_fill.js --exec 'fill - 1e2' --iter 1e5 --slow
 */

var oc = require('../templates/_buffer').oncomplete;
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var Buff = params.slow ? require('buffer').SlowBuffer : Buffer;
var ITER = params.iter || 1e6;
var buf1e2 = Buff(1e2);
var buf1e4 = Buff(1e4);
var buf1e5 = Buff(1e5);
var oc_args = [ITER];

Timer('fill - 1e2', function() {
  for (var i = 0; i < ITER; i++)
    buf1e2.fill(10, 0, 10);
}).oncomplete(oc, oc_args);

Timer('fill - 1e4', function() {
  for (var i = 0; i < ITER; i++)
    buf1e4.fill(10, 0, 10);
}).oncomplete(oc, oc_args);

Timer('fill - 1e5', function() {
  for (var i = 0; i < ITER; i++)
    buf1e5.fill(10, 0, 10);
}).oncomplete(oc, oc_args);

oc_args.push(Timer.maxNameLength());
