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

// These tests are to make sure that a TCP stream implements all the
// required functions and events of the Stream class

// For complentness I test things twice, both on the server and the client
// even though they are both Sockets
// TODO test pipe
// TODO test immediate write
// TODO make sure there are no eadge case timeimg issues

var tests = {
  'net pause/write/drain on the client' : function() {
    var hasResume = false;
    //TODO should the order of steps be defined?
    var step = 0;

    // next test
    setTimeout(function () {
      assert.strictEqual(step, 2);
      server.close();
      nextTest();
    }, 100);

    //need a server
    var server = net.Server(function(conn) {
      // the server should not get data until I resume the client
      conn.on('data', function(chunk) {
        assert.strictEqual(hasResume, true);
        step += 1;
      });
    });

    server.listen(common.PORT, function() {
      // need a client
      var client = net.createConnection(common.PORT);

      //TODO? should I expect the Socket to emit pause?
      // pause
      client.pause();

      // write should return false
      assert.strictEqual(client.write(new Buffer(10)), false);

      // resume in a bit
      setTimeout(function() {
        hasResume = true;
        client.resume();
      },50);

      // make sure I get a drain after resume
      client.on('drain', function() {
        // TODO, need to make sure I get here
        // false positive === bad
        assert.strictEqual(hasResume, true);
        step += 1;
      });
    });
  },
  'net pause/write/drain on the server' : function() {
    var hasResume = false;
    //TODO should the order of steps be defined?
    var step = 0;

    // next test
    setTimeout(function () {
      assert.strictEqual(step, 2);
      server.close();
      nextTest();
    }, 100);

    // need a server
    var server = net.Server(function(conn) {
      //TODO should I expect the Socket to emit pause?
      // pause
      conn.pause();

      // write should return false
      assert.strictEqual(conn.write(new Buffer(10)), false);

      // make sure I get a drain after resume
      conn.on('drain', function() {
        // TODO, need to make sure I get here
        // false positive === bad
        assert.strictEqual(hasResume, true);
        step += 1;
      });

      // resume in a bit
      setTimeout(function() {
        hasResume = true;
        conn.resume();
      },50);
    });
    server.listen(common.PORT);

    //need a client
    var client = net.createConnection(common.PORT).
        // the client should not get data until I resume the server
        on('data', function() {
          assert.strictEqual(hasResume, true);
          step += 1;
        });
  },
  'net: pause, write server, drain client' : function() {
    var hasResume = false;
    //TODO should the order of steps be defined?
    var step = 0;

    // next test
    setTimeout(function () {
      assert.strictEqual(step, 2);
      server.close();
      nextTest();
    }, 100);

    // need a server
    var server = net.Server(function(conn) {
      // just write some data
      conn.write(new Buffer(10));
    });
    server.listen(common.PORT, function() {
      // need a client
      var client = net.createConnection(common.PORT);

      // I should not get data untill I resume the client
      client.on('data', function(chunk) {
        assert.strictEqual(hasResume, true);
        step += 1;
      });

      // pause
      client.pause();

      // resume in a bit
      setTimeout(function() {
        hasResume = true;
        client.resume();
      }, 50);

      // make sure I get a drain after resume
      client.on('drain', function() {
        assert.strictEqual(hasResume, true);
        step += 1;
      });
    });
  },
  'net pause seerver, write client, drain server, ' : function() {
    var hasResume = false;
    var client;
    //TODO should the order of steps be defined?
    var step = 0;

    // next test
    setTimeout(function () {
      assert.strictEqual(step, 2);
      server.close();
      nextTest();
    }, 100);

    // need a server
    var server = net.Server(function(conn) {

      // I should not get data untill I resume conn
      conn.on('data', function(chunk) {
        console.error('data');
        assert.strictEqual(hasResume, true);
        step += 1;
      });

      // pause
      conn.pause();

      // I should get drain after I resume conn
      conn.on('drain', function() {
        console.error('drain');
        assert.strictEqual(hasResume, true);
        step += 1;
      });

      // resume in a bit
      setTimeout(function() {
        hasResume = true;
        conn.resume();
      },50);

      // write something, I think there is also a timeing problem
      // but this settles the mud nicely...
      client.write(new Buffer(10));
    });
    server.listen(common.PORT, function() {
      // need a client
      client = net.createConnection(common.PORT);
    });
  },
  'pause/drain from server to client' : function() {
    var hasResume = false;
    var client;
    //TODO should the order of steps be defined?
    var step = 0;

    // next test
    setTimeout(function () {
      assert.strictEqual(step, 3);
      server.close();
      nextTest();
    }, 100);

    // need a server
    var server = net.Server(function(conn) {
      // pause conn
      conn.pause();

      // should recive data after conn resumes
      conn.on('data', function() {
        assert.strictEqual(hasResume, true);
        step += 1;
      });

      // resume in a bit
      setTimeout(function () {
        conn.resume();
        hasResume = true;
      },50);

      // write something, I think there is also a timeing problem
      // but this settles the mud nicely...
      client.write(new Buffer(10));
    });

    server.listen(common.PORT, function() {
      // need a client
      client = net.createConnection(common.PORT);

      // because the server paused the stream the client should emit pause
      client.on('pause', function() {
        assert.strictEqual(hasResume, false);
        step += 1;
      });

      // once the server resumes the client should emit the event
      client.on('drain', function() {
        assert.strictEqual(hasResume, true);
        step += 1;
      });
    });
  },
  'pause/drain from client to server' : function() {
    var hasResume = false;
    //TODO should the order of steps be defined?
    var step = 0;

    // next test
    setTimeout(function () {
      assert.strictEqual(step, 3);
      server.close();
      nextTest();
    }, 100);

    // need a server
    var server = net.Server(function(conn) {

      // because the client is paused conn.write should return false
      assert.strictEqual(client.write(new Buffer(10)), false);

      // because the client paused, conn should emit pause?
      // there may be a timeing issue here...
      conn.on('pause', function() {
        assert.strictEqual(hasResume, false);
        step += 1;
      });

      // once the client resumes, conn should emit drain
      conn.on('drain', function() {
        assert.strictEqual(hasResume, true);
        step += 1;
      });
    });

    server.listen(common.PORT, function() {
      // need a client
      var client = net.createConnection(common.PORT);

      // pause client
      client.pause();

      // should recive data after client resumes
      client.on('data', function() {
        assert.strictEqual(hasResume, true);
        step += 1;
      });

      // resume in a bit
      setTimeout(function () {
        client.resume();
        hasResume = true;
      },50);
    });
  }
};


/**
 *  simple function to run the tests in-order
 */
function nextTest() {
  var testName = Object.keys(tests).shift(),
      test = tests[testName];
  if (test) {
    delete tests[testName];
    test();
  }
}

nextTest();

