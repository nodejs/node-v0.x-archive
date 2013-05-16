"use strict";


var common = require('../common');
var http = require('http');
var net= require('net');
var rl = require('readline');
var domain = require('domain');
var assert = require('assert');


function try_request(url, cb) {
    return function() {
	var request = http.get('http://127.0.0.1:' + common.PORT + '/' + url, 
			       function(resp) {
				   assert.ok(resp.statusCode === 200, "Invalid response code");
				   resp.on('data', function(chunk) {
					   assert(chunk.toString('utf8') === 'test', "Invalid request body data");
				       });
				   resp.once('end', cb);
			       });
	request.end();
    }
}

var hadError  = {
    test1: false,
    test2: false
};

function isolate_request(url, cb) {
    return function() {
	var d = domain.create();
	d.on('error', function(e) {
		hadError[url] = true;
	    });
	d.run(try_request(url, cb));
    };
}


/* Create a HTTP server that will emit things after chunked responses.
   0.10.6 will happily read an entire extra http request, but fail if you emit a second
   zero length chunk.

   test1 - emit an extra zero length chunk (parse error)
   test2 - emit an extra HTTP reply (ok, but ignored)
 */
var server = net.createServer(function(c) {
	var i = rl.createInterface(c, c);
	var counter = 0;
	var url;
	i.on('line', function(line) {
		if(counter++ == 0) {
		    if(line.match('test1')) {
			url = 'test1';
		    } else {
			url = 'test2';
		    }
		}

		if(line == '') {
		    c.write("HTTP/1.1 200 OK\r\n");
		    c.write("Transfer-Encoding: chunked\r\n");
		    c.write("Connection: Keep-Alive\r\n");
		    c.write("\r\n");
		    c.write("4\r\ntest\r\n");

		    // End the chunked encoding with a trailer.
		    c.write("0\r\nFoobar: rusty\r\n\r\n");
		    
		    if(url === 'test1') {
			// This will cause a parse error on 0.10.6
			c.write("0\r\n\r\n");
		    } else {
			// If we put a HTTP reply here, we can 0.10.6 will
			// just disregard anything and be successful.
			c.write("HTTP/1.1 500 OK\r\n");
			c.write("Connection: Keep-Alive\r\n");
			c.write("Transfer-Encoding: chunked\r\n");
			c.write("\r\n");
			c.write("6\r\n" + 'broken' + "\r\n");
			c.write("0\r\n\r\n");
		    }
		    c.end();
		}
	    });
    }).listen(common.PORT, '127.0.0.1', function() {
	    isolate_request('test1', function() {
		    isolate_request('test2', function() {
			    server.close();
			})();
		})();
	});

process.on('exit', function() {
	assert.equal(hadError.test1, false);
	assert.equal(hadError.test2, false);
    });