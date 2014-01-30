# Summary

  TL;DR - node should have a -x switch to allow script authors to
  pass multiple v8 option arguments to the node executable.

*Note that this file (Minus-X-Switch-Proposal.md) is not intended to be a permanent part of the
codebase, and it will be removed before the final pull request is submitted.*

# Motivation

  Node 0.12 will have a different version of v8 than 0.10.  Some scripts and
modules may need to confugure v8 to behave in specific ways.  V8 is configured
by passing command-line options to the node executable.

  There is currently no portable way for a script to pass options to the node executable.

# Background

## Shebang Interpretation

  When the operating system loads a script file, it checks for the characters
'#' and '!' at the beginning of the buffer and, if present, runs the script
in the named interpreter.

  This is an operating-system behavior, and it differs between Linux, *BSD,
OSX, and Windows.  (To some extent, shells can facilitate or emulate this,
e.g., #! works under cygwin.)

  In particular, on *BSD and OSX, the #! command line behavior supports multiple
arguments, while on Linux and Cygwin only one argument is supported.  So a script
named 'script' with the following contents is interpreted differently on different
systems:

    #!/bin/interpreter -1 -2 -3
    # .. more script

    $ ./script

    OSX, FreeBSD:
    argv[0] = "/bin/interpreter"
    argv[1] = "-1"
    argv[2] = "-2"
    argv[3] = "-3"
    argv[4] = "./script"

    Linux, Cygwin
    argv[0] = "/bin/interpreter"
    argv[1] = "-1 -2 -3"
    argv[2] = "./script"

 The situation on Windows is worse; on the OS level, Windows uses the file extension
to choose the interpreter.  #! is not supported either in CMD.EXE or PowerShell.

## Other Script Interpreters (perl, ruby)

In order to support passing multiple arguments to the interpreter on all
systems, a common idiom has been developed.  This is to supply the "-x"
switch to the interpreter, which causes it to ignore lines from the script
file until it finds a line which both:

 1. starts with #!
 1. contains the interpreter's name.

This works around the operating system limitation on the number of arguments
that can be passed to the interpreter.  It is typically necessary to write the
header of the script in a shell language such as bash, and invoke the desired
interpreter with 'exec':


    #!/usr/bin/env bash
    exec /usr/bin/env perl -x $0 "$@"
    #!perl -s -p -i.orig
    # ... rest of script follows

Ruby uses the same convention as perl.

    #!/usr/bin/env bash
    exec /usr/bin/env ruby --disable-gems -x "$0" $*
    #!ruby

# Proposal

 I propose to add a new command-line switch to node (-x) following similar semantics as
used by perl and ruby, namely:

* The -x switch causes node to skip everything in the first input file/stream up to
a line starting with '#!' and containing 'node' (as in ruby and perl)

However,

* The -x switch in node does *NOT* take an optional argument as in ruby and perl.

Script authors can control the arguments passed to node using a similar
syntax to that used by ruby and perl.


     #!/usr/bin/env bash
     exec /usr/bin/env node -x --harmony --harmony_typeof -- $0 "$@"
     #!node

# Implementation

Currently in node internals, the v8 engine is configured by the command line arguments
and initialized before the main environment is created.  The environment invokes
the main function, which loads and runs the script file using Module.runMain().

Ideally it would be possible for the node executable to read command-line options from the
script in one pass.  This is not practically possible since the initial script parsing is
done in javascript, with v8 already configured and initialized.  Therefore I will assume that
the first pass will be handled by bash or another shell, and when node is starting up it
has already processed the supplied command-line arguments.

The remaining problem is to ignore the preamble, and parse the script as a valid
javascript file.  An example preamble is reproduced below.

    $ cat preamble.js
    #!/usr/bin/env bash
    exec /usr/bin/env node -x --harmony --harmony_typeof -- $0 "$@"
    #!node
    // javascript beginning here

To preserve line numbering, the implementation will replace each line up to and including
the '#!node' line with a single newline.

## Command Line Option

Three sections are added to src/node.cc to support the `-x` command line option and
expose it on the process object as `process._stripUntilShebangNode`

## Change to module parsing

Some changes are necessary in lib/module.js.  The API for this module is Locked, so these
changes do not alter the previous behavior of published API functions.  The changes are:

* Introduce a function `Module._removePrologue(content, doStrip)`

   In the default case, when doStrip is false, this function removes the contents of
the first '#!' line of the file, leaving a newline

   When the second argument is truthy, `_removePrologue` splits the content
into lines and replaces each line with an empty string until it sees a line which both
begins with '#!' and contains 'node'.  The lines are joined with '\n' and returned.

* Call `Module._removePrologue` from `Module.prototype._compile`

   In `Module.prototype._compile`, we detect whether the -x switch is
set and whether we are compiling the main module (`self.id === '.'`).
This result is stored in a boolean, doSpecialStrip, for clarity.

   `Module._removePrologue` is then invoked, passing the file contents and
the value doSpecialStrip.

# Alternatives

It is possible to work around the single-argument limit in several other ways.

## Alias

Instead of invoking a script directly, an alias can be configured in the user's shell:


    alias foo='/usr/bin/env node --harmony /path/to/foo'

This accomplishes the same effect as if the file 'foo' were set up using
a #!shell, exec, and #!node invocation.

Using an alias has the advantage of requiring one fewer exec(); instead of executing
a new shell instance which exec's node, node is exec'ed directly with the correct
parameters.

The disadvantage of using an alias is an extra layer of indirection and configuration.
The user's shell must support aliases; the alias must be configured in the user's shell
startup file; in order to change the command-line options passed to node it is necessary to
both change the alias and reload the shell's configuration file, etc.

The most prominent disadvantage of aliases is that some processes (e.g., cron jobs) may
run with a shell that does not support aliases, or it may not be possible for the user to
configure that shell's environment

## Wrapper Script

A wrapper script or shim can be used to invoke a node script.  The wrapper script
has full control over the node command line and can pass any arguments that are desired.
For example:

    file foo:
    #!/usr/bin/env bash
    /usr/bin/env node --harmony ./foo.js "$@"

    file foo.js
    // foo.js (needs --harmony)
    // more js code

This proposal would allow a node script to serve as its own wrapper script.

# Remaining Issues

If this is accepted, then [cmd-shim](https://github.com/ForbesLindesay/cmd-shim) will
need to be updated to support the -x switch and #!node lines.  A mechanism using
wrapper scripts is necessary on Windows in any case.  I volunteer to do the
necessary work on cmd-shim.

# References

Shebang history and details
http://www.in-ulm.de/~mascheck/various/shebang/

Shebang FAQ
http://homepages.cwi.nl/~aeb/std/hashexclam-1.html#ss1.4

Wikipedia Shebang_(Unix)
https://en.wikipedia.org/wiki/Shebang_(Unix)

Original Patch submitted to Linux Kernel Mailing list (2004), rejected
https://lkml.org/lkml/2004/2/16/74

FreeBSD mailing list discussion of multiple argument support
http://unix.derkeiler.com/Mailing-Lists/FreeBSD/arch/2005-02/0039.html

Linux Kernel source binfmt_script.c (implements #! processing, one argument hardcoded)
https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/fs/binfmt_script.c

Example of need for -x switch (ruby)
https://github.com/garybernhardt/selecta/blob/master/selecta

Perl Security - switches on the #! line
http://perldoc.perl.org/perlsec.html#Switches-On-the-%22%23!%22-Line

Python - How do I make python scripts executable? (Windows NT)
http://effbot.org/pyfaq/how-do-i-make-python-scripts-executable.htm
