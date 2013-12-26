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
var events = require('events');

var actual = 0;
var expected = 0;

process.on('exit', function() {
  assert.equal(actual, expected);
});

function noop() { }
function noop2() { }

var s = [];
var obs = events.createObserver({
  before: function before(context, storage) {
    assert.equal(s, storage);
    assert.equal(s[0], context);
    actual++;
  }
}, s);


// Check before callback works when attaching to existing emitter.
var e = new events();
e.on('test', noop);
events.attachObserver(e, obs);
s[0] = e;
e.emit('test');
expected++;


// Check running multiple emitters.
events.addObserver(obs);

var e1 = new events();
var e2 = new events();

e1.on('test', noop);
e2.on('test', noop);

s[0] = e1;
e1.emit('test');
expected++;

s[0] = e2;
e2.emit('test');
expected++;

events.removeObserver(obs);


// Check before callback works when attaching to existing emitter with
// multiple listeners on the same event.
var e = new events();
e.on('test', noop);
e.on('test', noop2);
events.attachObserver(e, obs);
s[0] = e;
e.emit('test');
expected += 2;


// Check running multiple emitters with multiple listeners.
events.addObserver(obs);

var e1 = new events();
var e2 = new events();

e1.on('test', noop);
e1.on('test', noop2);
e2.on('test', noop);
e2.on('test', noop2);

s[0] = e1;
e1.emit('test');
expected += 2;

s[0] = e2;
e2.emit('test');
expected += 2;

events.removeObserver(obs);
