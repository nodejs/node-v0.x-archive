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
var net = require('net');
var tracing = require('tracing');

var queue = [];
var actual = 0;
var expected = 0;

var addListener = tracing.addAsyncListener;
var removeListener = tracing.removeAsyncListener;
var tap = tracing.ASYNC_PROVIDERS;

var callbacks = {
  error: function onError(ctx, data, er) {
    actual++;
    if ('catch me please' === er.message) {
      return true;
    }
    // Want to preserve the actual location of the error.
    throw er;
  }
};

var listener = tracing.createAsyncListener(callbacks);

process.on('beforeExit', function() {
  if (queue.length > 0)
    runQueue();
});

process.on('exit', function(code) {
  removeListener(listener);
  process.removeAllListeners('uncaughtException');

  // Very important this code is checked, or real reason for failure may
  // be obfuscated by a failing assert below.
  if (code !== 0)
    return;

  console.log('actual:', actual);
  console.log('expected:', expected);
  assert.equal(actual, expected);
  console.log('ok');
});

process.on('uncaughtException', function(er) {
  actual++;
  if ('catch me not' !== er.message)
    throw er;
});

function runQueue() {
  if (queue.length > 0) {
    queue.shift()();
    removeListener(listener);
  }
}
setImmediate(runQueue);


queue.push(function() {
  addListener(listener);
  var ranFirst = false;

  setTimeout(function() {
    process.nextTick(function() {
      ranFirst = true;
      removeListener(listener);
      setTimeout(function() {
        expected++;
        throw new Error('catch me not');
      });
    });

    setImmediate(function() {
      assert.ok(ranFirst);
      expected++;
      throw new Error('catch me please');
    });
  });
});


queue.push(function() {
  process.nextTick(function() {
    expected++;
    throw new Error('catch me not');
  });
});


queue.push(function() {
  setTimeout(function() {
    process.nextTick(function() {
      addListener(listener);
      setTimeout(function() {
        setImmediate(function() {
          expected++;
          throw new Error('catch me please');
        });
        removeListener(listener);
        setImmediate(function() {
          expected++;
          throw new Error('catch me not');
        });
      });
    });
    expected++;
    throw new Error('catch me not');
  });
});


queue.push(function() {
  addListener(listener);
  setTimeout(function() {
    process.nextTick(function() {
      expected++;
      throw new Error('catch me please');
    });
    removeListener(listener);
    setTimeout(function() {
      // This listener shouldn't start capturing until errors until it
      // hits the first TCP provider.
      var tcpListener = addListener(callbacks, null, tap.TCP);
      debugger;
      setTimeout(function() {
        net.createServer().listen(common.PORT, function() {
          this.close(function() {
            removeListener(tcpListener);
            expected++;
            throw new Error('catch me not');
          });
          expected++;
          throw new Error('catch me please');
        });
        removeListener(listener);
        process.nextTick(function() {
          removeListener(tcpListener);
          expected++;
          throw new Error('catch me not');
        });
        // Should not be caught because it hasn't happened within the first
        // async call stack that matches the passed provider.
        // TODO(trevnorris): Fix this test.
        //expected++;
        //throw new Error('catch me not');
      });
    });
    expected++;
    throw new Error('catch me not');
  });
  removeListener(listener);
});


queue.push(function() {
  addListener(listener);
  var server = net.createServer(function(conn) {
    conn.on('data', function() {
      conn.write('hello', function() {
        removeListener(listener);
        expected++;
        throw new Error('catch me not');
      });
      expected++;
      throw new Error('catch me please');
    });
    expected++;
    throw new Error('catch me please');
  }).listen(common.PORT, function() {
    net.connect(common.PORT, function() {
      this.write('sup', function() {
        expected++;
        throw new Error('catch me please');
      });
      removeListener(listener);
      var self = this;
      this.on('data', function() {
        debugger;
        removeListener(listener);
        server.close(function() {
          // This error will still be caught because it is part of the server's
          // asynchronous call stack. Not that of the connection.
          expected++;
          throw new Error('catch me please');
        });
        self.destroy();
        expected++;
        throw new Error('catch me not');
      });
    });
  });
  removeListener(listener);
});
