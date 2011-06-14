// This file is derived from RFC 3492 written by Adam M. Costello.
//
// Disclaimer and license: Regarding this entire document or any portion
// of it (including the pseudocode and C code), the author makes no
// guarantees and is not responsible for any damage resulting from its use.
// The author grants irrevocable permission to anyone to use, modify,
// and distribute it in any way that does not diminish the rights of
// anyone else to use, modify, and distribute it, provided that
// redistributed derivative works do not contain misleading author or
// version information. Derivative works need not be licensed under
// similar terms.
//
// Copyright (C) The Internet Society (2003).  All Rights Reserved.
//
// This document and translations of it may be copied and furnished to
// others, and derivative works that comment on or otherwise explain it
// or assist in its implementation may be prepared, copied, published
// and distributed, in whole or in part, without restriction of any
// kind, provided that the above copyright notice and this paragraph are
// included on all such copies and derivative works.  However, this
// document itself may not be modified in any way, such as by removing
// the copyright notice or references to the Internet Society or other
// Internet organizations, except as needed for the purpose of
// developing Internet standards in which case the procedures for
// copyrights defined in the Internet Standards process must be
// followed, or as required to translate it into languages other than
// English.
//
// The limited permissions granted above are perpetual and will not be
// revoked by the Internet Society or its successors or assigns.
//
// This document and the information contained herein is provided on an
// "AS IS" basis and THE INTERNET SOCIETY AND THE INTERNET ENGINEERING
// TASK FORCE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO ANY WARRANTY THAT THE USE OF THE INFORMATION
// HEREIN WILL NOT INFRINGE ANY RIGHTS OR ANY IMPLIED WARRANTIES OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
//
// Javascript Punycode converter derived from example in RFC3492.
// This implementation is created by some@domain.name and released
// into public domain.
//
// Adaptation and modifications to pass JSLint made by Jeremy Selier.

exports.toASCII = encodeToASCII;
exports.toUnicode = encodeToUnicode;

// Reference: RFC 3490, RFC 3491, RFC 3492

function Punycode() {
  // this object converts to and from puny-code used in IDN
  var utf16 = {
    // the utf16-class is necessary to convert from javascripts internal
    // character representation to unicode and back.
    decode: function(input) {
      var output = [];
      var i = 0;
      var len = input.length;
      var value, extra;
      while (i < len) {
        value = input.charCodeAt(i++);
        if ((value & 0xF800) === 0xD800) {
          extra = input.charCodeAt(i++);
          if (((value & 0xFC00) !== 0xD800) || ((extra & 0xFC00) !== 0xDC00)) {
            throw new RangeError('UTF-16(decode): Illegal UTF-16 sequence');
          }
          value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
        }
        output.push(value);
      }
      return output;
    },
    encode: function(input) {
      var output = [];
      var i = 0;
      var len = input.length;
      var value;
      while (i < len) {
        value = input[i++];
        if ((value & 0xF800) === 0xD800) {
          throw new RangeError('UTF-16(encode): Illegal UTF-16 value');
        }
        if (value > 0xFFFF) {
          value -= 0x10000;
          output.push(String.fromCharCode(((value >>> 10) & 0x3FF) | 0xD800));
          value = 0xDC00 | (value & 0x3FF);
        }
        output.push(String.fromCharCode(value));
      }
      return output.join('');
    }
  };

  var initial_n = 0x80;
  var initial_bias = 72;
  var delimiter = '\x2D';
  var base = 36;
  var damp = 700;
  var tmin = 1;
  var tmax = 26;
  var skew = 38;
  var maxint = 0x7FFFFFFF;

  // decode_digit(cp) returns the numeric value of a basic code
  // point (for use in representing integers) in the range 0 to
  // base-1, or base if cp is does not represent a value.
  function decode_digit(cp) {
    return cp - 48 < 10 ? cp - 22 :
           cp - 65 < 26 ? cp - 65 :
           cp - 97 < 26 ? cp - 97 : base;
  }

  // encode_digit(d,flag) returns the basic code point whose value
  // (when used for representing integers) is d, which needs to be in
  // the range 0 to base-1. The lowercase form is used unless flag is
  // nonzero, in which case the uppercase form is used. The behavior
  // is undefined if flag is nonzero and digit d has no uppercase form.
  function encode_digit(d, flag) {
    //  0..25 map to ASCII a..z or A..Z
    // 26..35 map to ASCII 0..9
    return d + 22 + 75 * (d < 26) - ((flag != 0) << 5);
  }

  // bias adaptation function
  function adapt(delta, numpoints, firsttime) {
    var k;
    delta = firsttime ? Math.floor(delta / damp) : (delta >> 1);
    delta += Math.floor(delta / numpoints);

    for (k = 0; delta > (((base - tmin) * tmax) >> 1); k += base) {
      delta = Math.floor(delta / (base - tmin));
    }
    return Math.floor(k + (base - tmin + 1) * delta / (delta + skew));
  }

  // encode_basic(bcp,flag) forces a basic code point to lowercase if flag
  // is zero, uppercase if flag is nonzero, and returns the resulting code
  // point. The code point is unchanged if it is caseless.
  // The behavior is undefined if bcp is not a basic code point.
  function encode_basic(bcp, flag) {
    bcp -= (bcp - 97 < 26) << 5;
    return bcp + ((!flag && (bcp - 65 < 26)) << 5);
  }

  // main decode function
  this.decode = function(input, preserveCase) {
    var output = [];
    var case_flags = [];
    var input_length = input.length;
    var n = initial_n;
    var i = 0;
    var bias = initial_bias;

    // Handle the basic code points: Let basic be the number of input code
    // points before the last delimiter, or 0 if there is none, then
    // copy the first basic code points to the output.
    var basic = input.lastIndexOf(delimiter);
    if (basic < 0) basic = 0;

    for (var j = 0; j < basic; ++j) {
      if (preserveCase) {
        case_flags[output.length] = (input.charCodeAt(j) - 65 < 26);
      }
      if (input.charCodeAt(j) >= 0x80) {
        throw new RangeError('Illegal input >= 0x80');
      }
      output.push(input.charCodeAt(j));
    }

    // Main decoding loop: Start just after the last delimiter if any
    // basic code points were copied; start at the beginning otherwise.
    for (var ic = basic > 0 ? basic + 1 : 0; ic < input_length;) {
      // ic is the index of the next character to be consumed,

      // Decode a generalized variable-length integer into delta,
      // which gets added to i. The overflow checking is easier
      // if we increase i as we go, then subtract off its starting
      // value at the end to obtain delta.
      var oldi, w, k;
      for (oldi = i, w = 1, k = base;; k += base) {
        if (ic >= input_length) {
          throw RangeError('punycode_bad_input(1)');
        }
        var digit = decode_digit(input.charCodeAt(ic++));
        if (digit >= base) {
          throw RangeError('punycode_bad_input(2)');
        }
        if (digit > Math.floor((maxint - i) / w)) {
          throw RangeError('punycode_overflow(1)');
        }
        i += digit * w;
        var t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
        if (digit < t) {
          break;
        }
        if (w > Math.floor(maxint / (base - t))) {
          throw RangeError('punycode_overflow(2)');
        }
        w *= (base - t);
      }

      var out = output.length + 1;
      bias = adapt(i - oldi, out, oldi === 0);

      // i was supposed to wrap around from out to 0,
      // incrementing n each time, so we'll fix that now:
      if (Math.floor(i / out) > maxint - n) {
        throw RangeError('punycode_overflow(3)');
      }
      n += Math.floor(i / out);
      i %= out;

      // Insert n at position i of the output:
      // Case of last character determines uppercase flag:
      if (preserveCase) {
        case_flags.splice(i, 0, input.charCodeAt(ic - 1) - 65 < 26);
      }

      output.splice(i, 0, n);
      i++;
    }

    if (preserveCase) {
      var len;
      for (i = 0, len = output.length; i < len; i++) {
        if (case_flags[i]) {
          output[i] = (String.fromCharCode(output[i]).toUpperCase())
                      .charCodeAt(0);
        }
      }
    }
    return utf16.encode(output);
  }

  // main encode function
  this.encode = function(input, preserveCase) {
    // bias adaptation function
    var h, b, j, m, q, k, t, ijv, case_flags;

    if (preserveCase) {
      // preserve case, step1 of 2: Get a list of the unaltered string
      case_flags = utf16.decode(input);
    }
    // converts the input in UTF-16 to Unicode
    input = utf16.decode(input.toLowerCase());

    // cache the length
    var input_length = input.length;

    if (preserveCase) {
      // preserve case, step2 of 2: Modify the list to true/false
      for (j = 0; j < input_length; j++) {
        case_flags[j] = input[j] != case_flags[j];
      }
    }

    var output = [];
    var n = initial_n;
    var delta = 0;
    var bias = initial_bias;

    // Handle the basic code points:
    for (j = 0; j < input_length; ++j) {
      if (input[j] < 0x80) {
        output.push(String.fromCharCode(case_flags ?
                      encode_basic(input[j], case_flags[j]) : input[j]
                    ));
      }
    }

    h = b = output.length;

    // h is the number of code points that have been handled, b is the
    // number of basic code points
    if (b > 0) output.push(delimiter);

    // Main encoding loop:
    while (h < input_length) {
      // All non-basic code points < n have been
      // handled already. Find the next larger one:
      for (m = maxint, j = 0; j < input_length; ++j) {
        ijv = input[j];
        if (ijv >= n && ijv < m) m = ijv;
      }

      // Increase delta enough to advance the decoder's
      // <n,i> state to <m,0>, but guard against overflow:
      if (m - n > Math.floor((maxint - delta) / (h + 1))) {
        throw RangeError('punycode_overflow (1)');
      }
      delta += (m - n) * (h + 1);
      n = m;

      for (j = 0; j < input_length; ++j) {
        ijv = input[j];
        if (ijv < n) {
          if (++delta > maxint) return Error('punycode_overflow(2)');
        }
        if (ijv == n) {
          // Represent delta as a generalized variable-length integer:
          for (q = delta, k = base;; k += base) {
            t = k <= bias ? tmin : k >= bias + tmax ? tmax : k - bias;
            if (q < t) break;
            output.push(String.fromCharCode(
                          encode_digit(t + (q - t) % (base - t), 0)
                        ));
            q = Math.floor((q - t) / (base - t));
          }
          output.push(String.fromCharCode(
                        encode_digit(q, preserveCase && case_flags[j] ? 1 : 0)
                      ));
          bias = adapt(delta, h + 1, h == b);
          delta = 0;
          ++h;
        }
      }

      ++delta;
      ++n;
    }
    return output.join('');
  }
}

// Returns a puny coded representation of "domain".
// It only converts the part of the domain name that
// has non ASCII characters. I.e. it dosent matter if
// you call it with a domain that already is in ASCII.
function encodeToASCII(domain) {
  var punycode = new Punycode();
  var domain_array = domain.split('.');
  var out = [];
  for (var i = 0; i < domain_array.length; ++i) {
    var s = domain_array[i];
    out.push(s.match(/[^A-Za-z0-9-]/) ?
             'xn--' + punycode.encode(s) :
             s
    );
  }
  return out.join('.');
}

// Converts a puny-coded domain name to unicode.
// It only converts the puny-coded parts of the domain name.
// I.e. it dosent matter if you call it on a string
// that already has been converted to unicode.
function encodeToUnicode(domain) {
  var punycode = new Punycode();
  var domain_array = domain.split('.');
  var out = [];
  for (var i = 0; i < domain_array.length; ++i) {
    var s = domain_array[i];
    out.push(s.match(/^xn--/) ?
             punycode.decode(s.slice(4)) :
             s
    );
  }
  return out.join('.');
}
