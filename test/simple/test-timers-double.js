var timers = require('timers');
var assert = require('assert');

var triggered = 0;

var obj1 = {};
obj1._onTimeout = function() {
	console.log("Obj1: Timeout triggered");
	triggered++;
}
var obj2 = {};
obj2._onTimeout = function() {
	console.log("Obj2: Timeout triggered");
	triggered++;
}

setTimeout(function() { timers.enroll(obj1, 1000); }, 0 );
setTimeout(function() { timers.active(obj1); }      , 100 );

setTimeout(function() { timers.enroll(obj2, 1000); }, 200 );
setTimeout(function() { timers.active(obj2); }      , 300 );

setTimeout(function() { timers.unenroll(obj1); }    , 500 );
setTimeout(function() { timers.active(obj1); }      , 600 );

setTimeout(function() { timers.unenroll(obj2); }    , 700 );
setTimeout(function() { timers.active(obj2); }      , 800 );

setTimeout(function() {
	assert.ok( (triggered == 0), "Timers should not have triggered" );
	process.exit();
}, 2000 );
