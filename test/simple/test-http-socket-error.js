// Sets up a HTTP server, makes a request to it, and then emit an error
// on the socket immediately after the request is complete.  (This simulates
// an ECONNRESET on the socket.)  We then assert that no exception is thrown.
// (At this point, we don't care about socket errors, because nothing actually
// needs the socket.)

var common = require("../common");
var assert = require("assert");
var http = require("http");

var host = "localhost";
var port = common.PORT;

var agent = http.getAgent(host, port);

var server = http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, World")
});
server.listen(port);

var options = { 
    host: host,
    port: port,
    path: "/",
    method: "GET",
    headers: { connection: "keep-alive", host: host }    
};

http.request(options, function (res) {
    res.on("end", function() {
        assert.equal(200, res.statusCode);
        process.nextTick(function() {
            // Simulates an ECONNRESET on the socket
            http.getAgent(host, port).sockets[0].emit(
                "error", { message: "dummy" }
            );
        });
        process.nextTick(function() {
            server.close();
            process.exit();
        });
    })
}).end();

var caughtException = null;

process.on("uncaughtException", function(err) {
    // If there's nothing in the queue, record the exception.  (We shouldn't
    // be getting uncaughtExceptions if there's nothing the queue.)
    if (agent.queue.length == 0) {
        caughtException = err;
    }
    // Remove the listener, otherwise we get a loop if the
    // assertion in the "exit" handler below fails.
    process.removeAllListeners("uncaughtException");
});

process.on("exit", function() {
    assert.strictEqual(
        null, caughtException, "Socket error caused exception to be thrown"
    );
});
