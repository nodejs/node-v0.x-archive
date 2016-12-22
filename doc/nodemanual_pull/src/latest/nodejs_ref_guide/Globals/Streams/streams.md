
## class streams

A stream is an abstract interface implemented by various objects in Node.js. For example, a request to an HTTP server is a stream, as is stdout. Streams can be readable, writable, or both. All streams are instances of [[eventemitter `EventEmitter`]].

For more information, see [this article on understanding streams](../nodejs_dev_guide/understanding_streams.html).

#### Example: Printing to the console
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/streams/streams.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: Reading from the console

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/streams/streams.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>


