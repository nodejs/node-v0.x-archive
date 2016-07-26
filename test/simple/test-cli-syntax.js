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

var assert = require('assert');
var spawnSync = require('child_process').spawnSync;
var path = require('path');

var common = require('../common');

var node = process.argv[0];

// test both sets of arguments that check syntax
var syntax_args = [
  ['-c'],
  ['--check']
];

// test good syntax with and without shebang
[
  'syntax/good_syntax.js',
  'syntax/good_syntax_shebang.js'
].forEach(function(file) {
  file = path.join(common.fixturesDir, file);

  // loop each possible option, `-c` or `--check`
  syntax_args.forEach(function(args) {
    var _args = args.concat([file]);
    console.log('calling %s %s', node, _args.join(' '));
    var c = spawnSync(node, _args, {encoding: 'utf8'});

    // no output should be produced
    assert.equal(c.stdout, '', 'stdout produced');
    assert.equal(c.stderr, '', 'stderr produced');
    assert.equal(c.status, 0, 'code == ' + c.status);
    console.log('ok');
  });
});

// test bad syntax with and without shebang
[
  'syntax/bad_syntax.js',
  'syntax/bad_syntax_shebang.js'
].forEach(function(file) {
  file = path.join(common.fixturesDir, file);

  // loop each possible option, `-c` or `--check`
  syntax_args.forEach(function(args) {
    var _args = args.concat([file]);
    console.log('calling %s %s', node, _args.join(' '));
    var c = spawnSync(node, _args, {encoding: 'utf8'});

    // no output should be produced
    assert.equal(c.stdout, '', 'stdout produced');
    assert(c.stderr, 'stderr not produced');
    assert.equal(c.status, 1, 'code == ' + c.status);
    console.log('ok');
  });
});
