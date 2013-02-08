/* Description:
 *
 * Writes data from server to client. Both the client and server use streams2.
 *
 * Usage:
 *
 * --iter:   number of interval iterations (default: 20)
 * --nokill: should not kill process when intervals complete (default: false)
 * --ms:     number of ms between intervals (default: 1000)
 * --make:   output should follow make tests (default: false)
 * --noop:   cancel output and counters, useful for v8 flags (default: false)
 * --port:   which port to run the server (default: 1337)
 * --size:   set size of buffer (default: 0x100000)
 *
 * Example:
 *
 *   node tcp_net2_s2c.js --port 3000 --size 0xffffff --len 5
 */


var net = require('net');
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var t_cb = require('../templates/_net')[params.make ? 'make' : 'cli'];
var tcp_net2 = Timer('tcp-net2-s2c',
                     params.ms || 1000,
                     params.iter || 20,
                     !params.nokill);
var PORT = params.port || 1337;
var tbuf = new Buffer(params.size || 0x100000);
var client;

tbuf.fill(0);

tcp_net2.oninterval(t_cb.oninterval);

tcp_net2.onend(t_cb.onend);

if (params.noop)
  tcp_net2.noop();


// begin benchmark

net.createServer(function(socket) {
  (function w() {
    socket.write(tbuf, w);
  }());
}).listen(PORT);


client = net.connect(PORT, function() {
  tcp_net2.start();
});

client.on('readable', function() {
  tcp_net2.inc(client.read().length);
});
