# Understanding Event Emitters

In order to facilitiate its asynchronisity, Node.js operates with an "event loop" in the background. This loops "listens" for actions that are "emitted," and executes functions as a result. Node.js runs in a single thread of execution, but as soon as a block of synchronous code is done, the event loop runs the next event in the queue. 

Events are represented in Node.js by the [EventEmitter](../nodejs_ref_guide/eventemitter.html) object. Many objects in Node.js are instances of this object. Using `EventEmitter`'s is fairly straight-forward. You can listen to a specific event by calling the `on()` function on your object, providing the name of the event, as well as a callback closure as the parameters. For example:

    var totalData = '';
    request
      .on('data', function(d) {
       totalData += d;
      })
      .on('end', function() {
        console.log('POST data: %s', totalData);
      })

What this is essentially saying is: when the request object gets data (`.on('data')`), append that string to the global `totalData` variable. When the request object is finished getting data (`.on('end')`), print out the data to the console.

Sometimes you want to listen for events that can happen several times. For example, in a web server, when processing a web request, the `data` event is fired one or more times and then the `end` event gets fired. You might end up doing something like this:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/understanding_event_emitters/understanding.event.emitters.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

The `on()` function also returns a reference to the object it belongs to, allowing you to chain several of such event listeners. If you're only interested in the first occurrence of an event, you can use the `once()` function instead. You can also remove event listeners by using the `removeListener()` function.

<Note>By default, events can only have a maximum of 10 listeners. In order to create more, you'll need to make a call to [`setMaxListeners(n)`](../nodejs_ref_guide/eventemitter.html#setMaxListeners). The maximum limit ensures you aren't leaking event listeners by mistake.</Note>

Here's a full example converying many of the methods discussed:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/understanding_event_emitters/understanding.event.emitters.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>