# Working with Callbacks

Callbacks are _essential_ for understanding how to program efficiently with Node.js. Callbacks are essentially just functions that execute once a method completes. It's considered standard to create  callbacks with at least two parameters: the [global `Error` object](../js_doc/Error.html), and the result of the asynchronous method completing.

For example, take a look at the following pseudocode:

    // You call async functions like this.
    someAsyncFunction(param1, param2, function callback(err, result) {
    	if (err) {
      		console.log("There's an error, and it reads: " + err);
    	}
    	else {
    		doSomething(result);
    	}
    });
    
Although many callbacks are inline, you could also choose to separate your code like this:

    // You call async functions like this.
    someAsyncFunction(param1, param2, myCallback);

    function myCallback(err, result) {
        if (err) {
        	console.log("There's an error, and it reads: " + err);
    	}
    	else {
    		doSomething(result);
    	}
    }

If you're programming asynchronously, you should be passing callback functions as your final parameter. In fact, nearly all&mdash;if not every single one&mdash;of Node's official modules, expect callbacks as their last parameter.

With a callback you're either going to get an error or a result.  Never both, and never more than one event. For cases where there are more than two events and/or they can be called multiple times, then you need the more powerful and flexible [event emitters](understanding_event_emitters.html).