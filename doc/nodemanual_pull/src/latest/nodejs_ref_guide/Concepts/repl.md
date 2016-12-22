
## class repl

A Read-Eval-Print-Loop (REPL) is available both as a standalone program and easily includable in other programs.  REPL provides a way to interactively run Javascript and see the results.  It can be used for debugging, testing, or just trying things out.

By executing `node` without any arguments from the command line, you'll be dropped into the REPL. It has a simplistic emacs line-editing:

    mjr:~$ node
    Type '.help' for options.
    > a = [ 1, 2, 3];
    [ 1, 2, 3 ]
    > a.forEach(function (v) {
    ...   console.log(v);
    ...   });
    1
    2
    3

For advanced line-editors, start `node` with the environmental variable `NODE_NO_READLINE=1`. This starts the REPL in canonical terminal settings which allow you to use with `rlwrap`.

For a quicker configuration, you could add this to your `.bashrc` file:

    alias node="env NODE_NO_READLINE=1 rlwrap node"

#### REPL Features

Inside the REPL, multi-line expressions can be input, and tab completion is supported for both global and local variables.

The special variable `_` contains the result of the last expression, like so:

    > [ "a", "b", "c" ]
    [ 'a', 'b', 'c' ]
    > _.length
    3
    > _ += 1
    4

The REPL provides access to any variables in the global scope. You can expose a variable to the REPL explicitly by assigning it to the `context` object associated with each `REPLServer`.  For example:

    // repl_test.js
    var repl = require("repl"),
        msg = "message";

    repl.start().context.m = msg;

Things in the `context` object appear as local within the REPL:

    mjr:~$ node repl_test.js
    > m
    'message'

#### Special Commands

There are a few special REPL commands:

  - `.break`: while inputting a multi-line expression, sometimes you get lost or just don't care about completing it; this wipes it out so you can start over
  - `.clear`: resets the `context` object to an empty object and clears any multi-line expression.
  - `.exit`: closes the I/O stream, which causes the REPL to exit.
  - `.help`: shows this list of special commands
  - `.save`: save the current REPL session to a file, like so: `>.save ./file/to/save.js`
  - `.load`: loads a file into the current REPL session, like so: `>.load ./file/to/load.js`

#### Key Combinations

The following key combinations in the REPL have special effects:

  - `<ctrl>C` - Similar to the `.break` keyword, this terminates the current command.  Press twice on a blank line to forcibly exit the REPL.
  - `<ctrl>D` - Similar to the `.exit` keyword, it closes to stream and exits the REPL
        




## repl.start([prompt='&gt; '] [, stream=process.stdin] [, eval=eval] [, useGlobal=false] [, ignoreUndefined=false])
 - prompt (String): The starting prompt
 - stream (String): The stream to read from
 - eval (String): An asynchronous wrapper function that executes after each line
 - useGlobal (String):  If `true`, then the REPL uses the global objectm instead of scripts in a separate context
 - ignoreUndefined (String): If `true`, the REPL won't output return valyes of a command if it's `undefined`

 Starts a REPL with `prompt` as the prompt and `stream` for all I/O. 
 
 You can use your own `eval` function if it has the following signature:
  
     function eval(cmd, callback) {
       callback(null, result);
     }
 
 Multiple REPLs can be started against the same running instance of node.  Each share the same global object but will have unique I/O.
 
 #### Example
 
 Here's an example that starts a REPL on stdin, a Unix socket, and a TCP socket:
 
     var net = require("net"),
         repl = require("repl");
 
     connections = 0;
 
     repl.start("node via stdin> ");
 
     net.createServer(function (socket) {
       connections += 1;
       repl.start("node via Unix socket> ", socket);
     }).listen("/tmp/node-repl-sock");
 
    net.createServer(function (socket) {
       connections += 1;
       repl.start("node via TCP socket> ", socket);
     }).listen(5001);

