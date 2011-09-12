

var common = require('../common');
var assert = require('assert');
var util = require('util');

var e, ex;

assert.equal(typeof util.errnoException, 'function', 
              'errnoException API missing');

e = util.errnoException();
//console.log('  From empty args I see \n', e);

assert.ok(e instanceof Error,         'return object is not an Error object');
assert.equal(e.errno,  undefined,     'e.errno set unexpectedly');
assert.equal(e.code,   undefined,     'e.code set unexpectedly');
assert.equal(e.path,   undefined,     'e.path set unexpectedly');
assert.notEqual(e.message, undefined, 'e.message was not set');

e = util.errnoException(2, 'foobar');
//console.log('  From (2,foobar) args \n', e);

assert.ok(e instanceof Error,         'return object is not an Error object');
assert.equal(e.errno, 2,              'value 2 not set into e.errno');
assert.equal(e.code,  2,              'value 2 not set into e.code');
assert.equal(e.path,  undefined,      'e.path set unexpectedly');
assert.notEqual(e.message, undefined, 'e.message was not set');


e = util.errnoException('ENOENT', 'foobar');
//console.log('  From (ENOENT,foobar) args \n', e);

assert.ok(e instanceof Error,         'return object is not an Error object');
assert.equal(e.code,   'ENOENT',      'ENOENT not set into e.code');
assert.equal(e.errno,  2,             'ENOENT not translated to number value 2');
assert.equal(e.path,   undefined,     'e.path set unexpectedly');
assert.notEqual(e.message, undefined, 'e.message was not set');


e = util.errnoException('ENOENT', 'foobar', 'baz');
//console.log('  From (ENOENT,foobar,baz) args \n', e);

assert.ok(e instanceof Error,         'return object is not an Error object');
assert.equal(e.code,   'ENOENT',      'ENOENT not set into e.code');
assert.equal(e.errno,  2,             'ENOENT not translated to number value 2');
assert.equal(e.path,   undefined,     'e.path set unexpectedly');
assert.notEqual(e.message, undefined, 'e.message was not set');


e = util.errnoException('ENOENT', 'foobar', 'baz', 'batcave');
//console.log('  From (ENOENT,foobar,baz,batcave) args \n', e);

assert.ok(e instanceof Error,         'return object is not an Error object');
assert.equal(e.code,   'ENOENT',      'ENOENT not set into e.code');
assert.equal(e.errno,  2,             'ENOENT not translated to number value 2');
assert.equal(e.path,   'batcave',     'e.path not set from argument');
assert.notEqual(e.message, undefined, 'e.message was not set');


if(0){
var net_binding = process.binding('net');
var net_errnoException = net_binding.errnoException;

console.log('\n');
console.log('  net_errnoException is ', net_errnoException);
console.log('                        ', typeof net_errnoException);

//  { errno: 0, code: '', syscall: 'undefined' }
e = net_errnoException();
console.log('  From empty args I see    ', util.inspect(e,true));
console.log('                        ', typeof e);
console.log('                        ', e instanceof Error);

//  { errno: 2, code: 'ENOENT', syscall: 'undefined' }
e = net_errnoException(2);
console.log('  From args (2)            ', util.inspect(e,true));

//  { errno: 2, code: 'ENOENT', syscall: 'foobar' }
e = net_errnoException(2, 'foobar');
console.log('  From args (2,foobar)     ', util.inspect(e,true));

//  { errno: 2, code: 'ENOENT', syscall: 'foobar' }
e = net_errnoException(2, 'foobar', 'baz');
console.log('  From args (2,foobar,bar) ', util.inspect(e,true));

//  { errno: 0, code: '', syscall: 'foobar' }
e = net_errnoException('ENOENT', 'foobar');
console.log('  From args (ENOENT,foobar)', util.inspect(e,true));

}

//  EAGAIN 11
//  EWOULDBLOCK 11
//  ENOTSUP 95
//  EOPNOTSUPP 95


