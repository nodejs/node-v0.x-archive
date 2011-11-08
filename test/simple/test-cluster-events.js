var cluster = require('cluster');
var common = require('../common');
var assert = require('assert');

if (cluster.isMaster) {

  var fork = false;
  var online = false;
  var listening = false;

  //Create cluster
  cluster.on('fork', function(worker) {
    fork = true;
  });
  cluster.on('online', function(worker) {
    online = true;
  });
  cluster.on('listening', function(worker, adress) {
    listening = true;
    process.exit(0);
  });
  cluster.setupMaster({
    workers: 1
  });
  cluster.autoFork();

  global.setTimeout(function() {
    assert.fail('Timeout after 2 seconds');
    process.exit(1);
  }, 2000);

  process.on('exit', function() {
    assert.ok(fork, 'The fork event did not emit');
    assert.ok(online, 'The online event did not emit');
    assert.ok(listening, 'The listening event did not emit');
  });

} else if (cluster.isWorker) {

  require('http')
    .createServer()
    .listen(common.PORT, '127.0.0.1');
}
