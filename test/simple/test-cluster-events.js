var cluster = require("cluster");
var common = require('../common');
var assert = require('assert');

if (cluster.isMaster) {
	
	var fork = false, online = false, listening = false;
	
	//Create cluster
	cluster
		.on('fork', function (worker) {
			fork = true;
		})
		.on("online", function (worker) {
			online = true;
		})
		.on("listening", function (worker, adress) {
			listening = true;
			process.exit();
		})
		.setupMaster({
			workers : 1
		})
		.autoFork();
	
	global.setTimeout(function () {
    assert.fail("Timeout after 2 seconds");
    process.exit();
	}, 2000);
	
	process.on("exit", function () {
		assert.ok(fork, "The fork event didn't emit");
		assert.ok(online, "The online event didn't emit");
		assert.ok(listening, "The listening event didn't emit");
	});
	
} else if (cluster.isWorker) {

	require("http")
		.createServer()
		.listen(common.PORT, "127.0.0.1");
}