var common = require('../common');
var assert = require('assert');
var path = require('path');
var fs = require('fs');

var dirname = path.dirname(__filename);
var d = path.join(common.tmpDir, 'dir');
var recursive_d = path.join(d, '/first/second/third/fourth/fifth');

var mkdir_error = false;
var mkdir_recursive_error = false;
var rmdir_error = false;

fs.mkdir(d, 0666, function(err) {
  if (err) {
    console.log('mkdir error: ' + err.message);
    mkdir_error = true;
  } else {
    console.log('mkdir okay!');
    fs.rmdir(d, function(err) {
      if (err) {
        console.log('rmdir error: ' + err.message);
        rmdir_error = true;
      } else {
        console.log('rmdir okay!');
      }
    });
  }
});

fs.mkdir(recursive_d, 0766, true, function(err) {
  if (err) {
    console.log('mkdir recursive error: ' + err.message);
    mkdir_recursive_error = true;
  } else {
    console.log('mkdir recursive okay!');
  }
});

process.addListener('exit', function() {
  assert.equal(false, mkdir_error);
  assert.equal(false, mkdir_recursive_error);
  assert.equal(false, rmdir_error);
  console.log('exit');
});
