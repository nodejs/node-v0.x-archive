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


// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}


function charCode(c) {
  return c.charCodeAt(0);
}

var escapeTokens = {
  percent: '%'.charCodeAt(0),
  plus: '+'.charCodeAt(0),
  space: ' '.charCodeAt(0),
  zero: '0'.charCodeAt(0),
  nine: '9'.charCodeAt(0),
  a: 'a'.charCodeAt(0),
  f: 'f'.charCodeAt(0),
  z: 'z'.charCodeAt(0),
  A: 'A'.charCodeAt(0),
  F: 'F'.charCodeAt(0),
  Z: 'Z'.charCodeAt(0)
};

// a safe fast alternative to decodeURIComponent
QueryString.unescapeBuffer = function(s, decodeSpaces) {
  var out = new Buffer(s.length);
  var state = 'CHAR'; // states: CHAR, HEX0, HEX1
  var n, m, hexchar;

  for (var inIndex = 0, outIndex = 0; inIndex <= s.length; inIndex++) {
    var c = s.charCodeAt(inIndex);
    switch (state) {
      case 'CHAR':
        switch (c) {
          case escapeTokens.percent:
            n = 0;
            m = 0;
            state = 'HEX0';
            break;
          case escapeTokens.plus:
            if (decodeSpaces) c = escapeTokens.space;
            // pass thru
          default:
            out[outIndex++] = c;
            break;
        }
        break;

      case 'HEX0':
        state = 'HEX1';
        hexchar = c;
        if (escapeTokens.zero <= c && c <= escapeTokens.nine) {
          n = c - escapeTokens.zero;
        } else if (escapeTokens.a <= c && c <= escapeTokens.f) {
          n = c - escapeTokens.a + 10;
        } else if (escapeTokens.A <= c && c <= escapeTokens.F) {
          n = c - escapeTokens.A + 10;
        } else {
          out[outIndex++] = escapeTokens.percent;
          out[outIndex++] = c;
          state = 'CHAR';
          break;
        }
        break;

      case 'HEX1':
        state = 'CHAR';
        if (escapeTokens.zero <= c && c <= escapeTokens.nine) {
          m = c - escapeTokens.zero;
        } else if (escapeTokens.a <= c && c <= escapeTokens.f) {
          m = c - escapeTokens.a + 10;
        } else if (escapeTokens.A <= c && c <= escapeTokens.F) {
          m = c - escapeTokens.A + 10;
        } else {
          out[outIndex++] = escapeTokens.percent;
          out[outIndex++] = hexchar;
          out[outIndex++] = c;
          break;
        }
        out[outIndex++] = 16 * n + m;
        break;
    }
  }

  // TODO support returning arbitrary buffers.

  return out.slice(0, outIndex - 1);
};

QueryString.unescape = function(s, decodeSpaces) {
  return QueryString.unescapeBuffer(s, decodeSpaces).toString();
};

QueryString.escapeBuffer = function(s, encodeSpaces) {
  var r;

  if (!(s instanceof Buffer)) {
    r = encodeURIComponent(s);
    if (encodeSpaces) r = r.replace('%20', '+');
    return r;
  }

  var i, len, et = escapeTokens;
  len = s.length;
  r = Array(len);

  for (i = 0; i < len; i++) {
    var n = s[i];
    switch (true) {
      // alphanumerics can be passed as is
      case et.zero <= n && n <= et.nine:
      case et.a <= n && n <= et.z:
      case et.A <= n && n <= et.Z:
        r[i] = String.fromCharCode(n);
        break;
      // space can be converted to plus if needed
      case encodeSpaces && n === et.space:
        r[i] = '+';
        break;
      // convert all other characters to %hh notation
      default:
        r[i] = '%' + (n.toString(16));
    }
  }

  return r.join('');
};

QueryString.escape = function(s, encodeSpaces) {
  return QueryString.escapeBuffer(s, encodeSpaces);
};

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    case 'object':
      if (v instanceof Buffer) {
        return v;
      }

    default:
      return '';
  }
};


QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object' && !(obj instanceof Buffer)) {
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

  if (!name) return '';
  return QueryString.escape(stringifyPrimitive(name)) + eq +
         QueryString.escape(stringifyPrimitive(obj));
};

// Parse a key=val string.
QueryString.parse = QueryString.decode = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
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
