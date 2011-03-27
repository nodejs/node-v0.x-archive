// Flags: --expose_gc


console.flush= consoleFlush;

var fs= require('fs');
var testFileName= process.env.TMPDIR+ "GH-814_test.txt";
var testFD= fs.openSync(testFileName, 'w');
console.flush(testFileName+ "\n");


var tailProc= require('child_process').spawn('tail', [ '-f', testFileName ]);
tailProc.stdout.on('data', tailCB);

function tailCB (data) {
  PASS= data.toString().indexOf('.') < 0;
  
  if (PASS) {
    console.flush('i');
  }
  else {
    console.flush('[FAIL]\n DATA -> ');
    console.flush(data);
    console.flush("\n");
    throw Error("Buffers GC test -> FAIL");
  }
}


var PASS= true;
var bufPool= [];
var kBufSize= 16*1024;
var neverWrittenBuffer= newBuffer(kBufSize, 0x2e); //0x2e === '.'

var timeToQuit= Date.now()+ 5e3; //Test should last no more than this.
writer();

function writer () {
  
  if (PASS) {
    if (Date.now() > timeToQuit) {
      setTimeout(function () {
        process.kill(tailProc.pid);
        console.flush("\nBuffers GC test -> PASS (OK)\n");
      }, 555);
    }
    else {
      fs.write(testFD, newBuffer(kBufSize, 0x61), 0, kBufSize, -1, writerCB);
      gc();
      var nuBuf= new Buffer(kBufSize);
      neverWrittenBuffer.copy(nuBuf);
      if (bufPool.push(nuBuf) > 100) {
        bufPool.length= 0;
      }
      process.nextTick(writer);
      console.flush('o');
    }
  }
  
}

function writerCB (err, written) {
  //console.flush('cb.');
  if (err) {
    throw err;
  }
}




// ******************* UTILITIES

function consoleFlush (data) {
  if (!Buffer.isBuffer(data)) {
    data= new Buffer(''+ data);
  }
  
  if (data.length) {
    var written= 0;
    do {
      try {
        var len= data.length- written;
        written+= fs.writeSync(process.stdout.fd, data, written, len, -1);
      }
      catch (e) {
        
      }
    } while(written < data.length);
  }
}


function newBuffer (size, value) {
  var buffer= new Buffer(size);
  while (size--) {
    buffer[size]= value;
  }
  buffer[buffer.length-1]= 0x0d;
  buffer[buffer.length-1]= 0x0a;
  return  buffer;
}