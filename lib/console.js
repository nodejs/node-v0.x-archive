var inspect = require('util').inspect;

var writeError = process.binding('stdio').writeError;

// console object
var formatRegExp = /%[sdj]/g;
function format(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }


  var i = 1;
  var args = arguments;
  var str = String(f).replace(formatRegExp, function(x) {
    switch (x) {
      case '%s': return args[i++];
      case '%d': return +args[i++];
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for (var len = args.length; i < len; ++i) {
    str += ' ' + args[i];
  }
  return str;
}


exports.log = function() {
  process.stdout.write(format.apply(this, arguments) + '\n');
};


exports.info = exports.log;


exports.warn = function() {
  writeError(format.apply(this, arguments) + '\n');
};


exports.error = exports.warn;


exports.dir = function(object) {
  var util = require('util');
  process.stdout.write(inspect(object, false, 2, true) + '\n');
};


var times = {};
exports.time = function(label) {
  times[label] = Date.now();
};


exports.timeEnd = function(label) {
  var duration = Date.now() - times[label];
  exports.log('%s: %dms', label, duration);
};


exports.trace = function(label) {
  // TODO probably can to do this better with V8's debug object once that is
  // exposed.
  var err = new Error;
  err.name = 'Trace';
  err.message = label || '';
  Error.captureStackTrace(err, arguments.callee);
  console.error(err.stack);
};


exports.assert = function(expression) {
  if (!expression) {
    var arr = Array.prototype.slice.call(arguments, 1);
    process.assert(false, format.apply(this, arr));
  }
};
