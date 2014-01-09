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

/*
 * Replicate error found in node v0.11.9 and v0.11.10
 * when a domain exists before listen is called
 *
 * Original issue was found in a project that was using
 * Postgres connection started inside of a domain, the
 * following code generates the same stack trace
 *
net.js:1095
    this._handle.addAsyncListener(this.domain._listener);
                 ^
TypeError: Object #<Object> has no method 'addAsyncListener'
    at Server._listen2 (net.js:1095:18)
    at cb (net.js:1139:10)
    at rr (cluster.js:552:5)
    at Worker.<anonymous> (cluster.js:484:9)
    at process.<anonymous> (cluster.js:611:8)
    at process.EventEmitter.emit (events.js:123:20)
    at handleMessage (child_process.js:318:10)
    at Pipe.channel.onread (child_process.js:346:11)
 */

var common = require('../common');
var cluster = require('cluster');
var domain = require('domain');

// RR is the default for v0.11.9 and v0.11.10
// so the following line is redundant
// cluster.schedulingPolicy = cluster.SCHED_RR;

if (cluster.isWorker) {
  var d = domain.create();
  d.run(function () {
      // original code was creating a pg connection here but
      // doesnt seem to matter for the bug, fails with empty fn too
  });

  var http = require('http');
  http.Server(function() {

  }).listen(common.PORT, '127.0.0.1');
}

else if (cluster.isMaster) {
  var worker;

  //Kill worker when listening
  cluster.on('listening', function() {
    worker.kill();
  });

  //Kill process when worker is killed
  cluster.on('exit', function() {
    process.exit(0);
  });

  //Create worker
  worker = cluster.fork();
}
