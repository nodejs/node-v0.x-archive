// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// First described in https://github.com/joyent/node/issues/7006

// 1. Start cluster master, worker
// 2. Connect to cluster with separate client
// 3. Worker dies badly
// 4a. Client gets disconnected (reliably on v0.10)
// 4b. Client does not get disconnected (frequent on v0.11)

var common = require('../common');
var assert = require('assert');

switch (process.argv[2]) {
  case 'cluster': doCluster(); break;
  case 'client':  doClient.apply(null, process.argv.slice(3));  break;
  default:        doSetup();   break;
}

function doCluster() {
  var cluster = require('cluster');
  if (cluster.isMaster)
    return doMaster(cluster);
  else
    return doWorker(cluster);
}

function doMaster(cluster) {
  console.log('setting up master...');
  cluster.setupMaster({silent: false});

  var worker = cluster.fork()
  worker.on('error', function(error) {
    console.log('Worker error event:', error);
  });

  cluster.on('listening', function(worker, addr) {
    process.send({ pid: worker.process.pid, port: addr.port });
  });
  cluster.on('exit', function(worker, code, signal) {
    console.log('worker exitted');
  });
  process.on('message', function(msg) {
    console.log('cluster master received message', msg);
  });
}

function doWorker(cluster) {
  console.log('setting up worker...');
  var net = require('net');
  var server = net.createServer();
  server.on('connection', function(sock) {
    sock.write('HI THERE');
    sock.end();
  });
  server.listen(common.PORT, logThat('worker listening'));
}

function doClient(pid, port) {
  console.log('setting up client...');
  var net = require('net');
  var c = net.connect(port);
  c.on('connect', function() {
    console.log('client connected');
    process.kill(pid);
    setTimeout(function() {
      process.exit(42);
    }, 2000).unref();
  });
  c.on('end', function() {
    console.log('client ended');
  });
}

function doSetup() {
  console.log('setting up test environment...');
  var child_process = require('child_process');
  var master = child_process.fork(__filename, ['cluster']);

  master.on('message', function(msg) {
    console.log('got message from cluster master', msg);

    var client = child_process.fork(__filename,
                                    ['client', msg.pid, msg.port]);

    client.on('exit', function(code, sig) {
      console.log('client exitted', code, sig);
      master.kill();
      assert.equal(code, 0, 'client did not exit cleanly');
    });
  });

  master.on('exit', logThat('master exitted'));
  process.on('exit', logThat('supervisor exitted'));
}

function logThat(msg) {
  return function() {
    console.log(msg, arguments);
  }
}
