common = require("../common");
var fixturesDir = common.fixturesDir;
var assert = common.assert;

// relative path causes caching problems (absolute works fine)
require.paths.unshift( '../fixtures' );

var Foo1 = require('../fixtures/a').A,
    Foo2 = require('a').A,
    obj = new Foo1();

assert.ok( obj instanceof Foo1 ); // always true
assert.ok( obj instanceof Foo2 ); // regression test

console.log('ok')

