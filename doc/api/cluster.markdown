## Cluster

A single instance of Node runs in a single thread. To take advantage of
multi-core systems the user will sometimes want to launch a cluster of Node
processes to handle the load.

The cluster module allows you to easily create a network of processes all
which share server ports.

  var cluster = require('cluster');
  var http = require('http');

  if (cluster.isMaster()) {
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

