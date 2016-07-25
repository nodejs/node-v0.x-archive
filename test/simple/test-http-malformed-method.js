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

var common = require('../common');
var assert = require('assert');
var http = require('http');

// http token is defined in RFC2616 as...
//   token          = 1*<any CHAR except CTLs or separators>
//   separators     = "(" | ")" | "<" | ">" | "@"
//                  | "," | ";" | ":" | "\" | <">
//                  | "/" | "[" | "]" | "?" | "="
//                  | "{" | "}" | SP | HT
// and redefined in RFC7230 as ...
//   tchar = "!" / "#" / "$" / "%" / "&" / "'" / "*" / "+" / "-" / "." /
//     "^" / "_" / "`" / "|" / "~" / DIGIT / ALPHA
//   token = 1*tchar
// 
// the rfc2616 version tells us what characters are not allowed,
// the rfc7230 version tells us what characters are allowed.

var fail = ['GET\n', 'POST(', 'PUT)', 'GET<', 'DELETE>',
 'MET@HOD', 'GET,', 'GET;', 'POST:', 'METHOD\\',
 'GET"', 'GET/', 'ABC[', 'XYZ]', 'XYZ?', 'XYZ=',
 'ABC{', 'ABC}', '123 ', '123\t'];

var ok = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH',
 'GET!', 'POST#', 'PUT$', 'DELETE%', 'OPTIONS&',
 "GET'", 'POST*', 'PUT+', 'DELETE-', 'OPTIONS.',
 'GET^', 'POST_', 'PUT`', 'DELETE|', 'OPTIONS~',
 'GET~', '1234567890', 'ABCDEFGHHIJKLMNOPQRSTUV',
 'get', 'post', 'put', 'delete', 'options', 'patch',
 'get!', 'post#', 'put$', 'delete%', 'options&',
 "get'", 'post*', 'put+', 'delete-', 'options.',
 'get^', 'post', 'put`', 'delete|', 'options~',
 'get~'
 ];

// These should throw... they include invalid characters
fail.forEach(function(test) {
  assert.throws(
    function() { http.request({method:test}); },
    Error);
});

//These shouldn't throw because the characters are permitted,
//even if the values are not actually good http methods.
ok.forEach(function(test) {
  assert.doesNotThrow(
    function() { 
      http.request({method:test}).on('error', function() {
        // an invalid method won't trigger this.
      }).abort() }
  );
});



