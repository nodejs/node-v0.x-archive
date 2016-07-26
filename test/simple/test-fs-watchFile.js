var assert = require('assert');
var fs = require('fs');

function callbackFail(){
    assert(false, "Callback should not be called for non-existant files")
}

//regression test for #25345
var filename = 'doesNotExist.txt';
assert(!fs.existsSync(filename), "dummy file exists");
fs.watchFile(filename, callbackFail);

setTimeout(function() {
  process.exit()
}, 5000);
