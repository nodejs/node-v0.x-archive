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

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      case '%%': return '%';
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


exports.print = function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(String(arguments[i]));
  }
};


exports.puts = function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(arguments[i] + '\n');
  }
};


exports.debug = function(x) {
  process.stderr.write('DEBUG: ' + x + '\n');
};


var error = exports.error = function(x) {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stderr.write(arguments[i] + '\n');
  }
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 * @param {Boolean} resolveGetters Attempt to resolve getters to their value.
 *    If an error is thrown the value is set to the error. Default is false.
 */

function inspect(obj, showHidden, depth, colors) {
  var settings = {
    showHidden: showHidden,          // show non-enumerables
    style: colors ? color : reflect,
    seen: []
  };

  // cache formatted brackets
  settings.square = [
    settings.style('[', 'Square'),
    settings.style(']', 'Square')
  ];
  settings.curly =  [
    settings.style('{',  'Curly'),
    settings.style('}',  'Curly')
  ];

  return formatValue(obj, depth || 2, settings);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
var ansi = {
  black       : [  '30',    '39'],
  red         : [  '31',    '39'],
  green       : [  '32',    '39'],
  yellow      : [  '33',    '39'],
  blue        : [  '34',    '39'],
  magenta     : [  '35',    '39'],
  cyan        : [  '36',    '39'],
  white       : [  '37',    '39'],
  boldblack   : ['1;30', '22;39'],
  boldred     : ['1;31', '22;39'],
  boldgreen   : ['1;32', '22;39'],
  boldyellow  : ['1;33', '22;39'],
  boldblue    : ['1;34', '22;39'],
  boldmagenta : ['1;35', '22;39'],
  boldcyan    : ['1;36', '22;39'],
  boldwhite   : ['1;37', '22;39']
};


// map types to a color
var styles = {
  // falsey
  Undefined   : 'boldblack',
  Null        : 'boldblack',
  // constructor functions
  Constructor : 'boldyellow',
  // normal types
  Function    : 'boldmagenta',
  Boolean     : 'magenta',
  Date        : 'red',
  Error       : 'boldred',
  Number      : 'yellow',
  RegExp      : 'red',
  // proprty names and strings
  HString     : 'green',
  String      : 'boldgreen',
  HConstant   : 'cyan',
  Constant    : 'cyan',
  HName       : 'boldblack',
  Name        : 'boldwhite',
  // meta-labels
  More        : 'boldcyan',
  Accessor    : 'boldcyan',
  Circular    : 'boldcyan',
  // brackets
  Square      : 'boldblue',
  Curly       : 'cyan'
};


// callbind parameterizes `this`
var callbind = Function.prototype.call.bind.bind(Function.prototype.call);

// formatter for functions shared with constructor formatter
function functionLabel(fn, isCtor){
  var type = isCtor ? 'Constructor' : 'Function',
      label = fn.name ? ': ' + fn.name : '';
  return '[' + type + label + ']';
}


// most formatting determined by internal [[class]]
var formatters = {
  Boolean     : String,
  Constructor : function(f){ return functionLabel(f, true); },
  Date        : callbind(Date.prototype.toString),
  Error       : callbind(Error.prototype.toString),
  Function    : function(f){ return functionLabel(f, false); },
  Null        : String,
  Number      : String,
  RegExp      : callbind(RegExp.prototype.toString),
  String      : quotes,
  Undefined   : String
};


// wrap a string with ansi escapes for coloring
function color(str, style, special) {
  var out = special ? '\u00AB' + str + '\u00BB' : str;
  if (styles[style]) {
    out = '\033[' + ansi[styles[style]][0] + 'm' + out +
          '\033[' + ansi[styles[style]][1] + 'm';
  }
  return out;
}


// return passed value unmodified
function reflect(x) {
  return x;
}


var q = ['"', "'"];
var qMatch = [/(')/g, /(")/g];

// quote string preferably with quote type not found in the string
// then escape slashes and opposite quotes if string had both types
function quotes(s){
  s = String(s).replace(/\\/g, '\\\\');
  var qWith = +(s.match(qMatch[0]) === null);
  return q[qWith] + s.replace(qMatch[!qWith], '\\\\$1') + q[qWith];
}

<<<<<<< HEAD
/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */

function inspect(obj, showHidden, depth, colors, resolveGetters) {
  var settings = {
    showHidden: showHidden,          // show non-enumerables
    resolveGetters: resolveGetters,  // resolve getters to their value
    style: colors ? color : reflect,
    seen: []
  };

  // cache formatted brackets
  settings.square = [
    settings.style('[', 'Square'),
    settings.style(']', 'Square')
  ];
  settings.curly =  [
    settings.style('{',  'Curly'),
    settings.style('}',  'Curly')
  ];

  return formatValue(obj, depth || 2, settings);
}
exports.inspect = inspect;

=======
>>>>>>> Revert changes to the various isType functions. Make non-configurable properties always display as constants instead of just capslock ones. Reorganize a bit to more closely match original organization of util.js.

function formatValue(value, depth, settings) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    return value.inspect(depth);
  }

  var base = '',
      type = getClass(value),
      array = isArray(value),
      braces = array ? settings.square : settings.curly;

  // most types can just be formatted by matching their internal class
  if (type in formatters) {
    if (!isPrimitive(value) && type === 'Function') {
      // check for constructors
      if (!isPrimitive(value.prototype) &&
          (value.prototype.constructor !== value ||
          Object.getOwnPropertyNames(value.prototype).length > 1)) {
        // label constructors separately from functions
        type = 'Constructor';
      }
    }
    base = settings.style(formatters[type](value), type);
  }
  // prevent deeper inspection for primitives, regexps, and errors
  if (isPrimitive(value) || type === 'RegExp' || type === 'Error') {
    return base;
  }

  // depth limit reached
  if (depth < 0) {
    return settings.style('More', 'More', true);
  }

  var properties;
  if (!settings.showHidden) {
    properties = Object.keys(value);
  } else {
    properties = Object.getOwnPropertyNames(value);

    if (typeof value === 'function') {
      properties = properties.filter(function(key){
        // hide useless properties every function has
        return !(key in Function);
      });
      // show prototype last for constructors
      if (type === 'Constructor') {
        properties.push('prototype');
      }
    }
  }

  if (properties.length === 0) {
    // no properties so return '[]' or '{}'
    if (base) {
      return base;
    }
    if (!array || value.length === 0) {
      return braces.join('');
    }
  }

  settings.seen.push(value);

  var output = properties.reduce(function(arr, key){
    var prop = formatProperty(value, key, depth, settings, array);
    if (prop.length) arr.push(prop);
    return arr;
  }, []);

  return combine(output, base, braces);
}

function formatProperty(value, key, depth, settings, array) {
  // str starts as an array, val is a property descriptor
  var str = [];
  var val = Object.getOwnPropertyDescriptor(value, key);

  // weird edge case V8 c++ accessors like process.env
  if (typeof val === 'undefined') {
    val = { value: value[key], enumerable: true };
  }

  // check for accessors but don't resolve them
<<<<<<< HEAD
  val.set && str.push('Setter');
  val.get && str.push('Getter');
=======
  val.get && str.push('Getter');
  val.set && str.push('Setter');
>>>>>>> /bad-path/

  // combine Getter/Setter, or evaluate to empty for data descriptors
  str = str.join('/');

  if (str) {
<<<<<<< HEAD
    // unresolved accessor
    str = settings.style('\u00AB' + str + '\u00BB', 'Accessor');
=======
    // accessor descriptor
    str = settings.style(str, 'Accessor', true);
>>>>>>> /bad-path/

  } else {
    // data descriptor

    if (~settings.seen.indexOf(val.value)) {
      // already seen
<<<<<<< HEAD
      str = settings.style('\u00ABCircular\u00BB', 'Circular');
=======
      if (key !== 'constructor') {
        str = settings.style('Circular', 'Circular', true);
      } else {
        // hide redundent constructor reference
        return '';
      }
>>>>>>> /bad-path/

    } else {
      // recurse to subproperties
      str = formatValue(val.value, depth === null ? null : depth - 1, settings);

      // prepend indentation for multiple lines
      if (~str.indexOf('\n')) {
        str = str.split('\n')
                 .map(function(line){ return '  ' + line; })
                 .join('\n');

        // trim the edges
        str = array ? substring(str, 2) : '\n' + str;
      }
    }
  }

  // array indexes don't display their name
  if (array && /^\d+$/.test(key)) {
    return str;
  }

  // allow different coloring for non-enumerable names
  var nameFormat = val.enumerable ? '' : 'H';

  if (/^[a-zA-Z_\$][a-zA-Z0-9_\$]*$/.test(key)) {
    // valid JavaScript name not requiring quotes

    if ((val.value && !val.writable) || (val.get && !val.set)) {
      // color non-writable differently
      nameFormat += 'Constant';
    } else {
      // regular name
      nameFormat += 'Name';
    }
  } else {
    // name requires quoting
    nameFormat += 'String';
    key = quotes(key);
  }

  return settings.style(key, nameFormat) + ': ' + str;
}


function combine(output, base, braces) {
  var lines = 0;
  // last line's length
  var length = output.reduce(function(prev, cur) {
    // number of lines
    lines += 1 + !!~cur.indexOf('\n');
    return prev + cur.length + 1;
  }, 0);

  if (base.length) {
    // if given base make it so that it's not too long
    if (length > 60) {
      base = ' ' + base;
      output.unshift(lines > 1 ? '' : ' ');
    } else {
      base = ' ' + base + ' ';
    }
  } else {
    base = ' ';
  }

  // combine lines with commas and pad as needed
  base += output.join(',' + (length > 60 ? '\n ' : '') + ' ') + ' ';

  // wrap in appropriate braces
  return braces[0] + base + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}
exports.isArray = isArray;


function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;


function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;


function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}
exports.isError = isError;


function objectToString(o){
  return Object.prototype.toString.call(o);
}

// slice '[object Class]' to 'Class' for use in dict lookups
function getClass(o){
  return objectToString(o).slice(8, -1);
}


// returns true for strings, numbers, booleans, null, undefined, NaN
function isPrimitive(o){
  return Object(o) !== o;
}
exports.isPrimitive = isPrimitive;


exports.p = function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    error(exports.inspect(arguments[i]));
  }
};
module.deprecate('p', 'Use `util.puts(util.inspect())` instead.');


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


exports.log = function(msg) {
  exports.puts(timestamp() + ' - ' + msg.toString());
};


exports.exec = function() {
  return require('child_process').exec.apply(this, arguments);
};
module.deprecate('exec', 'It is now called `child_process.exec`.');


exports.pump = function(readStream, writeStream, callback) {
  var callbackCalled = false;

  function call(a, b, c) {
    if (callback && !callbackCalled) {
      callback(a, b, c);
      callbackCalled = true;
    }
  }

  readStream.addListener('data', function(chunk) {
    if (writeStream.write(chunk) === false) readStream.pause();
  });

  writeStream.addListener('drain', function() {
    readStream.resume();
  });

  readStream.addListener('end', function() {
    writeStream.end();
  });

  readStream.addListener('close', function() {
    call();
  });

  readStream.addListener('error', function(err) {
    writeStream.end();
    call(err);
  });

  writeStream.addListener('error', function(err) {
    readStream.destroy();
    call(err);
  });
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be revritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};
