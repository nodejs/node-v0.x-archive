/* Usage:
 *
 * --exec: specify which test(s) to run
 * --iter: how many iterations each test should run (default: 1e6)
 *
 * Example:
 *
 *   node buffer_copy.js --exec 'fill - fast,fast,noArg' --iter 1e5
 */

var oc = require('../templates/_buffer').oncomplete;
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var ITER = params.iter || 1e6;
var SlowBuffer = require('buffer').SlowBuffer;
var slow0 = new SlowBuffer(1e3);
var slow1 = new SlowBuffer(1e3);
var fast0 = new Buffer(1e3);
var fast1 = new Buffer(1e3);
var oc_args = [ITER];

slow0.fill(0x61, 0, slow0.length);
slow1.fill(0x62, 0, slow1.length);
fast0.fill(0x61, 0, fast0.length);
fast1.fill(0x62, 0, fast1.length);

Timer('fill - fast,fast,noArg', function() {
  for (var i = 0; i < ITER; i++)
    fast0.copy(fast1);
}).oncomplete(oc, oc_args);

Timer('fill - fast,fast,allArg', function() {
  for (var i = 0; i < ITER; i++)
    fast0.copy(fast1,0,0,fast1.length);
}).oncomplete(oc, oc_args);

Timer('fill - slow,slow,noArg', function() {
  for (var i = 0; i < ITER; i++)
    slow0.copy(slow1);
}).oncomplete(oc, oc_args);

Timer('fill - slow,slow,allArg', function() {
  for (var i = 0; i < ITER; i++)
    slow0.copy(slow1,0,0,slow1.length);
}).oncomplete(oc, oc_args);

Timer('fill - fast,slow,noArg', function() {
  for (var i = 0; i < ITER; i++)
    fast0.copy(slow0);
}).oncomplete(oc, oc_args);

Timer('fill - fast,slow,allArg', function() {
  for (var i = 0; i < ITER; i++)
    fast0.copy(slow0,0,0,slow0.length);
}).oncomplete(oc, oc_args);

Timer('fill - slow,fast,noArg', function() {
  for (var i = 0; i < ITER; i++)
    slow0.copy(fast0);
}).oncomplete(oc, oc_args);

Timer('fill - slow,fast,allArg', function() {
  for (var i = 0; i < ITER; i++)
    slow0.copy(fast0,0,0,fast0.length);
}).oncomplete(oc, oc_args);

oc_args.push(Timer.maxNameLength());
