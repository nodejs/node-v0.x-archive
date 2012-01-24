## Cluster

A single instance of Node runs in a single thread. To take advantage of
multi-core systems the user will sometimes want to launch a cluster of Node
processes to handle the load.

The cluster module allows you to easily create a network of processes that
all share server ports.

    var cluster = require('cluster');
    var http = require('http');

    if (cluster.isMaster) {
      // Spawn workers
      // By default the number of workers is the number of cores in your CPU.
      cluster.autoFork();

      cluster.on('death', function(worker) {
        console.log('worker ' + worker.pid + ' died');
      });
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

This boolean flag is true if the process is a master. This is determined
by the `process.env.NODE_UNIQUE_ID`. If `process.env.NODE_UNIQUE_ID` is
undefined `isMaster` is `true`.

### cluster.isWorker

This boolean flag is true if the process is a worker forked from a master.
If the `process.env.NODE_UNIQUE_ID` is set to a value different efined
`isWorker` is `true`.

### Event: 'fork'

When a new worker is forked the cluster module will emit a 'fork' event.
This can be used to log worker activity, and create you own timeout.

    var timeouts = [];
    var errorMsg = function () {
      console.error("Something must be wrong with the connection ...");
    });

    cluster.on('fork', function (worker) {
      timeouts[worker.uniqueID] = setTimeout(errorMsg, 2000);
    });
    cluster.on('listening', function (worker) {
      clearTimeout(timeouts[worker.uniqueID]);
    });
    cluster.on('death', function (worker) {
      clearTimeout(timeouts[worker.uniqueID]);
      errorMsg();
    });

### Event: 'online'

After forking a new worker, the worker should respond with a online message.
When the master receives a online message it will emit such event.
The difference between 'fork' and 'online' is that fork is emitted when the
master tries to fork a worker, and 'online' is emitted when the worker is being
executed.

    cluster.on('online', function (worker) {
      console.log("Yay, the worker responded after it was forked");
    });

### Event: 'listening'

When calling `listen()` from a worker, a 'listening' event is automatically assigned
to the server instance. When the server is listening a message is send to the master
where the 'listening' event is emitted.

    cluster.on('listening', function (worker) {
      console.log("We are now connected");
    });

### Event: 'death'

When any of the workers die the cluster module will emit the 'death' event.
This can be used to restart the worker by calling `fork()` again.

    cluster.on('death', function(worker) {
      console.log('worker ' + worker.pid + ' died. restart...');
      cluster.fork();
    });

However the workers will automatically respawn when using the `autoFork()` method.

### Event: 'disconnect'

When using the `disconnect()` in the master or in a worker, the `disconnect` event
will emit when a connection is disconnected.

    cluster.on('disconnect', function (worker) {
      console.log("We can no longer recive messages from worker");
    });

If the worker was killed using`.destroy()` this event will not emit.

### Event: 'criticalError'

When using the `autoFork()`. Worker will automatically  be respawed when they die.
However if there is a permanent error in a worker, lets say a syntax error, the worker
will die in a second and be respawend again. To prevent an infinity respawn loop, the module
log the previously 5 deaths. If all 5 workers was alive in less than a second it won't
respawn any more workes, and the `cluster.disconnect()` function will be executed.

In this case the criticalError event will be emitted. The event can be used to notify
the admin about an critical error.

    cluster.on('criticalError', function () {
      // Send admin an email
    });

### Event 'setup'

When the `.setupMaster()` function has been executed this event emits. If `.setupMaster()`
was not executed before `fork()` or `.autoFork()`, they will execute the function with no
arguments.

### cluster.fork([env])

Spawn a new worker process. This can only be called from the master process.
The function takes an optional `env` object. The properties in this object
will be added to the process environment in the worker.

When using `.fork()` you can not use the `.autoFork()` method. If you call
`.autoFork()` it will throw an error.

### cluster.autoFork()

When `autoFork()` is called a number of worker is forked. How many workers
you will end up with, are determined by `workers` property set in `setupMaster`.
If no property it will default to the number CPU cores you have. You can find
the number by using `require('os').cups().length`.

When using `.autoFork()` you can not use the `.fork()` method. If you do so
`.fork()` it will throw an error.

The method does also spawn a new worker when on is dead. Unless they commit suicide
this is known by checking the `worker.suicide` boolean. If you want to respawn
workers there commit suicide you simply run `.autoFork()` manually.

### cluster.destroy([callback])

When calling this method all workers will commit a non-graceful suicide.
This is useful when you want to shutdown the master quickly. It takes an optional
callback argument there will be called when finished.

This method is automatically used just before the mater dies. This can happen by
calling `process.exit()`, the master gets a `SIGINT` or a `SIGTERM` signal, or by
an uncatched error.

### cluster.disconnect([callback])

When calling this method all workers will commit a graceful suicide. It takes an optional
callback argument there will be called when finished.

This method is automaticly used when the master gets a `SIGQUIT` signal.

### cluster.restart([callback])

When updateing your workers you don't want to restart the cluster by destroying all client socket.
By using the this method the cluster will restart workers gracefully when nobody use them, and have
minimum one worker online.

This example restart the cluster each time the worker file changes:

    var cluster = require('cluster');
    var fs = require('fs');
    cluster.setupMaster({
      exec: 'worker.js'
    });
    fs.watchFile('worker.js', {persistent: false}, function (curr, prev) {
      if (curr.ctime.getTime() === prev.ctime.getTime()) {
        cluster.restart(function () {
          console.log('all workers restarted');
        });
      }
    });

### cluster.workers

In the cluster all living worker objects are stored in this object by there
`uniqueID` as the key. This makes it easy to loop through all living workers.

    // Go through all workers
    function eachWorker(callback) {
      for (var uniqueID in cluster.workers) {
        callback(cluster.workers[uniqueID]);
      }
    }
    eachWorker(function (worker) {
      worker.send('big announcement to all workers');
    });

Should you wish to reference a worker over a communication channel, using
the worker's uniqueID is the easiest way to find the worker.

    socket.on('data', function (uniqueID) {
      var worker = cluster.workers[uniqueID];
    });

### cluster.setupMaster([options])

The `setupMaster` is used to change the default 'fork' behavior. It takes one option
object argument.

Example:

    var cluster = require("cluster");
    cluster.setupMaster({
      exec : "worker.js",
      args : ["--use", "https"],
      workers : 2,
      silent : true
    });
    cluster.autoFork();

The options argument can contain 3 different properties.

- `exec` are the file path to the worker file, by default this is the same file as the master.
- `args` are a array of arguments send along with the worker, by default this is `process.argv.slice(2)`.
- `workers` are the number of worker there will be created when using `autoFork()`
- `silent`, if this option is true the output of a worker won't propagate to the master, by default this is false.

### cluster.settings

All settings set by the `.setupMaster` is stored in this settings object.
This object is not supposed to be change or set manually, by you.
There is also an `autoFork` property there is set to `auto` if you used the
`autoFork` method, and manual if the `fork` method was used.

All propertys are `undefined` if they are not yet set.

## Worker

This object contains all public information and method about a worker.
In the master it can be obtained using `cluster.workers`. In a worker
it can be obtained using `cluster.worker`.

### Worker.uniqueID

Each new worker is given its own unique id, this id is stored in the `uniqueID`.


### Worker.workerID

When using the `autoFork` method, workers are also given a workerID. This id start from 0
and incress to the value of the `workers` property set by `setupMaster`. When a worker
restart this id is resused unlike the uniqueID.

### Worker.process

All workers are created using `child_process.fork()`, the returned object from this
function is stored in process.

### Worker.send(message, [sendHandle])

This function is equal to the send methods provided by `child_process.fork()`.
In the master you should use this function to send a message to a specific worker.
However in a worker you can also use `process.send(message)`, since this is the same
function.

This example will echo back all messages from the master:

    if (cluster.isMaster) {
      var worker = cluster.fork();
      worker.send('hi there');

    } else if (cluster.isWorker) {
      process.on('message', function (msg) {
        process.send(msg);
      });
    }

### Worker.destroy()

This function will kill the worker, and inform the master to not spawn a new worker.
To know the difference between suicide and accidentally death a suicide boolean is set to true.

    cluster.on('death', function (worker) {
      if (worker.suicide === true) {
        console.log('Oh, it was just suicide\' – no need to worry').
      }
    });

    // destroy worker
    worker.destroy();

This method is automaticly used when the worker gets a `SIGINT` or `SIGTERM` signal.

### Worker.suicide

This property is a boolean. It is set when a worker dies, until then it is `undefined`.
It is true if the worker was killed using the `.destroy()` or  `.disconnect()` method, and false otherwise.

### Worker.startup

This property is the timestamp set when the worker was forked. It is basically set by:

    worker.statup = Date.now();

### Worker.disconnect();

When running the function the worker will make a graceful shutdown. This involves closing
all TCP sockets, and stopping the IPC channel between master and worker. Using the `.send()` method
will throw an error.

Calling this method will emit first a `disconnect` event, followed by a `death` event. It will also set
`suicide` to true.

This method is automatically used when the worker gets a `SIGQUIT` signal.

### Worker.restart([callback])

This method will restart the worker, but without change in the `workerID` or the custom environment.
The callback will be called when the new worker is listening for new connections.

### Event: message

This event is the same as the one provided by `child_process.fork()`.
In the master you should use this event, however in a worker you can also use
`process.on('message')`

As an example, here is a cluster that keeps count of the number of requests
in the master process using the message system:

    var cluster = require('cluster');
    var http = require('http');

    if (cluster.isMaster) {

      // Keep track of http requests
      var numReqs = 0;
      setInterval(function() {
        console.log("numReqs =", numReqs);
      }, 1000);

      // Count requestes
      var messageHandler = function (msg) {
        if (msg.cmd && msg.cmd == 'notifyRequest') {
          numReqs += 1;
        }
      };

      // Start workers and listen for messages containing notifyRequest
      cluster.autoFork();
      Object.keys(cluster.workers).forEach(function (uniqueID) {
        cluster.workers[uniqueID].on('message', messageHandler);
      });

    } else {

      // Worker processes have a http server.
      http.Server(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");

        // notify master about the request
        process.send({ cmd: 'notifyRequest' });
      }).listen(8000);
    }

### Event: online

Same as the `cluster.on('online')` event, but emits only when the state change
on the specified worker.

    cluster.fork().on('online', function (worker) {
      // Worker is online
    };

### Event: listening

Same as the `cluster.on('listening')` event, but emits only when the state change
on the specified worker.

    cluster.fork().on('listening', function (worker) {
      // Worker is listening
    };

### Event: death

Same as the `cluster.on('death')` event, but emits only when the state change
on the specified worker.

    cluster.fork().on('death', function (worker) {
      // Worker has died
    };

### Event: disconnect

Same as the `cluster.on('disconnect')` event, but emits only when the state change on the specified worker.

    cluster.fork().on('disconnect', function (worker) {
      // Worker has been disconnected
    };
