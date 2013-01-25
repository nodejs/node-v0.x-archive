const INT8   = 0x7f;
const INT16  = 0x7fff;
const INT32  = 0x7fffffff;
const UINT8  = INT8 * 2;
const UINT16 = INT16 * 2;
const UINT32 = INT32 * 2;

var Timer = require('bench-timer');
var params = Timer.parse(process.argv);

var ITER = params.iter || 1e7;
var noAssert = params.noassert;
var Buff = params.slow ? require('buffer').SlowBuffer : Buffer;
var buff = Buff(8);

Timer('writeUInt8', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt8(i % UINT8, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeUInt16LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt16LE(i % UINT16, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeUInt16BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt16BE(i % UINT16, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeUInt32LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt32LE(i % UINT32, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeUInt32BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeUInt32BE(i % UINT32, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeInt8', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt8(i % INT8, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeInt16LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt16LE(i % INT16, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeInt16BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt16BE(i % INT16, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeInt32LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt32LE(i % INT32, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeInt32BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeInt32BE(i % INT32, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeFloatLE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeFloatLE(i * 0.1, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeFloatBE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeFloatBE(i * 0.1, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeDoubleLE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeDoubleLE(i * 0.1, 0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('writeDoubleBE', function() {
  for (var i = 0; i < ITER; i++)
    buff.writeDoubleBE(i * 0.1, 0, noAssert);
}).oncomplete(oncomplete, ITER);


function oncomplete(name, hrtime, iter) {
  var t = hrtime[0] * 1e3 + hrtime[1] / 1e6;
  var m = Timer.maxNameLength();
  name += ': ';
  while (name.length < m + 2)
    name += ' ';
  console.log('%s%s/ms', name, Math.floor(iter / t));
}
