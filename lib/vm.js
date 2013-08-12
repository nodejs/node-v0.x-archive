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

var binding = process.binding('contextify');
var util = require('util');

exports.createScript = function(code, filename) {
  return new binding.ContextifyScript(code, filename);
};

exports.createContext = function(initSandbox) {
  if (util.isUndefined(initSandbox)) {
    initSandbox = {};
  }

  var context = new binding.ContextifyContext(initSandbox);
  binding.associateContextifyContext(initSandbox, context);

  return initSandbox;
};

exports.runInContext = function(code, sandbox, filename, timeout) {
  var script = exports.createScript(code, filename);
  return script.runInContext(sandbox, timeout);
};

exports.runInNewContext = function(code, sandbox, filename, timeout) {
  var script = exports.createScript(code, filename);
  sandbox = exports.createContext(sandbox);
  return script.runInContext(sandbox, timeout);
};

exports.runInThisContext = function(code, filename, timeout) {
  var script = exports.createScript(code, filename);
  return script.runInThisContext(timeout);
};

exports.Script = binding.ContextifyScript;
