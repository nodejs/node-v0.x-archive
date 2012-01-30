# Simulating Object-Orientation with Closures

One of the greatest features of Javascript is the [closure][wikipedia-closure]. From Wikipedia, a closure is:

> [A] first-class function with free variables that are bound in the lexical environment. Such a function is said to be "closed over" its free variables. A closure is defined within the scope of its free variables, and the extent of those variables is at least as long as the lifetime of the closure itself.

Or, to break it down:

> A closure is a function defined within another scope that has access to all the variables within the outer scope.

Imagine this piece of code:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/closures/greet_plain.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

We're manually passing the internal state around so that the other functions can get ahold of it. It works and is really simple, but assuming you never need the generated message string outside of the `greet()` function, there's no point making the user of the API handle internal data for you. Also, what if later on the `greet()` function needed some other data? You'd have to change everything to pass along more variables.

Clearly there must be a better way.

One use of  a closure is to call a function that generates another function (or group of functions), but hides all the state in private variables within the closure:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/closures/greeter.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Note that the `greet()` function is nested within the `greeter()` function. This means it's within the lexical scope of `greeter()`, and thus, according to the rules of closure, has access to the local variables of `greeter` including `message`, `name`, and `age`.

#### Using closures instead of objects

Some people who come to Javascript are experienced programmers from other languages, where classes and instances are the common way to handle this kind of encapsulation. Javascript has something similar in the form of constructor functions and function prototypes.

Consider the following class. It uses a classical constructor with function prototypes to work like a class from other languages:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/closures/personclass.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Since you're using the object itself as the place to store state, all references have to be prefixed with `this`.  It's impossible to hide any variables since everything that's accessible to your methods is also publicly readable, writable, and even deletable. Also, if you have a function nested inside of anything, then `this` changes on you, unless it's explicitly passed through or preserved with a closure. (see the `slowGreet` method).

To illustrate these points, here's how you can use the class:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/closures/useclass.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Looks like object-oriented programming, right? The good thing is that you get to write your methods outside of the constructor instead of nested inside it.  This is a very comfortable pattern and is used by a lot of successful Javascript projects.