var cluster = require('cluster');
var common = require('../common');
var assert = require('assert');

if (cluster.isMaster) {

  var state = '';
  var suicide = false;
  var disconnect = false;
  var cantSend = false;

  //Create cluster
  cluster.on('disconnect', function(worker) {
    state = worker.state;
    suicide = worker.suicide;
    disconnect = true;
    try {
      worker.send({cmd: 'hallo'});
    } catch (e) {
      cantSend = true;
    }

    process.exit(0);
  });
  cluster.setupMaster({ workers: 1 });

  cluster.on('listening', function(worker) {
    //Disconnect worker
    worker.disconnect();
  });

  cluster.autoFork();

  //Timeout
  global.setTimeout(function() {
    assert.fail('Timeout after 2 seconds');
    process.exit(1);
  }, 2000);


  process.on('exit', function() {
    assert.ok(disconnect, 'The disconnect event did not emit');
    assert.equal(state, 'disconnect', 'The state should be disconnect');
    assert.ok(suicide, 'The worker wasn\'t set in suicide mode');
    assert.ok(cantSend, 'When worker is disconnect .send() should throw an error');
  });

} else if (cluster.isWorker) {

  require('http')
    .createServer()
    .listen(common.PORT, '127.0.0.1');
}
