var assert = require('assert')
  , path   = require('path')
  , i, name, addon
  , signatures = [ ['exports']
                 , ['exports', 'module']
                 , ['exports', 'context']
                 , ['exports', 'private']
                 , ['exports', 'module', 'private']
                 , ['exports', 'module', 'context']
                 , ['exports', 'module', 'context', 'private']
                 ];
for (i in signatures) {
  name  = 'init_' + signatures[i].join('_');
  addon = require('./build/Release/' + name);
  assert.ok(addon.initialized);
}

// for the fun of it... (feel free to drop this if the dlopen is not portable)
require('./build/Release/init_void');
var init_void_test = require('./build/Release/init_void_tester');
assert.ok(init_void_test.initialized)
assert.ok(init_void_test.initVoid)
