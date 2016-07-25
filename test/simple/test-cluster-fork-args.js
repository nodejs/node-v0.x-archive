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
var cluster = require('cluster');

if (cluster.isMaster) {
  var child1 = cluster.fork(['foo']);
  var child2 = cluster.fork({ id: 1 }, ['bar']);
  var child3 = cluster.fork({ id: 2 }, ['baz'], ['--harmony']);

  child1.on('message', function(data) {
    assert.ok(data.pass, data.test);
  });

  child2.on('message', function(data) {
    assert.ok(data.pass, data.test);
  });

  child3.on('message', function(data) {
    assert.ok(data.pass, data.test);
  });
} else {
  var id = process.env.id;
  var test;
  var pass;

  if (!id) {
    test = 'passing no env to cluster.fork()';
    pass = process.argv.length === 3 &&
           process.execArgv.length === 1 &&
           process.argv[2] === 'foo';
  } else if (id === '1') {
    test = 'passing args, no execArgs to cluster.fork()';
    pass = process.argv.length === 3 &&
           process.execArgv.length === 1 &&
           process.argv[2] === 'bar';
  } else if (id === '2') {
    test = 'passing args and execArgs to cluster.fork()';
    pass = process.argv.length === 3 &&
           process.execArgv.length === 2 &&
           process.argv[2] === 'baz' && 
           process.execArgv.indexOf('--harmony') !== -1;
  } else {
    test = 'unknown test';
    pass = false;
  }

  process.send({
    test: test,
    pass: pass
  });

  process.exit(0);
}
