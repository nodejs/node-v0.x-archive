## Cluster

A single instance of Node runs in a single thread. To take advantage of
multi-core systems the user will sometimes want to launch a cluster of Node
processes to handle the load.

The cluster module allows you to easily create a network of processes all
which share server ports.

  var cluster = require('cluster');
  var http = require('http');

  if (cluster.isMaster) {
    // Start the master process, fork workers.
    cluster.startMaster({ workers: 2 });
  } else {
    // Worker processes have a http server.
    http.Server(function(req, res) {
      res.writeHead(200);
      res.end("hello world\n");
    }).listen(8000);
  }

Running node will now share port 8000 between the workers:

    % node server.js 
    Worker 2438 online
    Worker 2437 online

The following is an example of worker resuscitation, spawning
a new worker process when another exits.

  if (cluster.isMaster) {
    cluster.startMaster();
    process.on('SIGCHLD', function(){
      console.log('worker killed');
      cluster.spawnWorker();
    });
  }
  ... 

Cluster ids the servers internally, allowing multiple
servers to work as you would expect:

  var cluster = require('cluster');
  var http = require('http');

  if (cluster.isMaster) {
    cluster.startMaster();
  } else {
    http.Server(function(req, res) {
      res.end("hello world 1\n");
    }).listen(3000);

    http.Server(function(req, res) {
      res.end("hello world 2\n");
    }).listen(3001);

    http.Server(function(req, res) {
      res.end("hello world 3\n");
    }).listen(3002);
  }