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
//

var common = require('../common');
var assert = require('assert');
var fs = require('fs');
var tls = require('tls');

test1();

// simple/test-tls-securepair-client
function test1() {
    var sslcontext = tls.createSecureContext({
        cert: fs.readFileSync(common.fixturesDir + '/test_cert.pem'),
        key: fs.readFileSync(common.fixturesDir + '/test_key.pem'),
    });
    var catched_servername = null;
    var pair = tls.createSecurePair(sslcontext, true, false, false, {
        SNICallback: function(servername, cb) {
            catched_servername = servername;
        }
    });

    // captured trafic from browser's request to https://www.google.com
    var ssl_hello_with_SNI = new Buffer([
22,3,1,2,0,1,0,1,252,3,3,123,36,32,232,194,245,125,208,188,197,238,164,123,101,
21,189,4,223,219,197,179,76,179,80,162,191,142,83,221,157,81,32,123,104,169,210,
29,128,229,41,40,75,22,86,158,6,35,80,189,202,143,153,205,214,7,2,25,23,142,154,
64,208,0,36,192,43,192,47,0,158,192,10,192,9,192,19,192,20,192,7,192,17,0,51,0,
0,57,0,156,0,47,0,53,0,10,0,5,0,4,1,0,1,143,0,0,0,19,0,17,0,0,14,119,119,119,46,
111,111,103,108,101,46,99,111,109,255,1,0,1,0,0,10,0,8,0,6,0,23,0,24,0,25,0,11,
2,1,0,0,35,0,212,97,213,239,197,73,174,158,16,111,169,183,97,130,108,16,181,0,
47,102,60,123,54,179,231,108,201,39,29,29,98,10,55,8,249,186,94,60,73,6,60,153,
18,236,117,135,229,81,116,50,5,169,193,120,158,115,154,81,155,215,160,15,20,230,
38,218,198,204,30,110,232,140,46,152,107,12,93,177,174,27,150,250,11,140,176,
46,236,73,156,58,227,214,112,148,141,69,62,156,240,251,220,30,185,142,178,115,
103,61,97,241,47,221,42,231,99,106,38,84,153,55,82,103,154,184,247,23,140,133,
173,232,64,191,42,211,245,204,32,154,22,11,122,150,20,115,226,42,229,77,234,17,
10,103,78,96,200,54,120,224,148,25,122,191,209,179,233,159,210,244,147,229,1,
165,168,2,206,252,132,3,197,211,248,128,178,36,98,34,193,72,133,90,81,63,185,
103,221,210,121,19,173,78,64,70,243,217,51,116,0,0,0,16,0,26,0,24,8,115,112,100,
47,51,46,49,5,104,50,45,49,52,8,104,116,116,112,47,49,46,49,117,80,0,0,0,5,0,5,
0,0,0,0,0,18,0,0,0,13,0,18,0,16,4,1,5,1,2,1,4,3,5,3,2,3,4,2,2,2,0,21,0,60,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
]);

    pair.encrypted.write(ssl_hello_with_SNI);
    assert.equal('www.google.com', catched_servername);
}
