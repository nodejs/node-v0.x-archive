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

// Provides access to the localization bundles. Use is pretty simple
//
// var bundle = require('_bundle');
// console.log(bundle("KEY", "fallback"))
//
// printf format is supported
// this is intended to be used only from within the node core lib.
// Note: this currently uses an max buffer size of 200 chars.

var l10n = process.binding('node_l10n');
var util = require("util");

module.exports = function(key, fallback /** [, varargs] **/) {
  var args = Array.prototype.slice.call(arguments,2);
  args.unshift(l10n.fetch(key, fallback));
  return util.format.apply(this, args);
};

Object.defineProperty(module.exports, 'locale', {
  value: l10n.locale
});
Object.defineProperty(module.exports, 'icu', {
  value: l10n.icu
});
