# Understanding Streams

Streams are a concept that are not unique to Node.js, but compliment its parallel processing and asynchronous paradigms. As its name implies, streams are a continuous flow of information that can be diverted or processed as it comes in. This is incredibly efficient, because you don't have to wait until a stream is finished before working with any data that's come in. You don't need to expect a callback to fire, because streams work through  the event loop.

Although streams are very closely related to the Node.js I/O, they can also deal with file manipulation and requests to HTTP servers. The "stream" object can be readable, writable, or both at the same time. Each type of stream has its own events that emit when a certain action occurs.

Here's a trivial example to demonstrates reading and writing files:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/understanding_streams/streams.ex.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

At first glance, this might appear to be the same as [reading and writing from a file regularly](reading_and_writing_files.html). The important thing to notice is that the `console.log()` statement is executed multiple times. That means that the `'data'` event is firing multiple times, which means the file reading and writing are happening multiple times. Node.js basically reads in as much data from the original file as it can, then writes some of it, then reads some more, and writes some more, and so on, until the process is finished and the `'end'` event is called.

In fact, performing this operation is rather common, and Node.js has several helper functions to assist this process, like [`streams.ReadableStream.pipe()`](../nodejs_ref_guide/streams.ReadableStream.html#streams.ReadableStream.pipe) and [`util.pump`](../nodejs_ref_guide/util.html#util.pump). To demonstrate this latter method, and to show how HTTP servers can use streams, too, take a look at this code:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/understanding_streams/streams.ex.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

When you navigate to the server URL, you should start to hear the MP3 playing. Notice that we don't need to worry ourselves about handling when events start or end. In fact, you should probably stick to using the helper methods, unless you need to do some additional work better suited within the event's callback (like printing messages via `console.log()`).