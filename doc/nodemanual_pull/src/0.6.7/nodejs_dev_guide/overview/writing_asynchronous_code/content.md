# Writing Asynchronous Code

Node.js is, as you might already know, an asynchronous framework.  One of the unique aspects of programming like this is the ability to decide between which function will run in serial (synchronous and blocking) and which will run in parallel (asynchronous and non-blocking). 

Usually in an application, you'll have steps that can't run until the result from the previous step is known. In normal sequential programming, this is easy because every statement waits until the previous one finishes.

This is the case in Node.js too, except for functions that would otherwise perform blocking I/O.  This includes things like scanning a directory, opening a file, reading from a file, querying a database, e.t.c. As a general rule, you should almost always try to work asynchronously.

Here's a comparison of the two styles performing a very basic operation: reading a file.

#### The Blocking Way

In a synchronous programming language where I/O is blocking, this task is very straightforward and can be done in Node.js as long as you understand the consequences.  Node exposes `Sync` versions of many of it's I/O functions for the special cases where you don't care about performance and would rather have the much easier coding style (like server startup).

For this example, we'll need a method from Node's [`fs`](../nodejs_ref_guide/fs.html) package. We'll be using `fs.readFileSync()` to read a file and print its contents to the console:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/writing_asynchronous_code/fs.readFile.sync.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

For reading a single file, this is fine. But imagine running a server that's reading several thousand files, or is handling many requests that require database access. Your program waits while waiting for the blocking `fs` operations to finish.  Since CPUs are very fast compared to other hardware (like hard drives), the CPU is wasted when it could be busy working on requests for another client if this was part of a hot running event loop.

Obviously this is not optimal: nothing is done in parallel and many CPU cycles are wasted.

#### The Non-Blocking Way

An advantage to synchronous coding style is that it's very easy to read and write. But a large disadvantage is that it's very inefficient.  That's why most programming languages need threads to achieve any level of concurrency. Thankfully for us, Node.js is able to do quite a bit on a single threaded platform.

Here's the same read file operation handled asynchronously:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/writing_asynchronous_code/fs.readFile.async.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Good golly, it's nearly twice as many lines! In the end, however, this is a better option. `fs.readFile()` takes a filename and "returns" the contents of the file.  It doesn't actually return it, but passes it to the passed in callback function. You can learn more about callback functions in [this article](working_with_callbacks.html).

While it _is_ a tradeoff in code complexity versus performance, with a little thinking and some good libraries, we can make asynchronous programming manageable enough to be understandable, while taking full advantage of the parallel nature of non-blocking I/O in Node.js.