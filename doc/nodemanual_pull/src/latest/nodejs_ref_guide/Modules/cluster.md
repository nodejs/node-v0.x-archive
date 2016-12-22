
## class cluster

A single instance of Node.js runs in a single thread. To take advantage of multi-core systems, the user will sometimes want to launch a cluster of Node.js processes to handle the load.

The cluster module allows you to easily create a network of processes that all share server ports. To use this module, add `require('cluster')` to your code.

#### Example: Launching one cluster working for each CPU

Create a file called _server.js_ and paste the following code:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/cluster/server.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

By launching _server.js_ with the Node.js REPL, you can see that the workers are sharing the HTTP port 8000:

    % node server.js
    Worker 2438 online
    Worker 2437 online

#### Example: Message passing between clusters and the master process

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/cluster/cluster.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## cluster@death(worker)
- worker (Cluster): The dying worker in the cluster

When any of the workers die, the cluster module emits this event. This can be used to restart the worker by calling [[cluster.fork `cluster.fork()`]] again.

Different techniques can be used to restart the worker, depending on the application.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/cluster/cluster.death.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## cluster.fork() -> Void

Spawns a new worker process. This can only be called from the master process.

 `cluster.fork` is actually implemented on top of [[child.process.fork `child_process.fork()`]]. The difference between `cluster.fork()` and `child_process.fork` is simply that `cluster` allows TCP servers to be shared between workers. The message passing API that is available on `child_process.fork` is available with `cluster` as well.





## cluster.isWorker -> Boolean


Flag to determine if the current process is a worker process in a cluster. A process is a worker if `process.env.NODE_WORKER_ID` is defined.




## cluster.isMaster -> Boolean


Flag to determine if the current process is a master process in a cluster. A process is a master if `process.env.NODE_WORKER_ID` is undefined.
 
