var kMax= 1e5;
var padLength= 5;

function pad (i) {
  i+= '';
  while (i.length < padLength) i= '0'+ i;
  return i;
}

var strs= [];
var i= 0;
while (i < kMax) strs.push(pad(i++));

/*
Create a file with kMax records of padLength chars
e.g. from 0000 to 9999
No 2 records should be equal for this test to work
*/

var fs= require("fs");
var fileName= "test.txt";
var fd= fs.openSync(fileName, "w+");
fs.writeSync(fd, strs.join(''));
fs.close(fd);

/*
Now we push to libeio 1e4 read()s of 4 chars each.
If the fd's filepointer is being updated properly,
and the read()s are done at the right offsets,
each read() should return a different number.
*/

fd= fs.openSync(fileName, "r");
var assert = require("assert");

var i= kMax;
while (i--) tester();

function tester () {
  var buf = new Buffer(padLength);
  fs.read(fd, buf, 0, padLength, -1, cb);
  function cb (err, bytesRead) {
    if (err) throw Error(err);
    if (bytesRead !== padLength) throw Error("bytesRead !== padLength");
    
    buf= buf.toString();
    assert.notEqual(strs[+buf], undefined, "ERROR: READ MORE THAN ONCE -> "+ buf);
    delete strs[+buf];
  }
}
