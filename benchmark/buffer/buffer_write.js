/* Usage:
 *
 * --exec: specify which test(s) to run
 * --iter: how many iterations each test should run (default: 1e6)
 * --slow: toggle use of slow buffer
 * --noassert: toggle to enable noAssert
 *
 * Example:
 *
 *   node buffer_write.js --exec writeUInt8 --iter 1e5 --slow --noassert
 */

const INT8   = 0x7f;
const INT16  = 0x7fff;
const INT32  = 0x7fffffff;
const UINT8  = INT8 * 2;
const UINT16 = INT16 * 2;
const UINT32 = INT32 * 2;


var oc = require('../templates/_buffer').oncomplete;
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var Buff = params.slow ? require('buffer').SlowBuffer : Buffer;
var noAssert = !!params.noassert;
var ITER = params.iter || 1e6;
var buff = Buff(8);
var oc_args = [ITER];

Timer('writeUInt8', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt8(i % UINT8, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeUInt16LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt16LE(i % UINT16, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeUInt16BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt16BE(i % UINT16, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeUInt32LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt32LE(i % UINT32, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeUInt32BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt32BE(i % UINT32, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeInt8', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt8(i % INT8, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeInt16LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt16LE(i % INT16, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeInt16BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt16BE(i % INT16, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeInt32LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt32LE(i % INT32, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeInt32BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt32BE(i % INT32, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeFloatLE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeFloatLE(i * 0.1, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeFloatBE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeFloatBE(i * 0.1, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeDoubleLE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeDoubleLE(i * 0.1, 0, noAssert);
}).oncomplete(oc, oc_args);

Timer('writeDoubleBE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeDoubleBE(i * 0.1, 0, noAssert);
}).oncomplete(oc, oc_args);

oc_args.push(Timer.maxNameLength());
