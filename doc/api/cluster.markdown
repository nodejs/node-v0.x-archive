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
      // Workers can share any TCP connection
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
    var errorMsg = function () {
        console.error("Something must be worng with the connection ...");
    });

    cluster.on('fork', function (worker) {
        timeouts[worker.workerID] = setTimeout(errorMsg, 2000);
    });
    cluster.on('listening', function (worker) {
        clearTimeout(timeouts[worker.workerID]);
    });
    cluster.on('death', function (worker) {
        clearTimeout(timeouts[worker.workerID]);
        errorMsg();
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


### Event: 'disconnect'

When using the `disconnect()` in the master or in a worker, the `disconnect` event
will emit when a connection is disconnected.

    cluster.on('disconnect', function (worker) {
        console.log("We can no longer recive messages from worker");
    });

### Event: 'criticalError'

When using the `autoFork()`. Worker will automaticly be respawed when they die.
However if thare a a permanent error in a worker, lets say a syntax error. The worker
will in a second and be respawend again. To prevent an infinity respawn loop, the module
log the previously 5 deaths. If all 5 workers was alive in less than a second it won't
respawn any more workes, and the `cluster.disconnect()` function will be runed.

In this case the criticalError event will be emitted. The event can be used to notify
the admin about an critical error.

    cluster.on('criticalError', function () {
        //Send admin an email
    });

### cluster.fork()

Spawn a new worker process. This can only be called from the master process.
The `fork()` will also return a fork object equal as it was `child_process.fork`
there had been called.

When using `.fork()` you can not use the `.autoFork()` method. If you call
`.autoFork()` it will throw an error.

The difference between `cluster.fork()` and `child_process.fork()` is simply
that cluster allows TCP servers to be shared between workers. The message
passing API that is available with `child_process.fork` is available within
`cluster` as well.

### cluster.autoFork()

When `autoFork()` is called a number of worker is forked. How many workers
you will end up with, are determed by `workers` property set in `setupMaster`.
If no property it will default to the number CPU cores you have. You can finde
the number by using `require('os').cups().length`.

When using `.autoFork()` you can not use the `.fork()` method. If you call
`.fork()` it will throw an error.

The method do also spawn a new worker when on is dead. Unless they commit suicide
this is known by checking the `worker.suicide` boolean. If you wan't to respawn
workers there commit suicide you simply run `.autoFork()` manualy.
    
### cluster.destroy([callback])

When calling this method all workers will commit a non-gracefull suicide.
This is usefull when you wan't to shutdown the master. It takes an optional
callback argument there will be called when finished.

This method is automaticly used just before the mater dies. This can happen by
calling `process.exit()`, the master gets `SIGINT` or `SIGTERM` signal, or by 
an uncatched error. 

### cluster.disconnect()

When calling this method all workers will commit a gracefull suicide. It takes an optional
callback argument there will be called when finished.

This method is automaticly used when the master gets a `SIGQUIT` signal.

### cluster.eachWorker(callback)

This method will go thouge all workers and call a given function.

    //Say hi to all workers
    cluster.eachWorker(function (worker) {
        worker.send("say hi");
    });

### cluster.setupMaster([options])

The `setupMaster` is used to change the default 'fork' behavure. It takes one option
object argument.

Example:

    var cluster = require("cluster");
    cluster.setupMaster({
        exec : "worker.js",
        args : ["--use", "https"],
        workers : 2
    });
    cluster.autoFork();

The options argument can contain 3 different properties.

`exec` and `args` are used when forking a new worker.

- `exec` are the file path to the worker file, by default this is the same file as the master.
- `args` are a array of arguments send along with the worker, by default this is `process.argv.slice(2)`.
- `workers` are the number of worker there will be created when using `autoFork()`

## Worker

This object contain all public information and method about a worker. In the master
it can be optained using `cluster.workers` or `cluster.eachWorker`. In a worker
it can be optained using `cluster.worker`.

### Worker.workerID

Each new worker is given its own unique id, this id i stored in the `workerID`.

### Worker.process

All workers are created using `child_process.fork()`, the returned object from this
function is stored in process.

### Worker.send(message, [callback])

In the master this function will send a message to a specific worker.
In a worker the function will send a message to the master.

The `send()` method takes a second optional argument. This is a callback function
there will run the the message was rescived.

    cluster.worker.send({ cmd: 'notifyRequest' }, function () {
      //Master has recived message
    });

### Worker.kill()

This function will kill the worker, and inform the master to not spawn a new worker.
To know the diffrence between suicide and accidently death a suicide boolean is set to true.

  cluster.on('death', function (worker) {
    if (worker.suicide === true) {
      console.log('Oh, it was just suicide' – no need to worry').
    }
  });
  cluster.eachWorker(function (0) {
    worker.kill();
  });

This method is automaticly used when the worker gets a `SIGINT` or `SIGTERM` signal.

### Worker.suicide

This property is a boolean. It is set when a worker dies, until then it is `undefined`.
It is true if the worker was killed using the `.kill()` or  `.disconnect()` method, and false otherwise.

### Worker.startup

This property is the timestamp set when the worker was forked. It is basically set by:
  
  worker.statup = Date.now();

### Worker.disconnect();
  
When running the function the worker will make a gracefull shoutdown. This involves closing
all TCP sockets, and stoping the IPC channel between master and worker. Using the `.send()` method
will throw an error. 

Calling this method will emit first a `disconnect` event, followed by a `death` event. It will also set 
`suicide` to true.

This method is automaticly used when the worker gets a `SIGQUIT` signal.

### Event: message

The event is very much like the 'message' event from `child_process.fork()` or `process.on('message')`
except that is don't emit when a internal message is recived. The event function do also
recive a sencond argument containg the worker object.

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

### Event: exit

This event will emit when a worker is dead or disconnected.

### Event: disconnect

This event will emit when a worker is disconnect from the master,
and can't resive or send messages.
