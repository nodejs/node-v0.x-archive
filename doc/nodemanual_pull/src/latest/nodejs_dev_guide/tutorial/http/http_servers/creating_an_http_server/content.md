# Creating an HTTP Server

Printing messages to the console isn't all that exciting. Let's do what Node.js was designed to do, and write a program that writes out via HTTP. Create a new file called _http.server.js_ and put the following code into it:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/http_server/http.server.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

After you run this program, you'll notice that it doesn't exit right away. That's because a Node.js program always runs until it's certain that no further events are possible. In this case, the open HTTP server is the source of events that will keep things going.

Testing the server is as simple as opening a new browser tab, and navigating to
the hostname and port your provided in the `listen()` method. As expected, you should see a response that reads: `Hello, HTTP!`.

Let's have a closer look at the steps involved in our little program. In the
first line, we include the HTTP core module and assign it to a variable called
`http`. 

Next, we create a variable called `server` by calling `http.createServer()`. The
argument passed into this call is a closure that is called whenever an HTTP
request comes in.

Finally, we call `server.listen()` to tell Node.js the port on which we want
our server to run. 

When you point your browser to the server, the connection closure is invoked with a `req` and `res` object. The `req` is a readable stream that emits `'data'` events for each incoming piece of data (like a form submission or file upload). The `res` object is a writable stream that is used to send data back to the client. In our case, we are simply sending a `200 OK` header, as well as the body `Hello, HTTP!`.