var assert = require('assert');

var test_result = 0;
var num = 500;
var test_threshold = 400; // Hey, 400 closes can't be a coincidence

var io = require('socket.io').listen(8080).set('log level', 0).set('heartbeat interval', 300).set('heartbeat timeout', 310).set('transports', ['websocket']);

io.sockets.on('connection', function (socket) {
	socket.on('disconnect', function(reason) {
		if( reason == "socket close" ) test_result++;
	})
});

var ioc = require('./socket.io-client');

var uri = "http://localhost:8080/"
var rampup = 0;

function createClient(i) {
	var s = ioc.connect(uri, {
		'force new connection': true,
	});

	s.on('disconnect', function() {
		log("client " + i + " disconnected", "disconnect");
	});
	s.on('error', function(msg) {
		console.log(" error: " + msg);
	});

	return s;
}

var socks = new Array(num);
for(var i = 0 ; i < num; i++) {
	setTimeout( function(id) { return function() { socks[id] = createClient(id); } }(i), rampup*i);
}
console.log("Connected " + num + " sockets; waiting 2 minutes to see if they time out");

setTimeout( function() { 
	// At this time, all sockets should still be ok
	console.log("Before timeout: " + test_result + " sockets closed");
}, 110000);
setTimeout( function() { 
	// At this time, all sockets should still be ok
	console.log("After timeout: " + test_result + " sockets closed");
	assert.fail(test_result, test_threshold, "too much closed sockets", "<");
	process.exit();
}, 130000);
