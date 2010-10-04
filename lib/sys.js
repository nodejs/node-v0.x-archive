var events = require('events');


exports.print = function () {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(String(arguments[i]));
  }
};


exports.puts = function () {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(arguments[i] + '\n');
  }
};


exports.debug = function (x) {
  process.binding('stdio').writeError("DEBUG: " + x + "\n");
};


var error = exports.error = function (x) {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.binding('stdio').writeError(arguments[i] + '\n');
  }
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} value The object to print out
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 * @param {boolean} sort flag.
*/

function inspect (obj, showHidden, depth, colors, sort) {
  //Set defaults
  var pointerSymbol= inspect.config.pointer.prefix;
  sort= (typeof sort === 'undefined') ? inspect.config.defaults.sort : sort;
  depth= (typeof depth === 'undefined') ? inspect.config.defaults.depth : depth;
  showHidden= (typeof showHidden === 'undefined') ? inspect.config.defaults.showHidden : showHidden;

  var seen= [];
  var data= [];
  var objectsPerDepthLevel= [[obj]];
  var infosPerDepthLevel= [[objectsTypeOf(obj) && scan(obj, pointerSymbol)]];
  var maxDepthLevelSeen= 0;
  var errores= [];

  var stylize = function (str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles = { 'bold'      : [1,  22]
                 , 'italic'    : [3,  23]
                 , 'underline' : [4,  24]
                 , 'inverse'   : [7,  27]
                 , 'white'     : [37, 39]
                 , 'grey'      : [90, 39]
                 , 'black'     : [30, 39]
                 , 'blue'      : [34, 39]
                 , 'cyan'      : [36, 39]
                 , 'green'     : [32, 39]
                 , 'magenta'   : [35, 39]
                 , 'red'       : [31, 39]
                 , 'yellow'    : [33, 39]
                 };
    var style = { "special": "grey"
                , "number": "blue"
                , "boolean": "blue"
                , "undefined": "red"
                , "null": "red"
                , "string": "green"
                , "date": "magenta"
                //, "name": intentionally not styling
                , "regexp": "cyan"
                , "pointer": "white"
                , "function": "yellow"
                }[styleType];
    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function primitivesTypeOf (o) {
   // Returns either a primitive type string or undefined
   switch (typeof o) {
     case 'undefined':                  return 'undefined';
     case 'string':                     return 'string';
     case 'number':                     return 'number';
     case 'boolean':                    return 'boolean';
     case 'object':     if (o === null) return 'null';
   }
  }

  function objectsTypeOf (o) {
   //Returns either an object type string or undefined
   if (typeof o === 'function') {
     if (isRegExp(o))                            return 'regexp'; 
     else                                        return 'function';
   }
   if (isArray(o))                               return 'array';
   if (isDate(o))                                return 'date';
   if ((typeof o === "object") && (o !== null))  return 'object';
  }

  function strIsNum (str) {
    return str.match(/^\d+$/);
  }
  
  function sortAscending (a, b) {
    if (strIsNum(a) && strIsNum(b)) {
      a= +a;
      b= +b;
    }
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function lookAhead (depthLevel) {
   var baseObjects= objectsPerDepthLevel[depthLevel-1];
   var baseInfos= infosPerDepthLevel[depthLevel-1];
   var nuOs= objectsPerDepthLevel[depthLevel]= [];
   var nuInfos= infosPerDepthLevel[depthLevel]= [];
   baseObjects.forEach(function scanBaseObjects1 (o,i, unused) {
     var info= baseInfos[i];
     var path= info.preferredPath;
     info.keysToVisit.forEach(function scanBaseObjects2 (key, unused1, unused2) {
       var nuO= o[key];
       if (objectsTypeOf(nuO) && unSeen(nuO)) {
         nuOs.push(nuO);
         nuInfos.push(scan(nuO, path+ (strIsNum(key) ? "["+ key+ "]" : "."+ key)));
       }
     });
   });
  }

  function scan (o, path) {
   //Build the info record for and object, and push o into seen[] and i into data[].
   var visibleKeys= Object.keys(o);
   var keysToVisit= (showHidden ? Object.getOwnPropertyNames(o) : visibleKeys);
   //if (showHidden) keysToVisit.push("__proto__");
   var i= { type:          objectsTypeOf(o),
            preferredPath: path,
            visibleKeys:   visibleKeys,
            keysToVisit:   (sort ? keysToVisit.sort(sortAscending) : keysToVisit) };
   return (data[seen.push(o)- 1]= i);
  }

  function unSeen (o) {
   return seen.indexOf(o) < 0;
  }

  function getInfo (o) {
   return data[seen.indexOf(o)];
  }

  function format (value, recurseTimes, path) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the sys module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties so return early.
    switch (primitivesTypeOf(value)) {
      case 'undefined':                  return stylize('undefined', 'undefined');
      case 'string':                     return stylize(JSON.stringify(value)
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"')
                                               .replace(/(^"|"$)/g, "'"), 'string');
      case 'number':                     return stylize('' + value, 'number');
      case 'boolean':                    return stylize('' + value, 'boolean');
      case 'null':                       return stylize('null', 'null');
    }

    // Look up the keys of the object.
    if (maxDepthLevelSeen < (depth- recurseTimes)) {
      lookAhead(++maxDepthLevelSeen);
    }
    var info= getInfo(value);
    if (!info) {
      if (inspect.config.defaults.warnings) {
        errores[errores.length]= "***WARNING (o !== o) "+ path;
      }
      info= scan(value, path);
    }
    
    if (info.preferredPath !== path) {
      //Don't expand here, return a pointer instead.
      inspect.config.pointer.wrapper[1]= info.preferredPath;
      return stylize(inspect.config.pointer.wrapper.join(''), 'pointer');
    }
    
    var base, braces = ["{", "}"];
    switch (info.type) {
      case 'function':
        inspect.config.f[1]= value.name ? " '"+ value.name+ "'" : "";
        base= " "+ stylize( inspect.config.f.join(''), 'function');
        break;
      case 'regexp'  :
        base= " "+ stylize('' + value, 'regexp');
        break;
      case 'date'    :
        base= " "+ stylize(value.toUTCString(), 'date');
        break;
      case 'object'  :
        base= '';
        break;
      case 'array'   :
        base= '';
        braces = ["[", "]"];
        break;
    }

    // Objects without properties can be shortcircuited.
    if (!info.keysToVisit.length) {
      return braces[0]+ (base ? base+ " " : '')+ braces[1];
    }
    
    if (recurseTimes < 0) {
      //Trying to go too deep.
      return braces[0]+ base+ "..."+ braces[1];
    }
    
    var output= info.keysToVisit.map(function mapper (key, unused1, unused2) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize("[Getter/Setter]", "special");
          } else {
            str = stylize("[Getter]", "special");
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize("[Setter]", "special");
          }
        }
      }
      if (info.visibleKeys.indexOf(key) < 0) {
        name = "[" + key + "]";
      }
      if (!str) {
        str = format(value[key], recurseTimes - 1, path+ (strIsNum(key) ? "["+ key+ "]" : "."+ key));
        if (str.indexOf('\n') > -1) {
          if (info.type === 'array') {
            str = str.split('\n').map(function lineMapper1 (line, unused1, unused2) {
              return '  ' + line;
            }).join('\n').substr(2);
          }
          else {
            str = '\n' + str.split('\n').map(function lineMapper2 (line, unused1, unused2) {
              return '   ' + line;
            }).join('\n');
          }
        }
      }
      
      if (typeof name === 'undefined') {
        if (info.type === 'array' && strIsNum(key)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length-2);
          name = stylize(name, "name");
        }
        else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, "string");
        }
      }

      return name + ": " + str;
    });

    var numLinesEst = 0;
    var length = output.reduce(function reducer (prev, cur, unused1, unused2) {
        numLinesEst++;
        if( cur.indexOf('\n') >= 0 ) {
          numLinesEst++;
        }
        return prev + cur.length + 1;
      },0);

    if (length > 50) {
      output = braces[0]
             + (base === '' ? '' : base + '\n ')
             + ' '
             + output.join('\n, ')
             + (numLinesEst > 1 ? '\n' : ' ')
             + braces[1]
             ;
    }
    else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  var r= format(obj, depth, pointerSymbol);
  if (errores.length) {
    return errores.join("\r\n")+ "\r\n"+ r;
  }
  return r;
};

inspect.config= {
  pointer: {
    wrapper: ["[", "", "]"],
    prefix: "Circular"
  },
  f: ["[Function", '', "]"],
  defaults: {
    depth: 2,
    sort: false,
    showHidden: false,
    warnings: false
  }
};

exports.inspect= inspect;

var objectPrototypeToString= ({}).toString;

var isArray= Array.isArray || function isArray (o) {
  return objectPrototypeToString.call(o).toLowerCase().indexOf('array') >= 0;
};

function isRegExp (o) {
  return objectPrototypeToString.call(o).toLowerCase().indexOf('regexp') >= 0;
}

function isDate (o) {
  return objectPrototypeToString.call(o).toLowerCase().indexOf('date') >= 0;
}

var pWarning;

exports.p = function () {
  if (!pWarning) {
    pWarning = "sys.p will be removed in future versions of Node. Use sys.puts(sys.inspect()) instead.\n";
    exports.error(pWarning);
  }
  for (var i = 0, len = arguments.length; i < len; ++i) {
    error(exports.inspect(arguments[i]));
  }
};


function pad (n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp () {
  var d = new Date();
  return  [ d.getDate()
          , months[d.getMonth()]
          , [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':')
          ].join(' ');
}


exports.log = function (msg) {
  exports.puts(timestamp() + ' - ' + msg.toString());
};


var execWarning;
exports.exec = function () {
  if (!execWarning) {
    execWarning = 'sys.exec has moved to the "child_process" module. Please update your source code.'
    error(execWarning);
  }
  return require('child_process').exec.apply(this, arguments);
};


exports.pump = function (readStream, writeStream, callback) {
  var callbackCalled = false;

  function call (a, b, c) {
    if (callback && !callbackCalled) {
      callback(a, b, c);
      callbackCalled = true;
    }
  }

  if (!readStream.pause) readStream.pause = function () {readStream.emit("pause")};
  if (!readStream.resume) readStream.resume = function () {readStream.emit("resume")};

  readStream.addListener("data", function (chunk) {
    if (writeStream.write(chunk) === false) readStream.pause();
  });

  writeStream.addListener("pause", function () {
    readStream.pause();
  });

  writeStream.addListener("drain", function () {
    readStream.resume();
  });

  writeStream.addListener("resume", function () {
    readStream.resume();
  });

  readStream.addListener("end", function () {
    writeStream.end();
  });

  readStream.addListener("close", function () {
    call();
  });

  readStream.addListener("error", function (err) {
    writeStream.end();
    call(err);
  });

  writeStream.addListener("error", function (err) {
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
 *     prototype
 * @param {function} superCtor Constructor function to inherit prototype from
 */
exports.inherits = function (ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false
        }
    });
};
