var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    common = require('../common'),
    options = {
        host: 'localhost',
        port: 4443,
        path: '/'
    };

https.createServer({
    key: fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
    cert: fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem')
}, function (req, res) {
    res.end('\n');
}).listen(4443);

// the error from the previous request should not affect a valid request
function http_error() {
    options.agent = false;
    https.get(options, function (res) {
        // normal behavior
        process.exit();
    }).on('error', function (e) {
        console.assert(false, e.message + ' on a valid request');
    });
}

// an http get to an https server will trigger an ssl error
http.get(options, function (res) {
    console.assert(false, 'server should never accept http over https');
}).on('error', http_error);
