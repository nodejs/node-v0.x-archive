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
var spawn = require('child_process').spawn;

// A function to start a node process,
// feed it some input, then test its output
function testOutput(args, input, expectOut) {
  var child = spawn(process.execPath, args);

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function(c) {
    throw new Error('child.stderr be silent');
  });

  child.stdout.setEncoding('utf8');
  var out = '';
  child.stdout.on('data', function(c) {
    out += c;
  });
  child.stdout.on('end', function() {
    assert(expectOut.test(out));
  });

  child.stdin.end(input);
}

// tab completion should output completion candidates
// even if output column width is undefined.
var args = ['-e', 'require("repl").start({terminal: true});'];
var input = [
  'var obj = {\n',
  '  abaaaaaaaaaaaar: 1,\n',
  '  abaaaaaaaaaaaaz: 1,\n',
  '  afooooooooooooo: 1,\n',
  '  aquuuuuuuuuuuux: 1,\n',
  '  axyzzyyyyyyyyyy: 1\n',
  '};\n',
  'obj.a\t'
].join('');
var expectOut = new RegExp([
  'obj.abaaaaaaaaaaaar\r\n',
  'obj.abaaaaaaaaaaaaz\r\n',
  'obj.afooooooooooooo\r\n',
  'obj.aquuuuuuuuuuuux\r\n',
  'obj.axyzzyyyyyyyyyy\r\n'
].join(''));

testOutput(args, input, expectOut);

// tab completion should output completion candidates
// in columns which fit within the specified output column width
var args = ['-e', 'process.stdout.columns=80;require("repl").start({terminal: true});'];
var expectOut = new RegExp([
  'obj.abaaaaaaaaaaaar  obj.abaaaaaaaaaaaaz  obj.afooooooooooooo\r\n',
  'obj.aquuuuuuuuuuuux  obj.axyzzyyyyyyyyyy  \r\n'
].join(''));

testOutput(args, input, expectOut);
