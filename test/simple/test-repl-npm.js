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
var path = require('path');
// path to node compiled node exec
var node_path = path.join(common.testDir, '../node');

var spawn = require('child_process').spawn;

var npm_cmd_executed = false;

// The npm command in a REPL should ONLY exist
// for the global REPL created when node is executed.
// It should not exist for any other REPL.
// give me an interactive node process
var npm_test = spawn(node_path,['-i']);

// make my life easy
npm_test.stdout.setEncoding('utf8');
npm_test.stderr.setEncoding('utf8');

// check
npm_test.stdout.on('data', function(chunk) {
  if (chunk === '> ') {
    // this is the default prompt, ignore
  } else if (chunk === 'npm whoami\n(just prints the \'username\' config)\n') {
    npm_cmd_executed = true;
    npm_test.kill();

    // there is an assert below, but that assert
    // will always be executed before this callback
    // is executed.  So it is safe to exit
    // becuase we can only here if the assert below
    // has passed
    process.exit();
  } else {
    assert.fail('UnExpected output: ' + chunk);
  }
});

npm_test.stderr.on('data', function(chunk) {
  assert.fail('UnExpected error output: ' + chunk);
});

// send an npm command with simple output
npm_test.stdin.write('.npm whoami -h\n');

// Now we need to make sure that npm is NOT a
// command avaliable inside the default REPL

var repl = require('repl');
var testMe = repl.start('');

// test (assert refered to above)
assert(!testMe.commands['.npm'], 'npm should not be on this REPL');

// catch all to make sure we fail safe
setTimeout(function() {
  if (!npm_cmd_executed) {
    npm_test.kill();
    assert.fail('npm command never executed');
  }
  process.exit();
}, 1000);

