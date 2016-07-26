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

var spawn = require('child_process').spawn;
var assert = require('assert');
var tls = require('tls');
var crypto = process.binding('crypto');
var common = require('../common');
var fs = require('fs');

var V1038Ciphers = tls.getLegacyCiphers('v0.10.38');

function doTest(checklist, additional_args, env) {
  var options;
  if (env) options = {env:env};
  additional_args = additional_args || [];
  var args = additional_args.concat([
    '-e', 'console.log(process.binding(\'crypto\').DEFAULT_CIPHER_LIST)']);
  var out = '';
  spawn(process.execPath, args, options).
    stdout.
      on('data', function(data) {
        out += data;
      }).
      on('end', function() {
        assert.equal(out.trim(), checklist);
      });
}

// test that the command line switchs takes precedence
// over the environment variables
function doTestPrecedence() {
  // test that --cipher-list takes precedence over NODE_CIPHER_LIST
  doTest('ABC', ['--cipher-list=ABC'], {'NODE_CIPHER_LIST': 'XYZ'});

  // test that --enable-legacy-cipher-list takes precedence
  // over NODE_CIPHER_LIST
  doTest(V1038Ciphers,
         ['--enable-legacy-cipher-list=v0.10.38'],
         {'NODE_CIPHER_LIST': 'XYZ'});

  // test that --cipher-list takes precedence over NODE_LEGACY_CIPHER_LIST
  doTest('ABC',
         ['--cipher-list=ABC'],
         {'NODE_LEGACY_CIPHER_LIST': 'v0.10.38'});

  // test that --enable-legacy-cipher-list takes precence over both envars
  doTest(V1038Ciphers,
         ['--enable-legacy-cipher-list=v0.10.38'],
         {
           'NODE_LEGACY_CIPHER_LIST': 'v0.10.39',
           'NODE_CIPHER_LIST': 'XYZ'
         });

  // test the right-most command line option takes precedence
  doTest(V1038Ciphers,
         [
           '--cipher-list=XYZ',
           '--enable-legacy-cipher-list=v0.10.38'
         ]);

   // test the right-most command line option takes precedence
   doTest('XYZ',
          [
            '--enable-legacy-cipher-list=v0.10.38',
            '--cipher-list=XYZ'
          ]);

    // test the right-most command line option takes precedence
    doTest('XYZ',
           [
             '--cipher-list=ABC',
             '--enable-legacy-cipher-list=v0.10.39',
             '--cipher-list=XYZ'
           ]);

    // test that NODE_LEGACY_CIPHER_LIST takes precedence over
    // NODE_CIPHER_LIST
    doTest(V1038Ciphers, [],
           {
             'NODE_LEGACY_CIPHER_LIST': 'v0.10.38',
             'NODE_CIPHER_LIST': 'ABC'
           });
}

// Start running the tests...
doTest(crypto.DEFAULT_CIPHER_LIST); // test the default

// Test the NODE_CIPHER_LIST environment variable
doTest('ABC', [], {'NODE_CIPHER_LIST':'ABC'});

// Test the --cipher-list command line switch
doTest('ABC', ['--cipher-list=ABC']);

// Test the --enable-legacy-cipher-list and NODE_LEGACY_CIPHER_LIST envar
['v0.10.38','v0.10.39','v0.12.2'].forEach(function(arg) {
  var checklist = tls.getLegacyCiphers(arg);
  // command line switch
  doTest(checklist, ['--enable-legacy-cipher-list=' + arg]);
  // environment variable
  doTest(checklist, [], {'NODE_LEGACY_CIPHER_LIST': arg});
});

// Test the precedence order for the various options
doTestPrecedence();

// Test that we throw properly
// invalid value
assert.throws(function() {tls.getLegacyCiphers('foo');}, Error);
// no parameters
assert.throws(function() {tls.getLegacyCiphers();}, TypeError);
// not a string parameter
assert.throws(function() {tls.getLegacyCiphers(1);}, TypeError);
// too many parameters
assert.throws(function() {tls.getLegacyCiphers('abc', 'extra');}, TypeError);
// ah, just right
assert.doesNotThrow(function() {tls.getLegacyCiphers('v0.10.38');});
assert.doesNotThrow(function() {tls.getLegacyCiphers('v0.10.39');});
assert.doesNotThrow(function() {tls.getLegacyCiphers('v0.12.2');});
assert.doesNotThrow(function() {tls.getLegacyCiphers('v0.12.3');});

// Test to ensure default ciphers are not set when v0.10.38 legacy cipher
// switch is used. This is a bit involved... we need to first set up the
// TLS server, then spawn a second node instance using the v0.10.38 cipher,
// then connect and check to make sure the options are correct. Since there
// is no direct way of testing it, an alternate createCredentials shim is
// created that intercepts the call to createCredentials and checks the output.
// The following server code was adopted from test-tls-connect-simple.
// This test spins up a server in order to test that a connection will work
// even without the default ciphers set

// note that the following function is written out to a string and
// passed in as an argument to a child node instance.
var fail_if_default_ciphers_set = (
  function() {
    var tls = require('tls');
    var used_monkey_patch = false;
    var orig_createSecureContext = tls.createSecureContext;
    tls.createSecureContext = function(details) {
      used_monkey_patch = true;
      // since node was started with the --enable-legacy-cipher-list
      // switch equal to v0.10.38, the options.ciphers should be
      // undefined. If it's not undefined, we have a problem and
      // the test fails
      if (details.ciphers !== undefined) {
        console.error(details.ciphers);
        process.exit(1);
      }
      return orig_createSecureContext(details);
    };
    var socket = tls.connect({
      port: 0,
      rejectUnauthorized: false
    }, function() {
      socket.end();
      if (!used_monkey_patch) {
        console.error('monkey patched createSecureContext was not used');
        process.exit(1);
      }
    });
  }
).toString();

// Verifies that the default cipher list is set.
// like fail_if_default_ciphers_set, this is serialized
// out to a string and passed to a new node instance
var fail_if_default_ciphers_not_set = (
  function() {
    var tls = require('tls');
    var used_monkey_patch = false;
    var orig_createSecureContext = tls.createSecureContext;
    tls.createSecureContext = function(details) {
      used_monkey_patch = true;
      // node is not started with --enable-legacy-cipher-list
      if (!details.ciphers) {
        console.error('default ciphers are not set');
        process.exit(1);
      }
      return orig_createSecureContext(details);
    };
    var socket = tls.connect({
      port: 0,
      rejectUnauthorized: false
    }, function() {
      socket.end();
      if (!used_monkey_patch) {
        console.error('monkey patched createSecureContext not used');
      }
    });
  }
).toString();

var test_count = 0;

function doDefaultCipherTest(test, additional_args, env) {
  var options = {};
  if (env) options.env = env;
  var out = '', err = '';
  additional_args = additional_args || [];
  var args = additional_args.concat([
    '-e', require('util').format('(%s)()', test).replace(
      'port: 0', 'port: ' + common.PORT)
  ]);
  var child = spawn(process.execPath, args, options);
  child.stderr.
    on('data', function(data) {
      err += data;
    }).
    on('end', function() {
      if (err !== '') {
        assert.fail(err.substr(0,err.length-1));
      }
    });
}

var options = {
  key: fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
  cert: fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem')
};
var server = tls.Server(options, function(socket) {
  test_count++;
  if (test_count === 4) server.close();
});
server.listen(common.PORT, function() {
  // checks to make sure the default ciphers are *not* set
  // because the --enable-legacy-cipher-list switch is set to
  // v0.10.38
  doDefaultCipherTest(fail_if_default_ciphers_set,
                      ['--enable-legacy-cipher-list=v0.10.38']);

  // checks to make sure the default ciphers are *not* set
  // because the NODE_LEGACY_CIPHER_LIST envar is set to v0.10.38
  doDefaultCipherTest(fail_if_default_ciphers_set,
                      [], {'NODE_LEGACY_CIPHER_LIST': 'v0.10.38'});

  // this variant checks to ensure that the default cipher list IS set
  doDefaultCipherTest(fail_if_default_ciphers_not_set, [], {});

  // test that setting the cipher list explicitly to the v0.10.38
  // string without using the legacy cipher switch causes the
  // default ciphers to be set.
  doDefaultCipherTest(fail_if_default_ciphers_not_set,
                      ['--cipher-list=' + V1038Ciphers], {});
});
