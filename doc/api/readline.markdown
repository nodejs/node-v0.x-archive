## readline

This module provides utilities for capturing user input. This module is used by the REPL.
It provides the following methods:

### readline.createInterface(inputStream, outputStream [, completer])

A constructor to create a readline interface.
Accepts an `inputStream`, an `outputStream` and an optional `completer` function.

Example:

    var readline = require('readline');
    var rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt('Enter an email address: ');
    rl.prompt();
    
    rl.on('line', function(value) {
      console.log(value)
      process.kill(process.pid);
    });

Readline supports tab completion, you can pass a custom completion function that will be executed when the tab key is pressed. 

    var commands = [
      'info@foo.com',
      'support@foo.com',
      'sales@foo.com',
      'partnership@foo.com'
    ];

    function complete(line) {
      
      // Match me with a command.
      var matches = [];
      
      // Remove leading whitespace
      line = line.replace(/^\s*/, '');

      for (var i = 0; i < commands.length; i++) {
        if (commands[i].indexOf(line) >= 0) {
          matches.push(commands[i]);
        }
      }

      return [matches, line];
    };

### readline.setPrompt(string)

Set the prompt to the string provided.

### readline.prompt()

Display the prompt.

### readline.question(string, callback)

Set the prompt to the string provided, after input is captured, call the callback.

### key and key combination behaviors

#### Control and shift pressed

  `shift + backspace` delete until end of line toward the left
  `delete` delete until end of line toward the right

#### Control key pressed
  
    `ctrl + c` emit SIGINT
    `ctrl + h` delete left
    `ctrl + d` delete right or EOF
    `ctrl + u` delete the whole line
    `ctrl + k` delete from current to end of line
    `ctrl + a` move cursor to the start of the line
    `ctrl + e` move cursor to the end of the line
    `ctrl + b` move cursor back one character
    `ctrl + f` move cursor forward one character
    `ctrl + n` next history item
    `ctrl + p` previous history item
    `ctrl + z` exit readline

    `ctrl + delete`                   delete forward to a word boundary
    `ctrl + w` or `ctrl + backspace`  delete backwards to a word boundary  
    `ctrl + backspace`                delete word left

    `ctrl + left` move cursor word left
    `ctrl + right` move cursor word right

#### Meta key pressed

    `meta + b`                    move cursor backward word
    `meta + f`                    move cursor forward word
    `meta + d` or `meta + delete` delete forward word
    `meta + backspace'            delete backwards to a word boundary

#### No modifier keys pressed

    `enter`       emits the `line` the event and adds the value of the line as history.
    `backspace`   delete a character to the left
    `delete`      delete a character to the right
    `tab`         attempt tab completion (see the `completer` object as detailed above)
    `left`        move cursor left
    `right`       move cursor right
    `home`        move cursor to the beginning of the line
    `end`         move cursor to the end of the line
  
    `up`          previous history item
    `down`        next history item

