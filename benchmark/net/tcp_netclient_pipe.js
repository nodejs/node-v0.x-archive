/* Description:
 *
 * Pipes data from client to server and back. The client uses the old streams
 * while the server is built directly from tcp_wrap.
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
 * --write:  set writeWaterMark (default: 0x4000)
 *
 * Example:
 *
 *   node tcp_netclient_pipe.js --port 3000 --size 0xffffff
 */


var TCP = process.binding('tcp_wrap').TCP;
var net = require('net');
var Timer = require('bench-timer');
var params = Timer.parse(process.argv);
var t_cb = require('../templates/_net')[params.make ? 'make' : 'cli'];
var tcp_netclient = Timer('tcp-netclient-pipe',
                           params.ms || 1000,
                           params.iter || 20,
                           !params.nokill);
var PORT = params.port || 1337;
var HOST = params.host || '127.0.0.1';
var writeWaterMark = params.write || 0x4000;
var tbuf = new Buffer(params.size || 0x100000);
var s_handle, client;

tbuf.fill(0);

tcp_netclient.oninterval(t_cb.oninterval);

tcp_netclient.onend(t_cb.onend);

if (params.noop)
  tcp_netclient.noop();


// begin benchmark

s_handle = new TCP();

s_handle.bind(HOST, PORT);
s_handle.listen(511);
s_handle.onconnection = onconnection;

function onconnection(c_handle) {
  c_handle.server = true;
  c_handle.onread = onread(selfPipe)
  c_handle.readStart();
}

function selfPipe(handle, chunk) {
  var writeReq = handle.writeBuffer(chunk);
  writeReq.oncomplete = afterWrite(selfPipeAfterWrite);
  if (handle.writeQueueSize >= writeWaterMark)
    handle.readStop();
}

function selfPipeAfterWrite(handle, req) {
  if (handle.writeQueueSize < writeWaterMark)
    handle.readStart();
}

function afterWrite(fn) {
  return function(status, handle, req) {
    fn(handle, req);
  }
}

function onread(fn) {
  return function(buffer, offset, length) {
    if (length === 0)
      return;
    fn(this, buffer.slice(offset, offset + length));
  }
}


client = net.connect(PORT, function() {
  tcp_netclient.start();
  (function w() {
    client.write(tbuf, w);
  }());
});

client.on('data', function(chunk) {
  tcp_netclient.inc(chunk.length);
});
