// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.




var common = require('../common');
var assert = require('assert');
var Buffer = require('buffer').Buffer;
var dgram = require('dgram');
var stream = require('stream');
var util = require('util');

var debug = false;
var tests_run = 0;

function PingPongServer(opts) {
  opts = opts || {};
  opts.objectMode = true;
  stream.Transform.call(this, opts);

  this.messages = 0;
}
util.inherits(PingPongServer, stream.Transform);

PingPongServer.prototype._transform = function(msg, encoding, callback) {
  if (debug) console.log('server got: ' + msg.data +
                         ' from ' + msg.ip.src + ':' + msg.udp.srcPort);
  if (/PING/.exec(msg.data)) {
    var buf = new Buffer(4);
    buf.write('PONG');
    this.messages += 1;
    this.push({
      data: buf,
      ip: { dst: msg.ip.src },
      udp: { dstPort: msg.udp.srcPort }
    });
  }
  callback();
};

function PingPongClient(opts) {
  opts = opts || {};
  opts.objectMode = true;
  stream.Transform.call(this, opts);

  this.buf = new Buffer('PING');
  this.port = ~~opts.port;
  this.limit = ~~opts.limit;
  this.count = 0;
}
util.inherits(PingPongClient, stream.Transform);

PingPongClient.prototype.sendMsg = function() {
  this.push({
    data: this.buf,
    ip: { dst: 'localhost' },
    udp: { dstPort: this.port }
  });
  this.count += 1;
};

PingPongClient.prototype._transform = function(msg, encoding, callback) {
  if (debug) console.log('client got: ' + msg.data +
                         ' from ' + msg.ip.src + ':' + msg.udp.srcPort);
  assert.equal('PONG', msg.data.toString('ascii'));
  this.sendMsg();
  if (this.count >= this.limit) {
    this.push(null);
  }
  callback();
};

function pingPongTest(port, host) {
  var N = 500;

  var pingPongServer = new PingPongServer();

  var server = dgram.createSocket('udp4');
  server.on('error', function(e) {
    throw e;
  });

  server.pipe(pingPongServer).pipe(server);

  server.on('listening', function() {
    console.log('server listening on ' + port + ' ' + host);

    var client = dgram.createSocket('udp4');

    var pingPongClient = new PingPongClient({ port: port, limit: N });
    client.on('error', function(e) {
      throw e;
    });

    client.pipe(pingPongClient).pipe(client);

    pingPongClient.on('end', function() {
      console.log('client has closed, closing server');
      assert.equal(N, pingPongClient.count);
      tests_run += 1;
      client.end();
      server.end();
      assert.equal(N - 1, pingPongServer.messages);
    });

    console.log('Client sending to ' + port + ', localhost ' + pingPongClient.buf);
    pingPongClient.sendMsg();
  });
  server.bind(port, host);
}

// All are run at once, so run on different ports
pingPongTest(common.PORT + 0, 'localhost');
pingPongTest(common.PORT + 1, 'localhost');
pingPongTest(common.PORT + 2);
//pingPongTest('/tmp/pingpong.sock');

process.on('exit', function() {
  assert.equal(3, tests_run);
  console.log('done');
});
