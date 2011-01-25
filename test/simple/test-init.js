(function() {
  var assert = require('assert'),
      child  = require('child_process'),
      util   = require('util');
  if (process.env['TEST_INIT']) {
    util.print('Loaded successfully!');
  } else {
    process.chdir(__dirname);
    
    child.exec(process.execPath + ' test-init-index',{env:{'TEST_INIT':1}},
    function(err, stdout, stderr) {
      assert.equal(stdout, 'Loaded successfully!', '`node test-init-index failed!');
    });

    child.exec(process.execPath + ' test-init',{env:{'TEST_INIT':1}},
    function(err, stdout, stderr) {
      assert.equal(stdout, 'Loaded successfully!', '`node test-init` failed!');
    });

    child.exec(process.execPath + ' test-init.js', {env:{'TEST_INIT':1}},
    function(err, stdout, stderr) {
      assert.equal(stdout, 'Loaded successfully!', '`node test-init.js` failed!');
    });
    // ensures that `node fs` does not mistakenly load the native 'fs' module
    // instead of the desired file and that the fs module loads as expected in node
    process.chdir(__dirname + '/test-init-native/');

    child.exec(process.execPath + ' fs', {env:{'TEST_INIT':1}},
    function(err, stdout, stderr) {
      assert.equal(stdout, 'fs loaded successfully', '`node fs` failed!');
    });
  }
})();