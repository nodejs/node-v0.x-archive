var assert = require('assert')
  , path   = require('path')
  , i, name, addon
  , signatures = [ ['exports']
                 , ['exports', 'context']
                 , ['exports', 'module']
                 , ['exports', 'module', 'context']
                 ];
for (i in signatures) {
  name  = 'init_' + signatures[i].join('_');
  addon = require('./build/Release/' + name);
  assert.ok(addon.initialized);
}

