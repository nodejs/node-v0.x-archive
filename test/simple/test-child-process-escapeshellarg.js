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

if (process.argv.length >= 3
      && process.argv[2] === 'testing-child-process-escapeshellarg') {
  process.argv.forEach(function(arg, index) {
    if (index > 3) {
      process.stdout.write('\n');
    }
    if (index > 2) {
      process.stdout.write(arg);
    }
  });
  process.exit(0);
}
var assert = require('assert');
var exec = require('child_process').exec;
var escapeShellArg = require('child_process').escapeShellArg;

var testParameters = [
  'simple',
  'with some spaces',
  'with "double quotes"',
  'with <redirection> or |pipe|',
  'with *some* $special \char/',
  '$1',
  '%1',
  'Hi\tThere!',
  '/var/*',
  '\t'
];

var error_count = 0;
var mismatched_count = 0;
var success_count = 0;

testParameters.forEach(function(testParameter) {
  var commandLine = 'node ' + escapeShellArg(__filename)
    + ' testing-child-process-escapeshellarg ' + escapeShellArg(testParameter);
  exec(commandLine, function(error, stdout, stderr) {
    if (error) {
      error_count++;
      console.log('error!: ' + error.code);
      console.log('stdout: ' + JSON.stringify(stdout));
      console.log('stderr: ' + JSON.stringify(stderr));
      assert.equal(false, error.killed);
    } else {
      var received = stdout.toString();
      if (received !== testParameter) {
        mismatched_count++;
        console.log(commandLine + '\nSent parameter: >' + testParameter
		    + '< received parameter >' + received + '<');
      }
      else {
        success_count++;
      }
    }
  });
});

process.on('exit', function() {
  assert.equal(0, error_count);
  assert.equal(0, mismatched_count);
  assert.equal(testParameters.length, success_count);
});
