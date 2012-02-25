var assert = require('assert');
var binding;
if (process.platform == 'win32') {
  binding = require('./Release/binding');
} else {
  binding = require('./out/Release/binding');
}
assert.equal('world', binding.hello());
console.log('binding.hello() =', binding.hello());
