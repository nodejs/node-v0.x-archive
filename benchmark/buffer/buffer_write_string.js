/* Usage:
 *
 * --exec: specify which test(s) to run
 * --iter: how many iterations each test should run (default: 1e6)
 * --slow: toggle use of slow buffer
 *
 * Example:
 *
 *   node buffer_write_string.js --exec 'write - 1e1' --iter 1e5 --slow
 *
 * Defaults are 'fast' and '1e6'.
 */

var oc = require('../templates/_buffer').oncomplete;
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var Buff = params.slow ? require('buffer').SlowBuffer : Buffer;
var ITER = params.iter || 1e6;
var buff = Buff(1e4);
var str1e1 = createString(1e1);
var str1e2 = createString(1e2);
var str1e3 = createString(1e3);
var oc_args = [ITER];

Timer('write - 1e1', function() {
  for (var i = 0; i < ITER; i++)
    buff.write(str1e1);
}).oncomplete(oc, oc_args);

Timer('write - 1e1@1e3', function() {
  for (var i = 0; i < ITER; i++)
    buff.write(str1e1, 1e3);
}).oncomplete(oc, oc_args);

Timer('write - 1e2', function() {
  for (var i = 0; i < ITER; i++)
    buff.write(str1e2);
}).oncomplete(oc, oc_args);

Timer('write - 1e2@1e3', function() {
  for (var i = 0; i < ITER; i++)
    buff.write(str1e2, 1e3);
}).oncomplete(oc, oc_args);

Timer('write - 1e3', function() {
  for (var i = 0; i < ITER; i++)
    buff.write(str1e3);
}).oncomplete(oc, oc_args);

Timer('write - 1e3@1e3', function() {
  for (var i = 0; i < ITER; i++)
    buff.write(str1e3, 1e3);
}).oncomplete(oc, oc_args);


function createString(len) {
  var str = 'a';
  while (str.length * 2 <= len)
    str += str;
  str += str.substr(0, len - str.length);
  return str;
}

oc_args.push(Timer.maxNameLength());
