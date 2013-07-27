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
var http = require('http');
var util = require('util');

var buf  = new Buffer(43);
var port = common.PORT;

var data = "R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="

var server = http.createServer(function(req, res) {
    req.resume();
    res.writeHeader(200, {"Content-type": "image/gif"});
    if (req.url == "/buf") {
        buf.write(data, 0, 43, "base64")
        res.write(buf);
    } else {
        res.write(data, "base64");
    }
    res.end();
}).listen(port, function() {
    var offset = 0;
    var paths = ['/buf', '/'];
    
    function do_request(offset) {
        var options = {
            host: 'localhost',
            port: port,
            path: paths[offset],
            headers: {},
        };
        var req = http.request(options, function(res) {
            var chunks = [];
            
            res.on('data', function(chunk) {
                chunks.push(chunk);
            });
            res.on('end', function() {
                var concat = Buffer.concat(chunks);
                assert.ok(concat.toString('base64') === data, "Did not get expected data");
                if (++offset === paths.length)
                    server.close();
                else
                    do_request(offset);
            });
        });
        req.end();
    }
    do_request(0);
});
