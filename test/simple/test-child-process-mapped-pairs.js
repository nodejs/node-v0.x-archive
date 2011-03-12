var assert = require('assert');
var spawn = require('child_process').spawn;
var common = require('../common');
var net = require('net');

var args = [common.fixturesDir + '/get-stdin-type'];

//test auto socketpair
var opts = {
  customFds: ['unix']
};
spawn(process.execPath, args, opts).stdout.on('data', function (data) {
  assert.ok(data.toString() == 'unix');
});
//test manual socketpair
var fds = net.socketpair();
var opts = {
  customFds: [fds, -1, -1]
};

var child = spawn(process.execPath, args, opts);
child.stdout.on('data', function (data) {
  assert.ok(data.toString() == 'unix');
});

assert.ok(child.stdin.type == 'unix', 'Should be unix');
