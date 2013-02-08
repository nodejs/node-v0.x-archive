var Timer = require('../lib/bench-timer');
var params = Timer.parse(process.argv);
var iter = params.iter || 1e8;
var obj = { noop: noop };
var mnl;

function noop() { }

function oe(name, time) {
  name = fmtName(name);
  var micros = time[0] * 1e3 + time[1] / 1e6;
  console.log('%s%s ops/\u00b5s',
              name,
              (iter / micros).toFixed(2));
}

var aN = Timer('asyncNoop');
var aNT = Timer('asyncNoopTracker').onend(oe);
aN.noop();
setTimeout(function() {
  aNT.start();
  aN.start();
  for (var i = 0; i < iter; i++)
    aN.inc();
  aN.end();
  aNT.end();
}, 15);

var eF = Timer('emptyFor').onend(oe);
setTimeout(function() {
  eF.start();
  for (var i = 0; i < iter; i++);
  eF.end();
}, 15);

var eN = Timer('emptyNoop').onend(oe);
setTimeout(function() {
  eN.start();
  for (var i = 0; i < iter; i++)
    noop();
  eN.end();
}, 15);

var eNO = Timer('emptyNoopObj').onend(oe);
setTimeout(function() {
  eNO.start();
  for (var i = 0; i < iter; i++)
    obj.noop();
  eNO.end();
}, 15);

var eA = Timer('emptyAsync').onend(oe);
setTimeout(function() {
  eA.start();
  eA.end();
}, 15);

mnl = Timer.maxNameLength();

function fmtName(name) {
  name += ': ';
  while (name.length < mnl + 2)
    name += ' ';
  return name;
}
