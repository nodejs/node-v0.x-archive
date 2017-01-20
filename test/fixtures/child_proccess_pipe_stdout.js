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

var data = new Buffer(65536);

// let the test know when pipe has throtled me
process.stdout.on('pause', function () {
  process.send('pause');
});

// let the test know when pipe has resumed me
process.stdout.on('resume', function () {
  process.send('resume');
});

// I assume that in 50ms I can get everything done,
// now test that the ending the process will close the
// net.Socket
setTimeout(function () {
  // is this the best way to handle stdout.end()?
  // do I need to have a test explicitly test some cmdline proccess?
  process.exit();
}, 50);

// just keep on writ'n (the test will kill me)
(function write() {
  if (process.stdout.write(data) === false) {
    process.send('write_false');
  }
  process.nextTick(write);
}());

