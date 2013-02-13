var assert = require('assert');
var path = require('path');

exports.PORT = process.env.PORT || 12346;

// If this is the main module, then run the benchmarks
if (module === require.main) {
  var type = process.argv[2];
  if (!type) {
    console.error('usage:\n ./node benchmark/common.js <type>');
    process.exit(1);
  }

  var fs = require('fs');
  var dir = path.join(__dirname, type);
  var tests = fs.readdirSync(dir);
  var spawn = require('child_process').spawn;

  runBenchmarks();

  function runBenchmarks() {
    var test = tests.shift();
    if (!test)
      return;

    if (test.match(/^[\._]/))
      return process.nextTick(runBenchmarks);

    console.error(type + '/' + test);
    test = path.resolve(dir, test);

    var child = spawn(process.execPath, [ test ], { stdio: 'inherit' });
    child.on('close', function(code) {
      if (code)
        process.exit(code);
      else {
        console.log('');
        runBenchmarks();
      }
    });
  }
}

exports.createBenchmark = function(fn, options) {
  return new Benchmark(fn, options);
};

function Benchmark(fn, options) {
  this.fn = fn;
  this.options = options;
  this.config = parseOpts(options);
  this._name = require.main.filename.split(/benchmark[\/\\]/).pop();
  this._start = [0,0];
  this._started = false;
  var self = this;
  process.nextTick(function() {
    self._run();
  });
}

// benchmark an http server.
Benchmark.prototype.http = function(p, args, cb) {
  var self = this;
  makeWrk(function(er) {
    if (er)
      benchAb(self, p, args, cb);
    else
      benchWrk(self, p, args, cb);
  });
};

function makeWrk(cb) {
  // wrk doesn't work on sunos
  if (process.platform === 'sunos')
    return cb(new Error('work does not compile on sunos'));

  var spawn = require('child_process').spawn;
  var wrk = path.resolve(__dirname, '..', 'tools', 'wrk');
  var child = spawn('make', ['-C', wrk], { stdio: [null, null, 2] });

  child.on('exit', function(code, signal) {
    if (code)
      cb(new Error('wrk failed to compile'));
    else
      cb();
  });
}

function benchAb(self, p, args_, cb) {
  // have to modify the args somewhat, since ab is different.
  var flags = {};
  var args = ['-k', '-r'];
  for (var i = 0; i < args_.length; i += 2) {
    var k = args_[i];
    var v = args_[i + 1];
    switch (k) {
      case '-r':
        args.push('-n', v);
        break;
      case '-t': // no correllary
        break;
      case '-c': // high concurrency gets unstable
        v = Math.max(+v, 150);
        args.push(k, v);
    }
  }
  benchHttp(self, 'ab', /Requests per second: +([0-9\.]+)/, p, args, cb);
}

function benchWrk(self, p, args, cb) {
  var wrk = path.resolve(__dirname, '..', 'tools', 'wrk', 'wrk');
  benchHttp(self, wrk, /Requests\/sec:[ \t]+([0-9\.]+)/, p, args, cb);
}

function benchHttp(self, cmd, regexp, p, args, cb) {
  var spawn = require('child_process').spawn;
  var url = 'http://127.0.0.1:' + exports.PORT + p;
  args.push(url);

  var out = '';
  var child = spawn(cmd, args);

  child.stdout.setEncoding('utf8');

  child.stdout.on('data', function(chunk) {
    out += chunk;
  });

  child.on('close', function(code) {
    if (cb)
      cb(code);

    if (code) {
      console.error('cmd failed with ' + code);
      process.exit(code)
    }
    var m = out.match(regexp);
    var qps = m && +m[1];
    if (!qps) {
      console.error('%j', out);
      console.error('cmd produced strange output');
      process.exit(1);
    }
    self.report(+qps);
  });
};

Benchmark.prototype._run = function() {
  if (this.config)
    return this.fn(this.config);

  // one more more options weren't set.
  // run with all combinations
  var main = require.main.filename;
  var settings = [];
  var queueLen = 1;
  var options = this.options;

  var queue = Object.keys(options).reduce(function(set, key) {
    var vals = options[key];
    assert(Array.isArray(vals));

    // match each item in the set with each item in the list
    var newSet = new Array(set.length * vals.length);
    var j = 0;
    set.forEach(function(s) {
      vals.forEach(function(val) {
        newSet[j++] = s.concat(key + '=' + val);
      });
    });
    return newSet;
  }, [[main]]);

  var spawn = require('child_process').spawn;
  var node = process.execPath;
  var i = 0;
  function run() {
    var argv = queue[i++];
    if (!argv)
      return;
    var child = spawn(node, argv, { stdio: 'inherit' });
    child.on('close', function(code, signal) {
      if (code)
        console.error('child process exited with code ' + code);
      else
        run();
    });
  }
  run();
};

function parseOpts(options) {
  // verify that there's an option provided for each of the options
  // if they're not *all* specified, then we return null.
  var keys = Object.keys(options);
  var num = keys.length;
  var conf = {};
  for (var i = 2; i < process.argv.length; i++) {
    var m = process.argv[i].match(/^(.+)=(.+)$/);
    if (!m || !m[1] || !m[2] || !options[m[1]])
      return null;
    else {
      conf[m[1]] = isFinite(m[2]) ? +m[2] : m[2]
      num--;
    }
  }
  // still go ahead and set whatever WAS set, if it was.
  if (num !== 0) {
    Object.keys(conf).forEach(function(k) {
      options[k] = [conf[k]];
    });
  }
  return num === 0 ? conf : null;
};

Benchmark.prototype.start = function() {
  if (this._started)
    throw new Error('Called start more than once in a single benchmark');
  this._started = true;
  this._start = process.hrtime();
};

Benchmark.prototype.end = function(operations) {
  var elapsed = process.hrtime(this._start);
  if (!this._started)
    throw new Error('called end without start');
  if (typeof operations !== 'number')
    throw new Error('called end() without specifying operation count');
  var time = elapsed[0] + elapsed[1]/1e9;
  var rate = operations/time;
  this.report(rate);
};

Benchmark.prototype.report = function(value) {
  var heading = this.getHeading();
  console.log('%s: %s', heading, value.toPrecision(5));
  process.exit(0);
};

Benchmark.prototype.getHeading = function() {
  var conf = this.config;
  return this._name + ' ' + Object.keys(conf).map(function(key) {
    return key + '=' + conf[key];
  }).join(' ');
}
