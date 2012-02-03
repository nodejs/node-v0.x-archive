### section: debugger
## Debugging_Node.js

V8 comes with an extensive debugger which is accessible out-of-process via a simple [TCP protocol](http://code.google.com/p/v8/wiki/DebuggerProtocol).

Node.js has a built-in client for this debugger. To use this, start Node.js with the `debug` argument; a prompt appears, ready to take your command:

    % node debug myscript.js
    < debugger listening on port 5858
    connecting... ok
    break in /home/indutny/Code/git/indutny/myscript.js:1
      1 x = 5;
      2 setTimeout(function () {
      3   debugger;
    debug>

Node's debugger client doesn't support the full range of commands, but simple step and inspection is possible. By putting the statement `debugger;` into the source code of your script, you will enable a breakpoint.

For example, suppose `myscript.js` looked like this:

    // myscript.js
    x = 5;
    setTimeout(function () {
      debugger;
      console.log("world");
    }, 1000);
    console.log("hello");

Then once the debugger is run, it will break on line 4.

    % node debug myscript.js
    < debugger listening on port 5858
    connecting... ok
    break in /home/indutny/Code/git/indutny/myscript.js:1
      1 x = 5;
      2 setTimeout(function () {
      3   debugger;
    debug> cont
    < hello
    break in /home/indutny/Code/git/indutny/myscript.js:3
      1 x = 5;
      2 setTimeout(function () {
      3   debugger;
      4   console.log("world");
      5 }, 1000);
    debug> next
    break in /home/indutny/Code/git/indutny/myscript.js:4
      2 setTimeout(function () {
      3   debugger;
      4   console.log("world");
      5 }, 1000);
      6 console.log("hello");
    debug> repl
    Press Ctrl + C to leave debug repl
    > x
    5
    > 2+2
    4
    debug> next
    < world
    break in /home/indutny/Code/git/indutny/myscript.js:5
      3   debugger;
      4   console.log("world");
      5 }, 1000);
      6 console.log("hello");
      7
    debug> quit
    %


The `repl` command allows you to evaluate code remotely. The `next` command steps over to the next line. There are a few other commands available and more to come. Type `help` to see others.

#### Watchers

You can watch expressions and variable values while debugging your code.

On every breakpoint each expression from the watchers list will be evaluated in the current context and displayed just before the breakpoint's source code listing.

To start watching an expression, type `watch("my_expression")`. `watchers` prints the active watchers. To remove a watcher, type `unwatch("my_expression")`.

#### Commands Reference

##### Stepping

* `cont`, `c`: Continue
* `next`, `n`: Step next
* `step`, `s`: Step in
* `out`, `o`: Step out

##### Breakpoints

* `setBreakpoint()`, `sb()`: Sets a breakpoint on the current line
* `setBreakpoint('fn()')`, `sb(...)`: Sets a breakpoint on the first statement in the function's body
* `setBreakpoint('script.js', 1)`, `sb(...)`: Sets a  breakpoint on the first line of `script.js`
* `clearBreakpoint`, `cb(...)`: Clears a breakpoint

##### Info

* `backtrace`, `bt`: Prints a backtrace of the current execution frame
* `list(c)`: Lists the script's source code with a five line context (five lines before and after)
* `watch(expr)`: Adds an expression to the watch list
* `unwatch(expr)`: Removes am expression from the watch list
* `watchers`: Lists all the watchers and their values (automatically listed on each breakpoint)
* `repl`: Open the debugger's REPL for evaluation in debugging a script's context

##### Execution control

* `run`: Run a script (automatically runs on debugger's start)
* `restart`: Restart a script
* `kill`: Kill a script

##### Various

* `scripts`: List all the loaded scripts
* `version`: Display the V8 version

#### Advanced Usage

The V8 debugger can be enabled and accessed either by starting Node.js with the `--debug` command-line flag or by signaling an existing Node.js process with `SIGUSR1`.

