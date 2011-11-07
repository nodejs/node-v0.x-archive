## Cluster

A single instance of Node runs in a single thread. To take advantage of
multi-core systems the user will sometimes want to launch a cluster of Node
processes to handle the load.

The cluster module allows you to easily create a network of processes all
which share server ports.

    var cluster = require('cluster');
    var http = require('http');

    if (cluster.isMaster) {
      // Spawn workers
      // By default the number of workers is the number of cores in your CPU.
      cluster.autoFork();
      
    } else {
      // Workers can use share any TCP connection
      // In this case its a HTTP server
      http.createServer(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");
      }).listen(8000);
    }

Running node will now share port 8000 between the workers:

    % node server.js
    Worker 2438 online
    Worker 2437 online

### Event: 'death'

When any of the workers die the cluster module will emit the 'death' event.
This can be used to restart the worker by calling `fork()` again.

    cluster.on('death', function(worker) {
      console.log('worker ' + worker.pid + ' died. restart...');
      cluster.fork();
    });

This will automaticly be done when using the `autoFork()` method.

### Event: 'fork'

When a new worker is forked the cluster module will emit a 'fork' event.
This can be used to log worker activity, and create you own timeout.
    
    var timeouts = [];
    cluster.on('fork', function (worker) {
        timeouts[worker.workerID] = setTimeout(function () {
            console.error("Something must be worng with the connection ...");
        }, 2000);
    });
    cluster.on('listening', function (worker) {
        clearTimeout(timeouts[worker.workerID]);
    });

### Event: 'online'

After forking a new worker, the worker should respond with a online message.
When the master resive a online message it will emit such event.
The diffrence between 'fork' and 'online' is that fork is emitted when the
master tries to fork a worker, and 'online' is emitted when the worker is being
executed.

    cluster.on('online', function (worker) {
        console.log("Yay the worker responed after it was forked");
    });

### Event: 'listening'

When calling `listen()` from a worker, a 'listening' event is automaticly assigned
to the server instance. When the server is listening a message is send to the master
where the 'listening' event is emitted.

    cluster.on('listening', function (worker) {
        console.log("We are now connected");
    });


### cluster.fork()

The difference between `cluster.fork()` and `child_process.fork()` is simply
that cluster allows TCP servers to be shared between workers. `cluster.fork`
is implemented on top of `child_process.fork`. The message passing API that
is available with `child_process.fork` is available with `cluster` as well.
As an example, here is a cluster which keeps count of the number of requests
in the master process via message passing:

    var cluster = require('cluster');
    var http = require('http');
    var numReqs = 0;

    if (cluster.isMaster) {
      // Fork workers.
      for (var i = 0; i < 2; i++) {
        var worker = cluster.fork();

        worker.on('message', function(msg) {
          if (msg.cmd && msg.cmd == 'notifyRequest') {
            numReqs++;
          }
        });
      }

      setInterval(function() {
        console.log("numReqs =", numReqs);
      }, 1000);
    } else {
      // Worker processes have a http server.
      http.Server(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");
        // Send message to master process
        process.send({ cmd: 'notifyRequest' });
      }).listen(8000);
    }



Spawn a new worker process. This can only be called from the master process.

### cluster.isMaster
### cluster.isWorker

Boolean flags to determine if the current process is a master or a worker
process in a cluster. A process `isMaster` if `process.env.NODE_WORKER_ID`
is undefined.
