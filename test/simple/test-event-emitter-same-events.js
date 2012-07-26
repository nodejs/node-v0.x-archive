var common = require('../common');
var assert = require('assert');
var events = require('events');

var calls = 0;

var emitter = new events.EventEmitter();

function listener() {
  calls++;
}

emitter.on('message', listener);
emitter.on('message', listener);
emitter.on('message', listener);
emitter.emit('message');
assert.equal(calls, 1);

emitter.emit('message');
assert.equal(calls, 2);
