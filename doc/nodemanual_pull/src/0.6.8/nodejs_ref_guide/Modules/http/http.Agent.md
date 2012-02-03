

## class http.Agent

Starting with Node.js version 0.5.3, there's a new implementation of the HTTP Agent which is used for pooling sockets used in HTTP client requests.

Previously, a single agent instance help the pool for single host+port. The current implementation now holds sockets for any number of hosts.

The current HTTP Agent also defaults client requests to using `Connection:keep-alive`. If no pending HTTP requests are waiting on a socket to become free ,the socket is closed. This means that Node's pool has the benefit of keep-alive when under load but still does not require developers to manually close the HTTP clients using keep-alive.

Sockets are removed from the agent's pool when the socket emits either a `'close'` event or a special `'agentRemove'` event. This means that if you intend to keep one HTTP request open for a long time and don't want it to stay in the pool you can do something along the lines of:

		http.get(options, function(res) {
			// Do stuff
		}).on("socket", function (socket) {
			socket.emit("agentRemove");
		});

Alternatively, you could just opt out of pooling entirely using `agent:false`:


		http.get({host:'localhost', port:80, path:'/', agent:false}, function (res) {
			// Do stuff
		});






## http.Agent.maxSockets -> Number

Determines how many concurrent sockets the agent can have open per host. By default, this is set to 5. 




## http.Agent.sockets -> Array

An object which contains arrays of sockets currently in use by the Agent. **Don't modify this!**

 
