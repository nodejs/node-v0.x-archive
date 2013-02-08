/* Description:
 *
 * Writes data from client to server. Both the client and server use tcp_wrap.
 *
 * Usage:
 *
 * --iter:   number of interval iterations (default: 20)
 * --host:   host to bind on (default: 127.0.0.1)
 * --nokill: should not kill process when intervals complete (default: false)
 * --ms:     number of ms between intervals (default: 1000)
 * --make:   output should follow make tests (default: false)
 * --noop:   cancel output and counters, useful for v8 flags (default: false)
 * --port:   which port to run the server (default: 1337)
 * --size:   set size of buffer (default: 0x100000)
 *
 * Example:
 *
 *   node tcp_raw_c2s.js --port 3000 --size 0xffffff
 */

var TCP = process.binding('tcp_wrap').TCP;
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var t_cb = require('../templates/_net')[params.make ? 'make' : 'cli'];
var tcp_raw = Timer('tcp-raw-c2s',
                     params.ms || 1000,
                     params.iter || 20,
                     !params.nokill);
var PORT = params.port || 1337;
var HOST = params.host || '127.0.0.1';
var tbuf = new Buffer(params.size || 0x100000);
var s_handle, r_handle, c_req;

tbuf.fill(0);

tcp_raw.oninterval(t_cb.oninterval);

tcp_raw.onend(t_cb.onend);

if (params.noop)
  tcp_raw.noop();


// begin benchmark

s_handle = new TCP();

s_handle.bind(HOST, PORT);
s_handle.listen(511);
s_handle.onconnection = onconnection;

function onconnection(clientHandle) {
  tcp_raw.start();
  clientHandle.server = true;
  clientHandle.onread = function onread(buffer, offset, length) {
    if (length === 0)
      return;
    tcp_raw.inc(length);
  };
  clientHandle.readStart();
}


r_handle = new TCP();
c_req = r_handle.connect(HOST, PORT);

c_req.oncomplete = afterConnect;

function afterConnect(status, handle, req, readable, writable) {
  handle.readStart();
  (function w() {
    handle.writeBuffer(tbuf).oncomplete = w;
  }());
}
