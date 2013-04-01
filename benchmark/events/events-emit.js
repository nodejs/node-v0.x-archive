var common = require('../common.js');
var events = require('events');
var bench = common.createBenchmark(main, {
  type: ['function', 'object'],
  count: [1, 2, 3, 4],
  dur: [1e7]
});

function main(conf) {
  var n = 0;
  var ee = new events.EventEmitter();
  var emitFn;

  switch (conf.count) {
    case 1:
      emitFn = function(etype) { ee.emit(etype) }
      break;
    case 2:
      emitFn = function(etype) { ee.emit(etype, 1) }
      break;
    case 3:
      emitFn = function(etype) { ee.emit(etype, 1, 2) }
      break;
    case 4:
      emitFn = function(etype) { ee.emit(etype, 1, 2, 3) }
      break;
  }

  ee.on('function', function() { n++; });
  ee.on('object', function() { });
  ee.on('object', function() { n++; });

  bench.start();
    for (var i = 0; i < conf.dur; i++)
      emitFn(conf.type);
  bench.end(n);
}
