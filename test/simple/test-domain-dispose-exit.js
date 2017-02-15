
var domain = require('domain');
var assert = require('assert');

var d = domain.create();

d.run(function () {
  
  var dd = domain.create();
  dd.run(function () {
    d.dispose();
    
    assert.strictEqual(domain.active, dd);
  });
});

