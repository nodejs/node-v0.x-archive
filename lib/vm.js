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

var binding = process.binding('evals');

exports.Script = binding.NodeScript;
exports.createScript = function(code, ctx, name) {
  return new exports.Script(code, ctx, name);
};

exports.createContext = binding.NodeScript.createContext;
exports.runInContext = binding.NodeScript.runInContext;
exports.runInThisContext = binding.NodeScript.runInThisContext;
exports.runInNewContext = binding.NodeScript.runInNewContext;

exports.runInNewSafeContext = function(code, context) {
  var middleContext = {};
  middleContext.middleContext = middleContext;
  middleContext.subGlobal = context;
  middleContext.g_code = code;
  middleContext.runInNewContext = binding.NodeScript.runInNewContext;
  var copyingClosure = (function() {
    function deepClone(obj) {
      var type = typeof obj;
      if (type==='undefined' || obj===null || type==='boolean' || type==='number' || type==='string') {
        return obj;
      }
      if (type==='function') {
        return function() {
          obj.apply(this, arguments);
        };
      }
      if (type==='object') {
        var toReturn = Array.isArray(obj) ? [] : {};
        var objKeys = Object.getOwnPropertyNames(obj);
        for (var i=0; i<objKeys.length; i++) {
          toReturn[objKeys[i]] = deepClone(obj[objKeys[i]]);
        }
        return toReturn;
      }
      throw new Error('unknown typeof result: "'+type+'"');
    }
    subGlobal = deepClone(subGlobal);
  }).toString();
  var newCode = "("+copyingClosure+")();"
  var protectiveRecursion = (function() {
    if (!this || !this.goOn) {
      return arguments.callee.call({goOn: true});
    }
    var code = g_code;
    delete middleContext.g_code;
    var run = runInNewContext;
    delete middleContext.runInNewContext;
    delete middleContext.middleContext;
    return run(code, subGlobal);
  }).toString();
  newCode += "("+protectiveRecursion+")()";
  return binding.NodeScript.runInNewContext(newCode, middleContext);
}
