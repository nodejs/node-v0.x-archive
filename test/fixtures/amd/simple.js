define(function(require, exports, module) {

  // check for module and exports argument
  exports.id = module.id;
  
  // check require
  exports.fs = require("fs");
});