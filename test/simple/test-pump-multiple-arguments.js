var assert = require('assert')
  , util = require('util')
  ;

var src = new process.EventEmitter
  , dst = new process.EventEmitter
  ;

function assert_all_argument_passed_through(arg1, arg2, arg3) {
  assert.equal("a", arg1);
  assert.equal("b", arg2);
  assert.equal("c", arg3);
}
src.on('data', assert_all_argument_passed_through);
dst.write =    assert_all_argument_passed_through;
util.pump(src, dst);
src.emit('data', 'a', 'b', 'c');
