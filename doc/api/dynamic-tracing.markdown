# Dynamic tracing

    Stability: 3 - Stable

<!-- type=misc -->

Node.js has built-in support for dynamic tracing using tools like DTrace,
SystemTap, and ETW (Event Tracing for Windows).  Using these tools, you can get
information about what a running Node program is doing and better understand the
performance of your Node programs.

The way these tools typically work is that you use the tool built into your
operating system (DTrace, SystemTap, ETW, or the like), and it will
automatically discover **probes** in Node.js programs.  Depending on the tool
you're using, you'll normally configure some kind of data collection **action**
to be taken when each probe fires.  For example, you might tell DTrace to print
a JavaScript stack trace whenever the "gc-start" probe fires (when a garbage
collection operation starts), or you might have SystemTap keep a counter of the
number of times the "http-server-request" probe fires (when a request is
received by the HTTP server).

There are three main ways to use dynamic tracing with Node.js:

* tracing probes built into Node.js itself
* tracing custom, application-specific probes
* profiling Node.js using the ustack helper

The examples in this section use DTrace.  See the documentation for the tool for
your operating system for examples of how to use it.


## Supported platforms

Dynamic tracing support is operating-system-specific:

    | Platform             | Tracing framework | Supported operations                  |
    | -------------------- | ----------------- | ------------------------------------- |
    | BSD, illumos (SunOS) | DTrace            | all probes, ustack helper (profiling) |
    | OS X                 | DTrace            | all probes                            |
    | GNU/Linux            | SystemTap         | all probes                            |
    | Windows              | ETA               | all probes                            |


## Tracing probes built into Node.js

Node provides probes for garbage collection, http server activity, http client
activity, and other net-related activity.  There's a publicly available tool
called [nhttpsnoop](https://github.com/joyent/nhttpsnoop) for tracing all of
the probes built into Node.js.  If you're looking for a quick start, check out
nhttpsnoop.  This section covers the probes at a lower level.  For a list of
all the probes and their arguments, see the "Probes Reference" section below.

This one-liner will trace all GC, HTTP, and net-related activity in all Node
processes on the system:

    $ dtrace -q -n 'node*:::{ printf("%Y %6d %s\n", walltimestamp, pid, probename); }'
    2015 Feb 12 21:45:19  12732 http-server-request
    2015 Feb 12 21:45:19  14796 http-client-request
    2015 Feb 12 21:45:19  12732 http-server-response
    2015 Feb 12 21:45:19  12732 net-stream-end
    2015 Feb 12 21:45:19  14796 http-client-response
    2015 Feb 12 21:45:19  14796 net-stream-end
    2015 Feb 12 21:45:20  14993 net-server-connection
    2015 Feb 12 21:45:20  14993 net-stream-end
    2015 Feb 12 21:45:20  14988 gc-start
    2015 Feb 12 21:45:20  14988 gc-done
    ...

This just gives you high-level information, including the wall time, process
id, and the event.  You can trace more details for HTTP requests, for example:

    $ dtrace -q -n 'node*:::http-server-request{
        printf("%Y %6d %-6s %s\n", walltimestamp, pid,
            copyinstr(arg4), copyinstr(arg5)); }'
    2015 Feb 12 21:51:33  12732 GET    /configs/b8c40beb-8194-4906-b999-4d052a791664
    2015 Feb 12 21:51:33  12732 GET    /configs/8f15b385-dae1-4928-b84b-3e3a254ca3d8
    2015 Feb 12 21:51:37  13970 GET    /ping
    2015 Feb 12 21:51:37  13970 GET    /ping

You can also trace latency by tracing the "start" and "done" of an operation
like garbage collection.  This example traces GC for 10 seconds and prints out
a histogram showing how long (in nanoseconds) GC operations took:

    # dtrace -c 'sleep 10' -n 'node*:::gc-start{ self->t = timestamp; }' \
          -n 'node*:::gc-done/self->t/{ @ = quantize(timestamp - self->t); self->t = 0; }' 
    dtrace: description 'node*:::gc-start' matched 114 probes
    dtrace: description 'node*:::gc-done' matched 114 probes
    dtrace: pid 33358 has exited
    
               value  ------------- Distribution ------------- count    
               65536 |                                         0        
              131072 |@@@@                                     1        
              262144 |@@@@                                     1        
              524288 |                                         0        
             1048576 |                                         0        
             2097152 |@@@@@@@@@@@@@@@@@@                       4        
             4194304 |@@@@@@@@@@@@@                            3        
             8388608 |                                         0   

For more details, try playing around with the `nhttpsnoop` tool using the "-n"
flag to see the D script that it runs.


## Custom probes for your Node application

You can add custom probes to your Node application using the
[node-dtrace-provider](https://github.com/chrisa/node-dtrace-provider) add-on.
This lets you run the same kinds of scripts as above using your own probes.
For details and examples, see the node-dtrace-provider documentation.


## Profiling Node.js

Profiling Node.js refers to periodically sampling the call stacks of running
Node programs to identify which functions are taking lots of time on CPU.  This
is useful when you've already established using system tools that your Node
program is spending most of its time on CPU (as opposed to blocked on
asynchronous activity).

There are many ways to profile Node programs.  The advantages of using dynamic
tracing for this are that it's cheap enough to run in production, it does not
require running your program with special arguments (so you do not need to
restart it in order to enable profiling), and it works even when the VM itself
is not functioning properly.  Profiling Node with dynamic tracing is only
supported on illumos and BSD systems.

You may want to install c++filt (typically distributed with your compiler) and
either [stackvis](https://github.com/joyent/node-stackvis) or the original
[FlameGraph](http://github.com/brendangregg/FlameGraph/) tools to visualize
profiling output.  You can install "stackvis" with:

    $ npm install -g stackvis

To profile your Node program:

1. Run your Node program as usual.

2. In a separate terminal, run:

        $ dtrace -n 'profile-97/execname == "node" && arg1/{
            @[jstack(150, 8000)] = count(); }' -c 'sleep 60' > stacks.out

   This will sample about 100 times per second for 60 seconds and save results
   into stacks.out.  (It actually uses 97Hz to avoid oversampling periodic
   activity.)  Note that this will sample all programs called "node".  If you
   want to sample only a specific process, replace `execname == "node"` with
   `pid == 12345` (the process id).

3. (Optional) Demangle C++ symbols by running the output through c++filt:

        $ c++filter < stacks.out > stacks-filtered.out && \
              mv stacks-filtered.out stacks.out

4. Create a flamegraph using stackvis:

        $ stackvis dtrace flamegraph-d3 < stacks.out > stacks.svg

5. You can open "stacks.svg" in your favorite browser.

Interpreting flame graphs can be challenging at first.  The flame graph shows
call stacks.  The vertical axis represents depth in the call stack, and the
horizontal axis represents the *percentage* of time that a given call stack was
sampled.  For example:

<img src="../flame-graph.png" width="843" height="584" />

In this example, we see "\_start" at the bottom, and it's the full width of the
graph because 100% of samples had that function at the bottom of the stack.
"main" and "node::Start" are also in every sampled stack.  Nearly every sampled
stack had "uv\_run" next.  After that, things get interesting: about 10% of
samples had "uv\_\_io\_poll" on the stack, 15% had "uv\_\_run\_check", and most
of the rest had "uv\_\_run\_timers".  This essentially means that
"uv\_\_run\_timers" was indirectly responsible for about 75% of on-CPU time for
this program.  We say indirectly because most of the time this function was on
the stack, the program was actually executing in one of the functions called by
"uv\_\_run\_timers", not "uv\_\_run\_timers" itself.  By contrast, the "spin"
function at the top of the graph is highlighted because it is *directly*
responsible a large percentage of CPU time, since it was at the top of the stack
in a lot of the samples.

Remember: the flame graph shows *on-cpu* time, not wall clock time.  These
percentages are only meaningful if you've already established that your Node
program was running on-CPU a lot.


## Probes Reference

Node.js provides several built-in probes under the provider name "node".

    | Probe name            | Event                                  | arg0                   | arg1                | arg2        | arg3     | arg4          | arg5       | arg6   |
    | ----------            | -------------------------------------- | ---------------------- | ------------------- | ----------- | -------- | ------------- | ---------- | ------ |
    | gc-start              | garbage collection operation started   | int gctype             | int gcflags         |             |          |               |            |        |
    | gc-done               | garbage collection operation done      | int gctype             | int gcflags         |             |          |               |            |        |
    | http-client-request   | an HTTP request was sent (client)      | node_http_request_t    | node_connection_t   | string ip   | int port | string method | string url | int fd |
    | http-client-response  | an HTTP response was received (client) | node_connection_t      | string ip           | int port    |          |               |            |        |
    | http-server-request   | an HTTP request was received (server)  | node_http_request_t    | node_connection_t   | string ip   | int port | string method | string url | int fd |
    | http-server-response  | an HTTP response was sent (server)     | node_connection_t      | string ip           | int port    |          |               |            |        |
    | net-server-connection | a TCP server has accepted a connection | node_connection_t      | string ip           | int port    | int fd   |               |            |        |
    | net-stream-end        | a net stream has been ended            | node_connection_t      | string ip           | int port    | int fd   |               |            |        |

### Structured types

On illumos systems, you can use the structured types (`node_http_request_t` and
`node_connection_t`) to access fields by name.  These types can be extended in
the future.  On other systems, you should use the primitive type arguments
(`string` and `int`).

#### Type `node_connection_t`

    typedef struct {
            int fd;                /* file descriptor */
            string remoteAddress;  /* remote IP address */
            int remotePort;        /* remote TCP port */
            int bufferSize;        /* buffered data */
    } node_connection_t;

#### Type `node_http_request_t`

    typedef struct {
            string url;            /* request URL */
            string method;         /* request method */
            string forwardedFor;   /* x-forwarded-for header */
    } node_http_request_t;

### Other arguments

    | Argument    | Description                                     |
    | ----------- | ----------------------------------------------- |
    | int fd      | File descriptor                                 |
    | string ip   | IP address, in string form.                     |
    | int port    | TCP port                                        |
    | string url  | IP address, in string form.                     |
    | int gctype  | Type of GC.  See V8's "GCType" enum.            |
    | int gcflags | Flags for GC.  See V8's "GCCallbackFlags" enum. |


## Other resources

There are many resources for using dynamic tracing to debug software problems.
You may want to take a look at:

* [node-bunyan](https://github.com/trentm/node-bunyan), a logging module that
  supports using DTrace to [snoop logs at
  runtime](https://www.joyent.com/blog/node-js-in-production-runtime-log-snooping).
* [node-restify](https://github.com/mcavage/node-restify), an HTTP module that
  includes DTrace probes for measuring [request handler
  latency](http://mcavage.me/node-restify/#dtrace).
* [Tracing Node add-on
  latency](https://www.joyent.com/blog/tracing-node-js-add-on-latency).
