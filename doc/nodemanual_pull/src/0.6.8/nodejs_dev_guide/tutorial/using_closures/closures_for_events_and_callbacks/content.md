# Closures for Events and Callbacks

This is where closures are the most useful. In fact, this is the reason that Ryan Dahl (the creator of Node.js) used Javascript in the first place.  C doesn't have closures, and it makes non-blocking code difficult to write.

The simplest example (which we just saw earlier) is `setTimeout()`.  This is a non-blocking function call.  The code in the passed in callback won't get called till after the timeout happens.  This will be on a completely new stack and the only way to get data into it is through lexical scope and a closure.

Take a look at this code, and try to run it:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/closures/settimeout.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

This won't work: `message` is undefined since it's a local variable to `setAlarm()`, and doesn't exist outside that function.  Instead, we need to define the `handle` function inside of the `setAlarm` function:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/closures/settimeout2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Using `this` is especially painful when dealing with setting callbacks. This is because specifying a method of an object as the callback function will cause the function by itself to be the callback, not the object associated with it.