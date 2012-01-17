## Child Processes

The `child_process` module expose diffrent ways to spawn a new child. Depending
on what method you use the child will be a new process or a new thread.

A new **process** is created when calling `.spawn`, `.execFile` or `.exec`. these
methods return a new `Process` object and share the same propertyies and functions
exposed from this.

A new **thread** is created only when calling `.fork`. The method returns a new
`Thread` object.

Both the `Thread` and then `Process` object inherts properties and mehods form
the `Child` object.

### child_process.spawn(command, [args], [options])

This method will spawn a new `process`, with the given `command` and with the
`args` array as the arguments.

Compared to the command line this would be equal to:

    $ command + " " + args.join(" ")

The third argument `options` is an object takeing this properies:

- cwd: change the current working directory
- env: set the environment of the process, defaults to `process.env`
- setsid: if set to true, will cause the subprocess to be run in a new session
- channel: if set to true, the `stdin` channel will be used as a two way IPC channel

Note that if useing an empty `options` object the process will spawn with an
empty environment. This is because of backwards compatibility issues with a
deprecated API.

The return object is a `Process` object this will always have two `readable streams`
`stdout` and `stderr`. By default is will also have a `writable stream` called `stdin`.

However if using the `channel` option there will not be a `stdin` stream, but
a `writable and readable stream` set in `.channel`.

Example of running `ls -lh /usr`, capturing `stdout`, `stderr`, and the exit code:

    var spawn = require('child_process').spawn,
        ls    = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    ls.on('exit', function (code) {
      console.log('child process exited with code ' + code);
    });

Example of using a simple IRC `channel` there echo back messages:

    if (process.argv[2] === 'child') {
      process.channel.on('data', function (chunk) {
        process.channel.write(chunk);
      });
    } else {
      var spawn = require('child_process').spawn;
      var child = spawn(process.execPath, [process.argv[1], 'child'], {
        channel: true
      });
      child.send('Hallo world');
      child.on('data', function (chunk) {
        console.log(chunk.toString());
      });
    }

This example shows a very elaborate way to run `ps ax | grep ssh`

    var spawn = require('child_process').spawn,
        ps    = spawn('ps', ['ax']),
        grep  = spawn('grep', ['ssh']);

    ps.stdout.pipe(grep.stdin);

    ps.on('exit', function (code) {
      if (code !== 0) console.log('ps process exited with code ' + code);
      grep.stdin.end();
    });

    grep.on('exit', function (code) {
      if (code !== 0) console.log('grep process exited with code ' + code);
    });

### child_process.execFile(file, [args], [options], callback)

This is much like the `.spawn` execept that it buffer `stderr` and `stdout`
and execute the `callback` when done.

The callback gets with the arguments `error`, `stdout` and `stderr`, when
the process exits with `code 0` (sucess) the `error` argument will be null.
And `stdout` and `stderr` will be strings containing the `std` output.

If there was an error the `error` object will contain an `Error` object. And
the `stdout` and `stderr` will be the output until the error occurred.

In case the process was killed interntional by an buffer overload or timeout
the error object will have a `.killed` property set to `true`. Futhermore
the `.code` and `.signal` properties will be the code or signal there terminated
the process.

The `options` object take the same options as `.spawn` but take also the following:

- encoding: will tell how output should is encoded, by default this is 'utf8'
- maxBuffer: This is maximum buffer `stderr` and `stdout` can have, by default this is 200 KB
- timeout: When set the process will be killed after the given time.
- killSignal: The signal there will be send to childs in case of buffer overload or timeout

Note that `.execFile` also return a `Process` object, so you can also listen on
`stderr` and `stdout` without buffering it up.

### child_process.exec(command, [options], callback)

This this is like `.execFile` except that it execute a subshell where the
`command` is being executed.

The `options` argument is also the same.

This runs a command in a shell and buffers the output:

    var exec = require('child_process').exec;
    var child = exec('cat *.js bad_file | wc -l',
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });

Note that `.exec` also return a `Process` object, so you can also listen on
`stderr` and `stdout` without buffering it up.

### chid.fork(file, [args], [options])

This method is do not spawn a new process, but a thread. It also do inherts from
the `Thread` object and not the `Process` object. This result in a significant
diffrenence.

The most important is that the `stdout` and `stderr` channel connected to the parent
so output from the child will be send to the parent directly. Also the new node
instance comes with a `JSON-linebreak IPC` allowing you to easy send messages and
receive `JSON` messages between parent and child.

For example the parent could look like:

    var fork = require('child_process').fork;
    var child = fork('./child.js', );

    n.on('message', function(m) {
      console.log('PARENT got message:', m);
    });

    n.send({ hello: 'world' });

And then the child script, `child.js` might look like this:

    process.on('message', function(m) {
      console.log('CHILD got message:', m);
    });

    process.send({ foo: 'bar' });

The `.send` method can also send handlers between parent and child. This is done
by parsing a second argument to `.send` and the `message` event handle function.

The `args` array is arguments parsed to new node process. In the a shell this
would be equal to:

    $ "node " + command + " " + args.join(" ")

The `options` object takes the following:

- silent: if set to true the stdout and stderr wont be shared between child an parent.
But do note that there is no way to resicve the output from the parent.

## Child

All methods in this module return an objects there inherts properties and methods
from this.

This allow you to easy check if a object is child:

    var cp = require('child_process');
    var child = cp.fork('./child.js');
    if (child instanceof cp.Child) {
      //the object is a Child
    }

### Child.kill(signal='SIGTERM')

All childs can killed the same way, by using this method. Note that this method
actually don't kill the process but send a signal to it. By default the signal
will be `SIGTERM` but can be changed by setting the `signal` argument.

### Event: exit

When the child dies the `child.signalCode` and `child.exitCode` property is set.
Note that only one of them set the other will be `null`. This is then follwed by
emiting the `exit` event. Also note that the event handler takes two arguments
`code` and `signal` this will be equal to thee `signalCode` and `exitCode` properties.

If the child was by the parent the `child.killed` property will be set to `true`.

Example of sending the `SIGHUP` to `grep ssh`.

    var exec = require('child_process').exec,
        grep  = exec('grep ssh');

    grep.on('exit', function (code, signal) {
      console.log('child process terminated due to receipt of signal '+ signal);
    });

    // send SIGHUP to process
    grep.kill('SIGHUP');

## Process

The methods there return a `Process` instance are `.spawn`, `.execFile` and `.exec`.

You can detect if a object is a process by doing:

    var cp = require('child_process');
    var child = cp.fork('./child.js');
    if (child instanceof cp.Process) {
      //the object is a new Process
    }

### Process.stdin
### Process.stdout
### Process.stderr

When spawning a new process this streams are available though the `Process` object.
The `wirtable` streams are `stdin` and the `readable` streams are `stdout` and `stderr`.

Not that `stdin` is not set if the `channel` option was set to `true`.

This example shows how to pipe data between parent and child. Note that in this
case you should use `fork` since this share the all channels between parent and child
on a lower level, which is faster.

    var spawn = require('child_process').spawn;
    var child = spawn(process.execPath, './child.js');

    //Pipe streams
    process.stdin.pipe(child.stdin);
    process.stdout.pipe(child.stdout);
    process.stderr.pipe(child.stderr);

### Process.pid

All process are assigned a process ID by the OS, this can be acces by using this property.

## Thread

The only method there return a `Thread` object is `.fork`.

You can detect if a object is a thread by doing:

    var cp = require('child_process');
    var child = cp.fork('./child.js');
    if (child instanceof cp.Thread) {
      //the object is a new Thread
    }

### Thread.tid

All process are assigned a thread ID by the OS, this can be acces by using this property.

### Thread.send(message, [sendHandle])

As decriped earlier the `.send` method can be used to send `JSON` messages between
parent and child. Normal text messages are also allowed.

The `.send` method do also allow sending socket handlers, this is done by
parseing a second argument to the `.send` method.

### Event: message

When sending a message, the message is resicved in the child or parent by the
`message` event. The first argument in the event handle is a parsed JSON object
and the second is a handle if one was send:

Example of a child echoing back messages and handlers:

    process.on('message', function (message, handle) {
      process.send(message, handle);
    };
