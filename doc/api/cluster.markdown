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


### cluster.isMaster

This boolean flag is true if the process is a master. This is determinted
by the `process.env.NODE_WORKER_ID`. If `process.env.NODE_WORKER_ID` is 
undefined `isMaster` is `true`.

### cluster.isWorker

## Events

This boolean flag is true if the process is a worker forked from a master.
If the `process.env.NODE_WORKER_ID` is set to a value diffrent from undefined
`isWorker` is `true`.

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

Spawn a new worker process. This can only be called from the master process.
The `fork()` will also return a fork object equal as it was `child_process.fork`
there had been called.

The difference between `cluster.fork()` and `child_process.fork()` is simply
that cluster allows TCP servers to be shared between workers. The message
passing API that is available with `child_process.fork` is available with
`cluster` as well.

As an example, here is a cluster which keeps count of the number of requests
in the master process via message passing:

    var cluster = require('cluster');
    var http = require('http');

    if (cluster.isMaster) {
      
      //Keep track of http requests
      var numReqs = 0;
      setInterval(function() {
        console.log("numReqs =", numReqs);
      }, 1000);
      
      //Count requestes
      var messageHandler = function (msg) {
        if (msg.cmd && msg.cmd == 'notifyRequest') {
          numReqs += 1;
        }
      };
      
      //Start workers and listen for messages containing notifyRequest
      cluster.autoFork();
      cluster.eachWorker(function (worker) {
        worker.on('message', messageHandler);
      });

    } else {
     
     // Worker processes have a http server.
      http.Server(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");
        
        // notify master about the request
        cluster.worker.send({ cmd: 'notifyRequest' });
      }).listen(8000);
    }

### cluster.autoFork()

When `autoFork()` is called a number of worker is forked. How many workers 
you will end up with, are determed by the number of CPU cores you have.
You can finde the number by using `require('os').cups().length`.

`autoFork()` will only start workers if no workers are running.

The method do also spawn a new worker when on is dead. This is done using
the `death` event.

    cluster.on('death', function () {
        console.log('restarting worker ...');
        cluster.fork();
    });

### cluster.workers

`cluster.workers` is an array containing all currently running workers, spawned
by this master.

However since the worker id is used as the index, you can not use a for loop.
Instead you have to use for..in loop, or use the `eachWorker` method.

    var workers = cluster.workers;
    for (var workerID in workers) {
        //Do something usefull with workers[workerID]
    }

### cluster.eachWorker

This method is go thouge all workers and call a given function.
    
    //Say hi to all workers
    cluster.eachWorker(function (worker) {
        worker.send("say hi");
    });
    
## Worker

### Worker.send

-- placeholder

### Worker.workerID

-- placeholder

## cluster.worker 

This object contain basic information about the worker.

### cluster.worker.workerID

Each worker is given a unique id, is can be optained using `workerID`,
this id are the same used in the master.

### cluster.worker.send

This method is used to send messages back to the master. It takes also a
callback as a argument, there will be called when a master has echoed
a confirm message.
    
    var cluster = require("cluster");
    cluster.worker.send({ cmd : "notifyRequest" }, function () {
        //Master has resiced message
    });

### Event: message

This event is emitted when a message from the master is recived.
The diffrence between `cluster.worker.on('message')` and `process.on('message')`
is that it only emits when a non internal message is recived.
