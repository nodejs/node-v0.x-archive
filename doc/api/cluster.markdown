## cluster

    Stability: 1 - Experimental

A single instance of Node runs in a single thread. To take advantage of multi-core systems the user will sometimes want to launch a cluster of Node processes to handle the load. 

To use this module, add `require('cluster')` to your code.

Note: This feature was introduced recently, and may change in future versions. Please try it out and provide feedback.

#### Example: Launching one cluster working for each CPU

The cluster module allows you to easily create a network of processes that all share server ports. 

Create a file called _server.js_ and paste the following code:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/cluster/server.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

By launching _server.js_ with the Node.js REPL, you can see that the workers are sharing the HTTP port 8000:

    % node server.js
    Worker 2438 online
    Worker 2437 online

#### Example: Message passing between clusters and the master process

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/cluster/cluster.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### cluster.settings(settings)
- settings {Object} Various settings to configure. The properties on this parameter are:
  * `exec`, the [[String `String`]] file path to worker file. The default is `__filename`.
  * `args`, an  [[Array `Array`]] of string arguments passed to worker. The default is `process.argv.slice(2)`.
  * `silent`, [[Boolean `Boolean`]] specifying whether or not to send output to parent's stdio. The default is `false`.

All settings set by the [[cluster.setupMaster `setupMaster`]] are stored in this settings object. This object is not supposed to be change or set manually by you.

### cluster@death(worker)
- worker {cluster}  The dying worker in the cluster

When any of the workers die, the cluster module emits this event. This can be used to restart the worker by calling [[cluster.fork `cluster.fork()`]] again.

Different techniques can be used to restart the worker, depending on the application.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/cluster/cluster.death.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

### cluster.fork([env]), worker
- env {Object} Additional key/value pairs to add to child process environment.

Spawns a new worker process. This can only be called from the master process.

 `cluster.fork` is actually implemented on top of [[child_process.fork `child_process.fork()`]]. The difference between `cluster.fork()` and `child_process.fork` is simply that `cluster` allows TCP servers to be shared between workers. The message passing API that is available on `child_process.fork` is available with `cluster` as well.

### cluster.isWorker, Boolean


Flag to determine if the current process is a worker process in a cluster. A process is a worker if `process.env.NODE_WORKER_ID` is defined.

### cluster.isMaster, Boolean


Flag to determine if the current process is a master process in a cluster. A process is a master if `process.env.NODE_WORKER_ID` is undefined.

### cluster@fork(worker)
- worker {worker} The worker that was forked

When a new worker is forked the cluster module will emit a 'fork' event. This can be used to log worker activity, and create you own timeout.

#### Example

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

### cluster@online(worker)
- worker {worker} The worker that becomes online

After forking a new worker, the worker should respond with a online message. When the master receives a online message it emits this event.

The difference between `'fork'` and `'online'` is that fork is emitted when the master tries to fork a worker, and `'online'` is emitted when the worker is being executed.

#### Example

    cluster.on('online', function (worker) {
      console.log("Yay, the worker responded after it was forked");
    });

### cluster@listening(worker)
- worker {worker} The worker to listen for

When calling [[worker@listening `listen()`]] from a worker, a 'listening' event is automatically assigned to the server instance. When the server is listening, a message is sent to the master where the 'listening' event is emitted.

#### Example

    cluster.on('listening', function (worker) {
      console.log("We are now connected");
    });

### cluster@disconnect(worker)
- worker {worker} The worker that disconnected

When a worker's IPC channel has disconnected, this event is emitted. This happens when the worker dies, usually after calling [[worker.destroy `worker.destroy()`]].

When calling `disconnect()`, there may be a delay between the `disconnect` and `death` events.  This event can be used to detect if the process is stuck in a cleanup or if there are long-living connections.

#### Example

    cluster.on('disconnect', function(worker) {
      console.log('The worker #' + worker.uniqueID + ' has disconnected');
    });

### cluster@setup(worker)
- worker {worker} The worker that executed

When the [[cluster.setupMaster `setupMaster()`]] function has been executed this event emits. If `.setupMaster()` was not executed before `fork()`, this function calls `setupMaster()` with no arguments.

### cluster.setupMaster([settings])
- settings {Object} Various settings to configure. The properties on this parameter are:
  * `exec`, the [[String `String`]] file path to worker file. The default is `__filename`.
  * `args`, an  [[Array `Array`]] of string arguments passed to worker. The default is `process.argv.slice(2)`.
  * `silent`, [[Boolean `Boolean`]] specifying whether or not to send output to parent's stdio. The default is `false`.

`setupMaster` is used to change the default `'fork'` behavior. It takes one option object argument.

#### Example

    var cluster = require("cluster");
    cluster.setupMaster({
      exec : "worker.js",
      args : ["--use", "https"],
      silent : true
    });
    cluster.autoFork();

### cluster.disconnect([callback])
- callback {Function} Called when all workers are disconnected and handlers are closed

When calling this method, all workers will commit a graceful suicide. After they are disconnected, all internal handlers will be closed, allowing the master process to die graceful if no other event is waiting.

### cluster.workers, Object

In the cluster, all living worker objects are stored in this object by their `uniqueID` as the key. This makes it easy to loop through all living workers, like this:

    // Go through all workers
    function eachWorker(callback) {
      for (var uniqueID in cluster.workers) {
        callback(cluster.workers[uniqueID]);
      }
    }
    eachWorker(function (worker) {
      worker.send('big announcement to all workers');
    });

Should you wish to reference a worker over a communication channel, using the worker's uniqueID is the easiest way to find the worker:

    socket.on('data', function (uniqueID) {
      var worker = cluster.workers[uniqueID];
    });

## worker

A `Worker` object contains all public information and methods about a worker. In the master, it can be obtained using `cluster.workers`. In a worker it can be obtained using `cluster.worker`.

### worker.uniqueID, String

Each new worker is given its own unique id, stored in the `uniqueID`.

While a worker is alive, this is the key that indexes it in `cluster.workers`.

### worker.process, child_process

Since all workers are created using [[child_process.fork `child_process.fork()`]], the returned object from that function is stored in `process`.

For more information, see the [[`child_process` module](child_process.html).

### worker.suicide, Boolean

This property is a boolean. It is set when a worker dies after calling `destroy()` or immediately after calling the `disconnect()` method. Until then, it is `undefined`.

### worker.send(message, [sendHandle]), Void
- message {Object} A message to send

This function is equal to the send methods provided by `child_process.fork()`. In the master, you should use this function to
send a message to a specific worker.  However, in a worker you can also use `process.send(message)`, since this is the same function.

#### Example: Echoing Back Messages from the Master

    if (cluster.isMaster) {
      var worker = cluster.fork();
      worker.send('hi there');

    } else if (cluster.isWorker) {
      process.on('message', function (msg) {
        process.send(msg);
      });
    }

### worker.destroy(), Void

This function kills the worker, and inform the master to not spawn a new worker. To know the difference between suicide and accidentally death, a suicide boolean is set to `true`.

    cluster.on('death', function (worker) {
      if (worker.suicide === true) {
        console.log('Oh, it was just suicide\' – no need to worry').
      }
    });

    // destroy worker
    worker.destroy();


### worker.disconnect(), Void

When calling this function the worker will no longer accept new connections, but they will be handled by any other listening worker. Existing connection will be allowed to exit as usual. When no more connections exist, the IPC channel to the worker will close allowing it to die graceful. When the IPC channel is closed the `disconnect` event will emit, this is then followed by the `death` event, there is emitted when the worker finally die.

Because there might be long living connections, it is useful to implement a timeout. This example ask the worker to disconnect and after two seconds it will destroy the server. An alternative wound be to execute `worker.destroy()` after 2 seconds, but that would normally not allow the worker to do any cleanup if needed.

#### Example

    if (cluster.isMaster) {
      var worker = cluser.fork();
      var timeout;

      worker.on('listening', function () {
        worker.disconnect();
        timeout = setTimeout(function () {
          worker.send('force kill');
        }, 2000);
      });

      worker.on('disconnect', function () {
        clearTimeout(timeout);
      });

    } else if (cluster.isWorker) {
      var net = require('net');
      var server = net.createServer(function (socket) {
        // connection never end
      });

      server.listen(8000);

      server.on('close', function () {
        // cleanup
      });

      process.on('message', function (msg) {
        if (msg === 'force kill') {
          server.destroy();
        }
      });
    }

### worker@message(message)
- message {Object} The message to send

This event is the same as the one provided by `child_process.fork()`. In the master you should use this event, however in a worker you can also use `process.on('message')`

#### Example

Here is a cluster that keeps count of the number of requests in the master process using the message system:

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

### worker@online(worker)
- worker {worker} The worker that came online

Same as a cluster's [[cluster@online `'online'`]] event, but emits only when the state changes on the specified worker.

#### Example

    cluster.fork().on('online', function (worker) {
      // Worker is online
    };

### worker@listening(worker)
- worker {worker} The worker that's being listened

Same as the `cluster.on('listening')` event, but emits only when the state change on the specified worker.

#### Example

    cluster.fork().on('listening', function (worker) {
      // Worker is listening
    };

### worker@disconnect(worker)
- worker {worker} The disconnected worker

Same as the `cluster.on('disconnect')` event, but emits only when the state change
on the specified worker.

    cluster.fork().on('disconnect', function (worker) {
      // Worker has disconnected
    };

### worker@death(worker)
- worker {worker} The dead worker

Same as the `cluster.on('death')` event, but emits only when the state change on the specified worker.

#### Example

    cluster.fork().on('death', function (worker) {
      // Worker has died
    };
