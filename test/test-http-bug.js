var http = require('http');

var options1 = {
host: 'localhost',
port: 80,
path: '/',
method: 'GET'
};

http.createServer(function (req, res) {

    var start = new Date();
    var myCounter = 0;
	debugger;
	
    var isSent = false;
    http.request(options1, function(response) {
        response.setEncoding('utf8');
	debugger;
        response.on('data', function (chunk) {
            var end = new Date();
            console.log(myCounter + ' BODY: ' + chunk  + " time: " + (end-start) + " Request start time: " + start.getTime());

            if (! isSent) {
                isSent = true;
                res.writeHead(200, {'Content-Type': 'application/xml'});
                res.end(chunk);
            }
        });
    }).end();
}).listen(3013);

console.log('Server running at port 3013');
