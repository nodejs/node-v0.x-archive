module.exports = Timer;

var sync_queue = [];
var name_max_length = 0;
var delay = 300;
var to_exec = false;
var rx_add_commas = /(\d)(?=(\d\d\d)+(?!\d))/g;
var rx_parse_params = /^--[^-]/;

// all sync tests should be loaded by the end of file parsing
setTimeout(runSyncTests, delay);

// var my_timer = Timer(name, [fn][iter, term, kill]);
function Timer(name, fn, term, kill) {
  if (typeof name != 'string')
    throw TypeError('name must be a string');
  if (name.length > name_max_length)
    name_max_length = name.length;
  return typeof fn == 'function' ?
          new initSync(name, fn) :
          new initAsync(name, fn, term, kill);
}

Timer.delay = function(ms) {
  if (typeof ms == 'number' && ms > 0)
    delay = parseInt(ms);
};

Timer.maxNameLength = function() {
  return name_max_length;
};

// var params = Timer.parse(process.argv);
Timer.parse = function(argv) {
  var obj = {};
  var current, tmpargv, i;
  if (!Array.isArray(argv))
    throw TypeError('argv must be an array');
  // turn argv into parameters object
  for (i = 2; i < argv.length; i++) {
    if (rx_parse_params.test(argv[i])) {
      current = argv[i].substr(2);
      obj[current] = true;
    } else if (current) {
      tmpargv = isFinite(argv[i]) ? argv[i] * 1 : argv[i];
      if (obj[current] === true) {
        obj[current] = tmpargv;
      } else {
        if (!Array.isArray(obj[current]))
          obj[current] = [obj[current]];
        obj[current].push(tmpargv);
      }
    }
  }
  // parse tests to run
  if (obj.exec) {
    to_exec = {};
    if (Array.isArray(obj.exec))
      for (i = 0; i < obj.exec.length; i++)
        to_exec[obj.exec[i]] = true;
    else
      to_exec[obj.exec] = true;
  }
  return obj;
};

// sync initialization

function initSync(name, fn) {
  this.name = name;
  this._cb = fn;
  this._args_complete = null;
  // filter tests to queue based on passed parameters
  if (!(to_exec && !to_exec[name]))
    sync_queue.push(this);
  return this;
}

initSync.prototype = {
  _complete: syncComplete,
  oncomplete: function onend(fn, usr_args) {
    if (typeof fn != 'function')
      throw TypeError('callback must be a function');
    this._complete = fn;
    if (usr_args)
      this._args_complete = usr_args;
  }
};

function runSyncTests() {
  if (sync_queue.length < 1)
    return;
  setTimeout(function() {
    var test = sync_queue.shift();
    var hrtime = process.hrtime();
    test._cb();
    hrtime = process.hrtime(hrtime);
    test._complete(test.name, hrtime, test._args_complete);
    runSyncTests();
  }, delay);
}

// args is null, but want to keep args passed and args received the same
function syncComplete(name, hrtime, args) {
  name += ': ';
  while (name.length < name_max_length + 2)
    name += ' ';
  var b = new Buffer(name +
                     Math.floor(hrtime[0] * 1e6 + hrtime[1] / 1e3)
                     .toString().replace(rx_add_commas, '$1,') +
                     ' \u00b5s\n');
  process.stdout.write(b);
}

// async initialization

function initAsync(name, delay, term, kill) {
  this.name = name;
  this._args_end = null;
  this._args_interval = null;
  this._args_start = null;
  this._counter = 0;
  this._ended = false;
  this._usr_start = false;
  // preemptively set in case user just calls .end()
  this._hrtime = process.hrtime();
  if (isFinite(delay)){
    this.start = asyncIntStart;
    this._delay = delay >= 0 ? parseInt(delay) : 0;
    this._usr_end = false;
    this._usr_interval = printIntervalTime;
    this._kill = !!kill;
    // use t*1 since parseInt('1e30') and parseFloat('0xff') both fail
    this._term = isFinite(term) && term > 0 ? term * 1 - 1 : false;
  } else {
    this.start = asyncTermStart;
    this._usr_end = asyncTermEnd;
    this._usr_interval = false;
  }
  return this;
}

// using the same prototype for both types of async benchmarks
initAsync.prototype = {
  _end: function _end() {
    if (this._ended)
      return;
    var _this = this;
    var counter = _this._counter;
    var name = _this.name;
    var time = process.hrtime(_this._hrtime);
    _this.cancel();
    setTimeout(function endSetTimeout() {
      if (_this._usr_end)
        _this._usr_end(name, time, counter, _this._args_end);
      if (_this._kill)
        process.exit();
      _this._ended = true;
    }, 0);
  },
  // this should only be called if init'd w/ intervals
  _interval: function _interval() {
    this._usr_interval(this.name,
                       this._hrtime,
                       this._counter,
                       this._args_interval);
  },
  // this will automatically be run on .end()
  cancel: function cancel() {
    if (this._setinterval)
      clearInterval(this._setinterval);
    return this;
  },
  end: function end(usr_args) {
    if (usr_args)
      this._args_end = usr_args;
    this._end();
    return this;
  },
  inc: function inc(n) {
    // time intensive, don't bother to check for NaN
    if (typeof n == 'number')
      this._counter += n;
    else
      this._counter++;
  },
  // run this to set everything to noop; useful for using v8 flags
  noop: function noop() {
    this.onend(noop);
    this.oninterval(noop);
    this.onstart(noop);
    this.inc = function() { };
    return this;
  },
  onend: function onend(fn, usr_args) {
    if (typeof fn != 'function')
      throw TypeError('callback must be a function');
    this._usr_end = fn;
    if (usr_args)
      this._args_end = usr_args;
    return this;
  },
  oninterval: function(fn, usr_args) {
    if (typeof fn != 'function')
      throw TypeError('callback must be a function');
    this._usr_interval = fn;
    if (usr_args)
      this._args_interval = usr_args;
    return this;
  },
  onstart: function(fn, usr_args) {
    if (typeof fn != 'function')
      throw TypeError('callback must be a function');
    this._usr_start = fn;
    if (usr_args)
      this._args_start = usr_args;
    return this;
  }
};

function asyncTermStart() {
  if (this._usr_start)
    this._usr_start(this._args_start);
  this._hrtime = process.hrtime();
}

function asyncTermEnd(name, time, counter) {
  printTime(name, time);
  // if counter is passed then iteration limit has been reached
  if (counter)
    printIntervalTime(name, time, counter);
}

function asyncIntStart() {
  var _this = this;
  // if user has set a start function, run it
  if (_this._usr_start)
    _this._usr_start(_this._args_start);
  _this._hrtime = process.hrtime();
  _this._setinterval = setInterval(function asyncSetInterval() {
    _this._hrtime = process.hrtime(_this._hrtime);
    _this._interval();
    if (_this._term !== false) {
      if (_this._term > 0)
        _this._term--;
      else
        _this._end();
    }
    _this._counter = 0;
    _this._hrtime= process.hrtime();
  }, this._delay);
}

function noop() { }

function printIntervalTime(name, time, counter) {
  var mstime = time[0] * 1e3 + time[1] / 1e6;
  name += ': ';
  while (name.length < name_max_length + 2)
    name += ' ';
  console.log('%s%s/sec',
              name,
              (counter / mstime * 1e3).toFixed(2)
                .replace(rx_add_commas, '$1,'));
}

function printTime(name, time) {
  name += ': ';
  while (name.length < name_max_length + 2)
    name += ' ';
  console.log('%s%s \u00b5s',
              name,
              Math.floor((time[0] * 1e6) + (time[1] / 1e3))
                .toString().replace(rx_add_commas, '$1,'));
}
