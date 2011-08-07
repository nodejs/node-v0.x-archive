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


function HexValueOf(code) {
  // 0-9
  if (code >= 48 && code <= 57) return code - 48;
  // A-F
  if (code >= 65 && code <= 70) return code - 55;
  // a-f
  if (code >= 97 && code <= 102) return code - 87;

  return -1;
}


function URIDecodeOctets(octets, result, index) {
  var value;
  var o0 = octets[0];
  while (true) {
    if (o0 < 0x80) {
      value = o0;
    } else if (o0 < 0xc2) {
      break;
    } else {
      var o1 = octets[1];
      if (o0 < 0xe0) {
        var a = o0 & 0x1f;
        if ((o1 < 0x80) || (o1 > 0xbf))
          break;
        var b = o1 & 0x3f;
        value = (a << 6) + b;
        if (value < 0x80 || value > 0x7ff)
          break;
      } else {
        var o2 = octets[2];
        if (o0 < 0xf0) {
          var a = o0 & 0x0f;
          if ((o1 < 0x80) || (o1 > 0xbf))
            break;
          var b = o1 & 0x3f;
          if ((o2 < 0x80) || (o2 > 0xbf))
            break;
          var c = o2 & 0x3f;
          value = (a << 12) + (b << 6) + c;
          if ((value < 0x800) || (value > 0xffff))
            break;
        } else {
          var o3 = octets[3];
          if (o0 < 0xf8) {
            var a = (o0 & 0x07);
            if ((o1 < 0x80) || (o1 > 0xbf))
              break;
            var b = (o1 & 0x3f);
            if ((o2 < 0x80) || (o2 > 0xbf))
              break;
            var c = (o2 & 0x3f);
            if ((o3 < 0x80) || (o3 > 0xbf))
              break;
            var d = (o3 & 0x3f);
            value = (a << 18) + (b << 12) + (c << 6) + d;
            if ((value < 0x10000) || (value > 0x10ffff))
              break;
          } else {
            break;
          }
        }
      }
    }
    if (value < 0x10000) {
      result[index++] = value;
      return index;
    } else {
      result[index++] = (value >> 10) + 0xd7c0;
      result[index++] = (value & 0x3ff) + 0xdc00;
      return index;
    }
  }
  result[index++] = 0xFFFD; // bad_unicode
  return index;
}


var hex_chars_in_url = /(?:%[0-9A-Fa-f]{2})+/g;

function Decode(uri) {
  return uri.replace(hex_chars_in_url, function(code) {
    var length = code.length;
    var result = new Array(length);
    var index = 0;

    for (var k = 0; k < length; k += 3) {
      var cc = HexValueOf(code.charCodeAt(k + 1)) * 16 +
          HexValueOf(code.charCodeAt(k + 2));
      if (cc >> 7) {
        var n = 0;
        while (((cc << ++n) & 0x80) != 0);
        if (n == 1 || n > 4 || k + 3 * n > length) {
          result[index++] = 0xFFFD; // bad_unicode
          continue;
        }
        var octets = new Array(n);
        octets[0] = cc;
        for (var i = 1; i < n; i++) {
          k += 3;
          octets[i] = HexValueOf(code.charCodeAt(k + 1)) * 16 +
              HexValueOf(code.charCodeAt(k + 2));
        }
        index = URIDecodeOctets(octets, result, index);
      } else {
        result[index++] = cc;
      }
    }
    result.length = index;

    // This is faster, but need --allow_natives_syntax flag
    // return %StringFromCharCodeArray(result);
    return String.fromCharCode.apply(null, result);
  });
}


QueryString.unescape = function(s, decodeSpaces) {
  if (decodeSpaces) {
    s = s.replace(/\+/g, ' ');
  }
  return Decode(s);
};


QueryString.escape = function(str) {
  return encodeURIComponent(str);
};

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};


QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  obj = (obj === null) ? undefined : obj;

  switch (typeof obj) {
    case 'object':
      return Object.keys(obj).map(function(k) {
        if (Array.isArray(obj[k])) {
          return obj[k].map(function(v) {
            return QueryString.escape(stringifyPrimitive(k)) +
                   eq +
                   QueryString.escape(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return QueryString.escape(stringifyPrimitive(k)) +
                 eq +
                 QueryString.escape(stringifyPrimitive(obj[k]));
        }
      }).join(sep);

    default:
      if (!name) return '';
      return QueryString.escape(stringifyPrimitive(name)) + eq +
             QueryString.escape(stringifyPrimitive(obj));
  }
};

// Parse a key=val string.
QueryString.parse = QueryString.decode = function(qs, sep, eq) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  qs.split(sep).forEach(function(kvp) {
    var x = kvp.indexOf(eq);
    var k = QueryString.unescape((x == -1) ? kvp : kvp.substring(0, x), true);
    var v = (x == -1) ? '' : QueryString.unescape(kvp.substring(x + 1), true);

    if (!(k in obj)) {
      obj[k] = v;
    } else if (!Array.isArray(obj[k])) {
      obj[k] = [obj[k], v];
    } else {
      obj[k].push(v);
    }
  });

  return obj;
};
