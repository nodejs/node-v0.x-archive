// compare with "google-chrome deps/v8/benchmarks/run.html"
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var dir = path.join(__dirname, '..', '..', 'deps', 'v8', 'benchmarks');

var sandbox = {print: print, load: load};

load('run.js');

function print(s) {
  if (s === '----') return;
  console.log('misc/v8_bench.js %s', s);
}

function load(x) {
  var source = fs.readFileSync(path.join(dir, x), 'utf8');
  vm.runInNewContext(source, sandbox, {filename: x});
}
