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
var dv = new DataView(buff);

Timer('setUint8', function() {
  for (var i = 0; i < ITER; i++)
    dv.setUint8(0, i % UINT8);
}).oncomplete(oncomplete, ITER);

Timer('setUint16 - LE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setUint16(0, i % UINT16, true);
}).oncomplete(oncomplete, ITER);

Timer('setUint16 - BE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setUint16(0, i % UINT16);
}).oncomplete(oncomplete, ITER);

Timer('setUint32 - LE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setUint32(0, i % UINT32, true);
}).oncomplete(oncomplete, ITER);

Timer('setUint32 - BE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setUint32(0, i % UINT32);
}).oncomplete(oncomplete, ITER);

Timer('setInt8', function() {
  for (var i = 0; i < ITER; i++)
    dv.setInt8(0, i % INT8);
}).oncomplete(oncomplete, ITER);

Timer('setInt16 - LE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setInt16(0, i % INT16, true);
}).oncomplete(oncomplete, ITER);

Timer('setInt16 - BE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setInt16(0, i % INT16);
}).oncomplete(oncomplete, ITER);

Timer('setInt32 - LE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setInt32(0, i % INT32, true);
}).oncomplete(oncomplete, ITER);

Timer('setInt32 - BE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setInt32(0, i % INT32);
}).oncomplete(oncomplete, ITER);

Timer('setFloat32 - LE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setFloat32(0, i * 0.1, true);
}).oncomplete(oncomplete, ITER);

Timer('setFloat32 - BE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setFloat32(0, i * 0.1);
}).oncomplete(oncomplete, ITER);

Timer('setFloat64 - LE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setFloat64(0, i * 0.1, true);
}).oncomplete(oncomplete, ITER);

Timer('setFloat64 - BE', function() {
  for (var i = 0; i < ITER; i++)
    dv.setFloat64(0, i * 0.1);
}).oncomplete(oncomplete, ITER);


function oncomplete(name, hrtime, iter) {
  var t = hrtime[0] * 1e3 + hrtime[1] / 1e6;
  var m = Timer.maxNameLength();
  name += ': ';
  while (name.length < m + 2)
    name += ' ';
  console.log('%s%s/ms', name, Math.floor(iter / t));
}
