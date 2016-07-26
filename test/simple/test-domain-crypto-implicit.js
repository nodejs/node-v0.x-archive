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



try {
  var crypto = require('crypto');
} catch (e) {
  console.log('Not compiled with OPENSSL support.');
  process.exit();
}

var common = require('../common');
var assert = require('assert');
var domain = require('domain');
var events = require('events');
var caught = 0;
var expectCaught = 3;

var d = new domain.Domain();

d.on('error', function(er) {
  console.error('caught', er);

  assert.strictEqual(er.domain, d);
  assert.strictEqual(er.domain_thrown, true);
  assert.ok(!er.domain_emitter);
  assert.strictEqual(er.message, 'TEST');

  caught++;
});

process.on('exit', function() {
  console.error('exit');
  assert.equal(caught, expectCaught);
  console.log('ok');
});


// implicit handling of thrown errors while in a domain, via the
// single entry points of ReqWrap and MakeCallback.  Even if
// we try very hard to escape, there should be no way to, even if
// we go many levels deep through timeouts and multiple IO calls.
// Everything that happens between the domain.enter() and domain.exit()
// calls will be bound to the domain, even if multiple levels of
// handles are created.
d.run(function() {
  crypto.randomBytes(8, function() { throw new Error("TEST"); });
  crypto.pseudoRandomBytes(8, function() { throw new Error("TEST"); });
  crypto.pbkdf2('password', 'salt', 8, 8, function() { throw new Error("TEST"); });
});

