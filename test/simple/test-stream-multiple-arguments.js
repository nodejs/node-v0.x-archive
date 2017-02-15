var assert = require('assert')
  , stream = require('stream')
  ;

var src = new stream.Stream
  , dst = new stream.Stream
  ;

src.readable = true;
dst.writable = true;

function assert_all_argument_passed_through(arg1, arg2, arg3) {
  assert.equal("a", arg1);
  assert.equal("b", arg2);
  assert.equal("c", arg3);
}
src.on('data', assert_all_argument_passed_through);
dst.write =    assert_all_argument_passed_through;
src.pipe(dst);
src.emit('data', 'a', 'b', 'c');
