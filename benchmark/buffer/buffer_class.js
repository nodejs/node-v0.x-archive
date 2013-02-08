/* Usage:
 *
 * --exec: specify which test(s) to run
 * --iter: how many iterations each test should run (default: 1e6)
 * --slow: toggle use of slow buffer
 *
 * Example:
 *
 *   node buffer_class.js --exec 'byteLength - ascii' --iter 1e5 --slow
 */

var oc = require('../templates/_buffer').oncomplete;
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var Buff = params.slow ? require('buffer').SlowBuffer : Buffer;
var ITER = params.iter || 1e6;
var str = createString(1e3);
var oc_args = [ITER];

Timer('isBuffer - {}', function() {
  for (var i = 0; i < ITER; i++)
    Buffer.isBuffer({});
}).oncomplete(oc, oc_args);

Timer('byteLength - utf8', function() {
  for (var i = 0; i < ITER; i++)
    Buffer.byteLength(str, 'utf8');
}).oncomplete(oc, oc_args);

Timer('byteLength - ascii', function() {
  for (var i = 0; i < ITER; i++)
    Buffer.byteLength(str, 'ascii');
}).oncomplete(oc, oc_args);

Timer('byteLength - hex', function() {
  for (var i = 0; i < ITER; i++)
    Buffer.byteLength(str, 'hex');
}).oncomplete(oc, oc_args);

Timer('byteLength - ucs2', function() {
  for (var i = 0; i < ITER; i++)
    Buffer.byteLength(str, 'ucs2');
}).oncomplete(oc, oc_args);

Timer('byteLength - base64', function() {
  for (var i = 0; i < ITER; i++)
    Buffer.byteLength(str, 'base64');
}).oncomplete(oc, oc_args);


function createString(len) {
  var str = '\u2803';
  while (str.length * 2 <= len)
    str += str;
  str += str.substr(0, len - str.length);
  return str;
}

oc_args.push(Timer.maxNameLength());
