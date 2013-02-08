/* Usage:
 *
 * --exec: specify which test(s) to run
 * --iter: how many iterations each test should run (default: 1e6)
 * --slow: toggle use of slow buffer
 *
 * Example:
 *
 *   node buffer_slice.js --exec 'slice - 1e2' --iter 1e5 --slow
 */

var oc = require('../templates/_buffer').oncomplete;
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var Buff = params.slow ? require('buffer').SlowBuffer : Buffer;
var ITER = params.iter || 1e6;
var buf1e2 = new Buff(1e2);
var buf1e4 = new Buff(1e4);
var oc_args = [ITER];

Timer('slice - 1e2', function() {
  for (var i = 0; i < ITER; i++)
    buf1e2.slice();
}).oncomplete(oc, oc_args);

Timer('slice - 1e2/1,50', function() {
  for (var i = 0; i < ITER; i++)
    buf1e2.slice(1,50);
}).oncomplete(oc, oc_args);

Timer('slice - 1e4', function() {
  for (var i = 0; i < ITER; i++)
    buf1e4.slice();
}).oncomplete(oc, oc_args);

Timer('slice - 1e4/1,500', function() {
  for (var i = 0; i < ITER; i++)
    buf1e4.slice(1,500);
}).oncomplete(oc, oc_args);

oc_args.push(Timer.maxNameLength());
