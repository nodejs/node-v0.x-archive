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

var server = http.Server(function(req, res) {
  res.writeHead(200);
  res.end('hello world\n');
});

var N = 30;

var responses = 0;


process.on("uncaughtException", function () {
  //this will be called but we do nothing.
})



function doRequest() {
  var req = http.get({ port: common.PORT, path: '/' }, function(res) {
    req.returned = true;
    responses++;

    //end condition
    if (responses == N) {
      console.error('Received all responses, closing server');
      process.exit(responses == N ? 0 : 1)
      return;
    }
    
    var test = responses % 3;
    
    if (test == 1) {
      res.on('data', function (){
        throw new Error("HI")
      })
      res.resume();
    }
    else if (test == 2) {
      res.on('end', function (){
        throw new Error("HI")
      })
      res.resume();
    }
    else{
      throw new Error("hi")
    }

  })
  setTimeout(function () {
    if (!req.returned){
      console.log("Timeout waiting for agent.")
      process.exit(1)
    }
   
  }, 1000)
}

server.listen(common.PORT, function() {
  for (var j = 0; j < N; j++) {
    doRequest();
  }
});

