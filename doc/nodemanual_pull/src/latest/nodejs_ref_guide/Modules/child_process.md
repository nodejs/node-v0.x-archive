

## class child_process
### section: child_process
  *
Node.js provides a tri-directional [`popen(3)`](http://www.kernel.org/doc/man-pages/online/pages/man3/popen.3.html) facility through this `ChildProcess` class. It's possible to stream data through the child's `stdin`, `stdout`, and `stderr` in a fully non-blocking way.

To create a child process object, use `require('child_process')` in your code.

Child processes always have three streams associated with them. They are:

* `child.stdin`, the standard input stream
* `child.stdout`, the standard output stream
* `child.stderr`, the standard error stream


#### Example: Running ls in a child process

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/child_process.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## child_process@exit(code, signal)
- code (Number): The final exit code of the process (otherwise, `null`)
- signal (String): The string name of the signal (otherwise, `null`)


This event is emitted after the child process ends.

For more information, see [waitpid(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/wait.2.html).

 
 


##  child_process.stdin -> streams.WritableStream

A [[streams.WritableStream `Writable Stream`]] that represents the child process's `stdin`. Closing this stream via [[child.process.end `end()`]] often causes the child process to terminate.

 



## child_process.stdout -> streams.ReadableStream

 
A [[streams.ReadableStream `Readable Stream`]] that represents the child process's `stdout`.

 


## child_process.pid -> Number

The PID of the child process.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/child.pid.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 


## child_process.spawn(command, [args=[]] [, options]) -> Void
### related to: child_process.exec
- command (String): The Unix command to spawn
- args (String | Array): The command line arguments to pass
- options (Object):  Any additional options you want to transfer

Launches a new process for the given Unix `command`. You can pass command line arguments through `args`. `options` specifies additional options, which default to:

    { 
			cwd: undefined,
      	env: process.env,
      	setsid: false
    }

They refer to:

* `cwd` specifies the working directory from which the process is spawned
* `env` specifies environment variables that will be visible to the new process
* `setsid`, if `true`, causes the subprocess to run in a new session

Note that if `spawn()` receives an empty `options` object, it spawns the process with an empty environment rather than using [[process.env `process.env`]]. This is due to backwards compatibility issues with a deprecated API.

##### Undocumented Options 

There are several internal options&mdash;in particular: `stdinStream`, `stdoutStream`, and `stderrStream`. They are for INTERNAL USE ONLY. As with all undocumented APIs in Node.js, they shouldn't be used.

There is also a deprecated option called `customFds`, which allows one to specify specific file descriptors for the `stdio` of the child process. This API was not portable to all platforms and therefore removed. With `customFds`, it was possible to hook up the new process' [stdin, stdout, stderr] to existing stream; `-1` meant that a new stream should be created. **Use this functionality at your own risk.**

#### Example: Running `ls -lh /usr`, capturing `stdout`, `stderr`, and the exit code

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/child.spawn_1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>


#### Example: A very elaborate way to run `'ps ax | grep ssh'`:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/child.spawn_2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: Checking for a failed `exec`:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/child.spawn_3.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 


## child_process.exec(command[, options], callback(error, stdout, stderr)) -> Object
### related to: child_process.spawn
- command (String): The Unix command to run
- options (Object):The options to pass to the command
- callback (Function): The function to run after the method completes
- error (Error): The standard `Error` object; `err.code` is the exit code of the child process and `err.signal` is set to the signal that terminated the process
- stdout (Streams): The standard output stream
- stderr (Streams): The standard error stream

Runs a Unix command in a shell and buffers the output.

There is a second optional argument to specify several options. The default options are:

    { 
      encoding: 'utf8',
      timeout: 0,
      maxBuffer: 200*1024,
      killSignal: 'SIGTERM',
      cwd: null,
      env: null 
    }

These refer to:

* `encoding` is the current encoding the output is defined with
* `timeout` is an integer, which, if greater than `0`, kills the child process if it runs longer than `timeout` milliseconds
* `maxBuffer` specifies the largest amount of data allowed on stdout or stderr; if this value is exceeded then the child process is killed.
* `killSignal` defines [a kill signal](http://kernel.org/doc/man-pages/online/pages/man7/signal.7.html) to kill the child process with 
* `cwd` is a string defining the current working directory
* `env` is an object with the current environment options

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/child.exec.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Returns

An object containing the three standard streams, plus other parameters like the PID, signal code, and exit code

 

## child_process.execFile(file, args, options, callback(error, stdout, stderr)) -> Void
### related to: child_process.exec
- file (String): The file location with the commands to run
- args (String): The command line arguments to pass
- options (Object): The options to pass to the `exec` call
- callback (Function): The function to run after the method completes
- error (Error): The standard `Error` object, except `err.code` is the exit code of the child process, and `err.signal is set to the signal that terminated the process
- stdout (Streams): is the standard output stream
- stderr (Streams): is the standard error stream

A function similar to `child.exec()`, except instead of executing a subshell it executes the specified file directly. This makes it slightly leaner than `child.exec`. It has the same options and callback.



 


## child_process.fork(modulePath, arguments, options) -> Object
### related to: child_process.spawn
- modulePath (String): The location of the module
- arguments (String): Any starting arguments to use
- options (Object): Any additional options to pass

This is a special case of the [[child\_process.spawn `child_process.spawn()`]] functionality for spawning Node.js processes. In addition to having all the methods in a normal ChildProcess instance, the returned object has a communication channel built-in. The channel is written with `child.send(message, [sendHandle])`, and messages are recieved by a `'message'` event on the child.

By default the spawned Node.js process will have the `stdin`, `stdout`, `stderr` associated with the parent's.

These child nodes are still whole new instances of V8. Assume at least 30ms startup and 10mb memory for each new node. That is, you can't create many thousands of them.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/child.fork.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

The child script, `'sub.js'`, might look like this:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/sub.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

In the child, the `process` object has a `send()` method, and `process` emits objects each time it receives a message on its channel.

The `sendHandle` option on `child.send()` is for sending a handle object to another process. The child receives the handle as as second argument to the `message` event. Here's an example of sending a handle:

    var server = require('net').createServer();
    var child = require('child_process').fork(__dirname + '/child.js');
    // Open up the server object and send the handle.
    server.listen(1337, function() {
      child.send({ server: true }, server._handle);
    });

Here's an example of receiving the server handle and sharing it between processes:

    process.on('message', function(m, serverHandle) {
      if (serverHandle) {
        var server = require('net').createServer();
        server.listen(serverHandle);
      }
    });


 



## child_process.kill([signal='SIGTERM']) -> Void
- signal (String): The kill signal to send

Sends a signal to the child process. See [`signal(7)`](http://www.kernel.org/doc/man-pages/online/pages/man7/signal.7.html) for a list of available signals.

Note that while the function is called `kill`, the signal delivered to the child process may not actually kill it. `kill` really just sends a signal to a process.

For more information, see [`kill(2)`](http://www.kernel.org/doc/man-pages/online/pages/man2/kill.2.html).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/child_process/child.kill.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>


