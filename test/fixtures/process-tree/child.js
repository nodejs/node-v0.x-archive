var spawn = require('child_process').spawn;
var path = require('path');

spawn(process.execPath, [ path.join(__dirname, 'grandchild') ]);

// die quickly
setTimeout(function() { 
	process.exit(1); 
}, 100);