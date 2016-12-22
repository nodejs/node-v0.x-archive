
## class readline

Readline allows you to read of a stream (such as STDIN) on a line-by-line basis. To use this module, add `require('readline')` to your code.

<Note>Once you've invoked this module, your Node.js program won't terminate until you've closed the interface, and the STDIN stream. Here's how to allow your program to gracefully terminate:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/readline/readline.escaping.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

</Note>

#### Example: Crafting a tiny command line interface:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/readline/readline.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

For more real-life use cases, take a look at this slightly more complicated [example](https://gist.github.com/901104), as well as the [http-console](https://github.com/cloudhead/http-console) module.


 

## readline@close()



Emitted whenever the `in` stream receives a `^C` (`SIGINT`) or `^D` (`EOT`). This is a good way to know the user is finished using your program.

#### Example

Example of listening for `close`, and exiting the program afterward:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/readline/readline.close.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
    
 



## readline@line(line)
- line (String): The line that prompted the event


Emitted whenever the `in` stream receives a `\n`, usually received when the user hits Enter, or Return. This is a good hook to listen for user input.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/readline/readline.line.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
 



## readline.close(line) -> Void

Closes the `tty`. Without this call, your program will run indefinitely.




  

## readline.createInterface(input[, output], completer()) -> Void | String
- input (streams.ReadableStream):  The readable stream
- output (streams.WritableStream):  The writeable stream
- completer (Function):  A function to use for autocompletion

Takes two streams and creates a readline interface. 

When passed a substring, `completer()` returns `[[substr1, substr2, ...], originalsubstring]`.

`completer()` runs in an asynchronous manner if it accepts just two arguments:

    function completer(linePartial, callback) {
        callback(null, [['123'], linePartial]);
    }

#### Example

`createInterface()` is commonly used with `process.stdin` and `process.stdout` in order to accept user input:

    var readline = require('readline');

    var myTerminal = readline.createInterface(process.stdin, process.stdout);
  

 



## readline.pause() -> Void

Pauses the `tty`.



  

## readline.prompt() -> Void

Readies the readline for input from the user, putting the current `setPrompt` options on a new line, giving the user a new spot to write.

 



## readline.question(query, callback()) -> Void
- query (String): A string to display the user
- callback (Function): The function to execute once the method completes

Prepends the prompt with `query` and invokes `callback` with the user's respons after it has been entered.

#### Example

    interface.question('What is your favorite food?', function(answer) {
      console.log('Oh, so your favorite food is ' + answer);
    });
  

 



## readline.resume() -> Void

Resumes `tty`.





## readline.setPrompt(prompt, length) -> Void
- prompt (String):  The prompting character; this can also be a phrase
- length (String):  The length before line wrapping

Sets the prompt character. For example, when you run `node` on the command line, you'll see `> `, which is Node's prompt.

 



## readline.write() -> Void

Writes to the `tty`.




