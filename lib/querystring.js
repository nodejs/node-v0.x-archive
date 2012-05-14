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

// Query String Utilities

var QueryString = exports;
//var urlDecode = process.binding('http_parser').urlDecode;


// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// a safe fast alternative to decodeURIComponent
QueryString.unescapeBuffer = function(s, decodeSpaces) {
  var out = new Buffer(s.length);
  var state = 'CHAR'; // states: CHAR, HEX0, HEX1
  var n, m, hexchar;

  for (var inIndex = 0, outIndex = 0; inIndex <= s.length; inIndex++) {
    var c = s.charCodeAt(inIndex);
    if (state === 'CHAR') {
      if (c === 37 /* '%' */ ) {
          n = 0;
          m = 0;
          state = 'HEX0';
      }
      else if (decodeSpaces && c === 43 /* '+' */ ) {
        out[outIndex++] = 32 /* ' ' */ ;
      }
      else out[outIndex++] = c;
    }
    else if (state === 'HEX0') {
      state = 'HEX1';
      hexchar = c;
      if (48 /* '0' */  <= c && c <= 57 /* '9' */ ) {
        n = c - 48 /* '0' */ ;
      } else if (97 /* 'a' */  <= c && c <= 102 /* 'f' */ ) {
        n = c - 97 /* 'a' */  + 10;
      } else if (65 /* 'A' */  <= c && c <= 70 /* 'F' */ ) {
        n = c - 65 /* 'A' */  + 10;
      } else {
        out[outIndex++] = 37 /* '%' */ ;
        out[outIndex++] = c;
        state = 'CHAR';
      }
    }
    else if (state === 'HEX1') {
        state = 'CHAR';
        if (48 /* '0' */  <= c && c <= 57 /* '9' */ ) {
          m = c - 48 /* '0' */ ;
        } else if (97 /* 'a' */  <= c && c <= 102 /* 'f' */ ) {
          m = c - 97 /* 'a' */  + 10;
        } else if (65 /* 'A' */  <= c && c <= 70 /* 'F' */ ) {
          m = c - 65 /* 'A' */  + 10;
        } else {
          out[outIndex++] = 37 /* '%' */ ;
          out[outIndex++] = hexchar;
          out[outIndex++] = c;
          continue;
        }
        out[outIndex++] = 16 * n + m;
    }
  }

  // TODO support returning arbitrary buffers.

  return out.slice(0, outIndex - 1);
};


QueryString.unescape = function(s, decodeSpaces) {
  return QueryString.unescapeBuffer(s, decodeSpaces).toString();
};


QueryString.escape = function(str) {
  return encodeURIComponent(str);
};

var stringifyPrimitive = function(v) {
  if (typeof v === 'string') return v;
  if (typeof v === 'boolean'){
    if(v) return 'true';
    return 'false';
  }
  if (typeof v === 'number' && isFinite(v)) {
    return v;
  }
  return '';
};


QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
  if (!sep) sep = '&';
  if (!eq) eq = '=';
  if (obj === null) obj = undefined;

  if (typeof obj === 'object'){
    return Object.keys(obj).map(function(k) {
      var ks = QueryString.escape(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + QueryString.escape(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + QueryString.escape(stringifyPrimitive(obj[k]));
      }
    }).join(sep);
  }

  if(!name) return '';

  return QueryString.escape(stringifyPrimitive(name)) + eq +
         QueryString.escape(stringifyPrimitive(obj));
};

// Parse a key=val string.
QueryString.parse = QueryString.decode = function(qs, sep, eq, options) {
  if (!sep) sep = '&';
  if (!eq) eq = '=';

  var obj = {},
      maxKeys = 1000;

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  // Handle maxKeys = 0 case
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && qs.length > maxKeys) {
    qs = qs.slice(0, maxKeys);
  }

  for (var i = 0, len = qs.length; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr = x.substr(0, idx),
        vstr = x.substr(idx + 1), k, v;

    if (kstr === '' && vstr !== '') {
      kstr = vstr;
      vstr = '';
    }

    try {
      k = decodeURIComponent(kstr);
      v = decodeURIComponent(vstr);
    } catch (e) {
      k = QueryString.unescape(kstr, true);
      v = QueryString.unescape(vstr, true);
    }

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};