var http = require('http');

//create a simple debugger test and run to check list bug...
//solve list bug if possible

var options1 = {
host: 'localhost',
port: 80,
path: '/'
};

http.createServer(function (req, res){

	res.writeHead(200, {'Content-Type':'text/plain'});
	res.write('Testing debugger....');
	debugger;

	http.get(options1, function(response){
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			console.log('Got chunk');
			debugger;
		});
	});
	
	debugger;
	res.end('Ending test...');
}).listen(8000);

console.log('Server listening on port 8000');

