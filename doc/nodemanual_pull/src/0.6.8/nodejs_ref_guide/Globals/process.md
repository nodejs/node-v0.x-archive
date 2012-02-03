
## class process

The `process` object is a global object, and can be accessed from anywhere. It is an instance of [[eventemitter `EventEmitter`]].


#### Example: Handling Signal Events

Signal events are emitted when processes receive a signal. See [sigaction(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/sigaction.2.html) for a list of standard POSIX signal names such as SIGINT, SIGUSR1, etc.

#### Example: Listening for `SIGINT`:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## process@exit()

Emitted when the process is about to exit.  This is a good hook to perform constant time checks of the module's state (like for unit tests).  The main event loop will no longer be run after the `exit` callback finishes, so timers may not be scheduled.

#### Example: Listening for an `'exit'` event:

    process.on('exit', function () {
        process.nextTick(function () {
            console.log('This will not run');
        });
        console.log('About to exit.');
    });

 



## process@uncaughtException(err)
- err (Error): The standard Error Object

Emitted when an exception bubbles all the way back to the event loop. If a listener is added for this exception, the default action (which is to print a stack trace and exit) won't occur.

#### Example: Listening for an `'uncaughtException'`:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.uncaughtException.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

<Note>An `uncaughtException` is a very crude mechanism for exception handling. Using `try / catch` in your program gives you more control over your program's flow.  Especially for server programs that are designed to stay running forever, `uncaughtException` can be a useful safety mechanism.</Note>


 



## process.chdir(directory) -> Void
- directory (String):  The directory name to change to

Changes the current working directory of the process or throws an exception if that fails.

#### Example

    console.log('Starting at directory: ' + process.cwd());
    try {
      process.chdir('/tmp');
      console.log('New directory: ' + process.cwd());
    }
    catch (err) {
      console.log('chdir failed: ' + err);
    }

 



## process.cwd() -> String

Returns the current working directory of the process. For example:

  console.log('Current directory: ' + process.cwd());






## process.exit(code=0) -> Void
- code (Number): The code to end with

Ends the process with the specified `code`.

#### Example: Exiting with a 'failure' code:

    process.exit(1);

The shell that executed this should see the exit code as `1`.

 



## process.getgid() -> Number

Gets the group identity of the process. This is the numerical group id, not the group name. For more information, see [getgid(2)](http://kernel.org/doc/man-pages/online/pages/man2/getgid.2.html).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.getgid.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>






## process.getuid() -> Number


Gets the user identity of the process. Note that this is the numerical userid, not the username. For more information, see [getuid(2)](http://kernel.org/doc/man-pages/online/pages/man2/getuid.2.html).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.getuid.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## process.kill(pid, signal='SIGTERM') -> Void
- pid (Number):  The process id to kill
- signal (String): A string describing the signal to send; the default is `SIGTERM`.

Send a signal to a process. The `signal` names are strings like 'SIGINT' or 'SIGUSR1'. For more information, see [kill(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/kill.2.html).

<Note>Just because the name of this function is `process.kill`, it is really just a signal sender, like the `kill` system call.  The signal sent may do something other than kill the target process.</Note>

#### Example: Sending a signal to yourself

    process.on('SIGHUP', function () {
      console.log('Got SIGHUP signal.');
    });

    setTimeout(function () {
      console.log('Exiting.');
      process.exit(0);
    }, 100);

    process.kill(process.pid, 'SIGHUP');

 



## process.memoryUsage() -> Object

Returns an object describing the memory usage of the Node.js process measured in bytes.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.memoryusage.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

This generates:

  { rss: 4935680,
    heapTotal: 1826816,
    heapUsed: 650472 }

In this object, `heapTotal` and `heapUsed` refer to V8's memory usage.





## process.nextTick(callback()) -> Void
- callback (Function):  The callback function to execute on the next tick

On the next loop around the event loop call this callback. This is **not** a simple alias to `setTimeout(fn, 0)`; it's much more efficient.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.nexttick.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## process.setgid(id) -> Void
- id (Number): The new identity for the group process

Sets the group identity of the process. This accepts either a numerical ID or a groupname string. If a groupname is specified, this method blocks while resolving it to a numerical ID. For more information, see [setgid(2)](http://kernel.org/doc/man-pages/online/pages/man2/setgid.2.html).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.setgid.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
 
 



## process.setuid(id) -> Void
- id (Number):  The new identity for the user process

Sets the user identity of the process. This accepts either a numerical ID or a username string.  If a username is specified, this method blocks while resolving it to a numerical ID. For more information, see [setuid(2)](http://kernel.org/doc/man-pages/online/pages/man2/setuid.2.html).

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.setuid.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## process.umask([mask]) -> Void
- mask (Number): The mode creation mask to get or set

Sets or reads the process's file mode creation mask. Child processes inherit the mask from the parent process. Returns the old mask if `mask` argument is given, otherwise returns the current mask.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.umask.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## process.uptime() -> Number

Returns the number of seconds Node.js has been running.





## process.arch -> String

Identifies which processor architecture you're running on: `'arm'`, `'ia32'`, or `'x64'`.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.arch.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## process.argv -> Array

An array containing the command line arguments.  The first element is 'node', and the second element is the name of the Javascript file.  The next elements will be any additional command line arguments.

#### Example

First, create a file called process.argv.js:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.argv.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>

Then, using the Node.js REPL, type the following command:

  $ node process-2.js one two=three four

You should see the following results:

  0: node
  1: <directoryPath>/process.js
  2: one
  3: two=three
  4: four



 

## process.execPath -> String

This is the absolute pathname of the executable that started the process.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.execpath.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>
    
 



## process.pid -> Number

Returns the PID of the process.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.pid.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>
    
 

   

## process.platform -> String

Identifies the platform you're running on, like `'linux2'`, `'darwin'`, etc.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.platform.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>

 



## process.title -> Void | String

A getter and setter to set what is displayed in `ps`.

 




## process.version -> String

A compiled-in property that exposes the `NODE_VERSION`.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.version.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>

 



## process.versions -> Object

A property exposing version strings of Node.js and its dependencies.

#### Example

The following code:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.versions.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>

outputs something similar to:

   { node: '0.4.12',
    v8: '3.1.8.26',
    ares: '1.7.4',
    ev: '4.4',
    openssl: '1.0.0e-fips' }
 



## process.installPrefix -> String

A compiled-in property that exposes the `NODE_PREFIX`.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.installprefix.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>

 



## process.stderr -> fs.WriteStream

A writable stream to stderr.

`process.stderr` and `process.stdout` are unlike other streams in Node.js in that writes to them are usually blocking.  They are blocking in the case that they refer to regular files or TTY file descriptors. In the case they refer to pipes, they are non-blocking like other streams.





## process.env -> Object

An object containing the user environment. For more information, see [environ(7)](http://kernel.org/doc/man-pages/online/pages/man7/environ.7.html).

 



## process.stdin -> fs.ReadableStream

A `Readable Stream` for stdin. The stdin stream is paused by default, so one must call `process.stdin.resume()` to read from it.

#### Example

Here's an example of opening standard input and listening for both events:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/process/process.stdin.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>





## process.stdout -> fs.WriteStream


A writable stream to `stdout`.

`process.stderr` and `process.stdout` are unlike other streams in Node.js in that writes to them are usually blocking.  They are blocking in the case that they refer to regular files or TTY file descriptors. In the case they refer to pipes, they are non-blocking like other streams.

As an aside, here's what the innards of `console.log()` look like:

    console.log (d) {
      process.stdout.write(d + '\n');
    };

 

