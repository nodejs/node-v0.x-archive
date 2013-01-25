var Timer = require('bench-timer');
var params = Timer.parse(process.argv);

var ITER = params.iter || 1e7;
var noAssert = params.noassert;
var Buff = params.slow ? require('buffer').SlowBuffer : Buffer;
var buff = Buff(8);

buff.writeDoubleLE(0, 0, noAssert);

Timer('readUInt8', function() {
  for (var i = 0; i < ITER; i++)
    buff.readUInt8(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readUInt16LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readUInt16LE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readUInt16BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readUInt16BE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readUInt32LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readUInt32LE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readUInt32BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readUInt32BE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readInt8', function() {
  for (var i = 0; i < ITER; i++)
    buff.readInt8(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readInt16LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readInt16LE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readInt16BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readInt16BE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readInt32LE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readInt32LE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readInt32BE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readInt32BE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readFloatLE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readFloatLE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readFloatBE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readFloatBE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readDoubleLE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readDoubleLE(0, noAssert);
}).oncomplete(oncomplete, ITER);

Timer('readDoubleBE', function() {
  for (var i = 0; i < ITER; i++)
    buff.readDoubleBE(0, noAssert);
}).oncomplete(oncomplete, ITER);


function oncomplete(name, hrtime, iter) {
  var t = hrtime[0] * 1e3 + hrtime[1] / 1e6;
  var m = Timer.maxNameLength();
  name += ': ';
  while (name.length < m + 2)
    name += ' ';
  console.log('%s%s/ms', name, Math.floor(iter / t));
}
