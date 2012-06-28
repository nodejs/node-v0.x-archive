// Tests that when you add the display_error flag to a vm.createScript
// call, that you will get the correct line / column displayed.
// NOTE: This test should be deleted as soon as the V8 bug that causes rethrown
// exceptions to get new stack traces is fixed.  At that time it should be
// replaced with a test that shows that stack traces in Syntax Errors
// are reported normally
var common = require('../common');
common.error('before');

require("vm").createScript('invalidJsHere ?= 1;', "myfilename.js", true);

common.error('after');
