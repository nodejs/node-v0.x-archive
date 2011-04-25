// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// console object
var formatRegExp = /%[sdj]/g;
function format(f) {
  var util = require('util');

  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(util.inspect(arguments[i]));
    }
    return objects.join(' ');
  }


  var i = 1;
  var args = arguments;
  var str = String(f).replace(formatRegExp, function(x) {
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for (var len = args.length, x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + util.inspect(x);
    }
  }
  return str;
}


function writeFormattedToStream(stream) {
  function log() {
    log.stream.write(format.apply(this, arguments) + '\n');
  }
  log.stream = stream;
  return log;
}

exports.log = writeFormattedToStream(process.stdout);

exports.info = writeFormattedToStream(process.stdout);

exports.warn = writeFormattedToStream(process.stderr);

exports.error = writeFormattedToStream(process.stderr);

exports.dir = function(object) {
  var util = require('util');
  exports.dir.stream.write(util.inspect(object) + '\n');
};
exports.dir.stream = process.stdout;


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
  exports.error(err.stack);
};


exports.assert = function(expression) {
  if (!expression) {
    var arr = Array.prototype.slice.call(arguments, 1);
    require('assert').ok(false, format.apply(this, arr));
  }
};
