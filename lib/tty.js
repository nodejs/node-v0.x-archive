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

var assert = require('assert');
var inherits = require('util').inherits;
var net = require('net');
var TTY = process.binding('tty_wrap').TTY;
var isTTY = process.binding('tty_wrap').isTTY;

exports.isatty = function(fd) {
  return isTTY(fd);
};


// backwards-compat
exports.setRawMode = function(flag) {
  if (!process.stdin.isTTY) {
    throw new Error('can\'t set raw mode on non-tty');
  }
  process.stdin.setRawMode(flag);
};


function ReadStream(fd) {
  if (!(this instanceof ReadStream)) return new ReadStream(fd);
  net.Socket.call(this, {
    handle: new TTY(fd, true)
  });

  this.writable = false;
  this.isRaw = false;
}
inherits(ReadStream, net.Socket);

exports.ReadStream = ReadStream;

ReadStream.prototype.pause = function() {
  this._handle.unref();
  return net.Socket.prototype.pause.call(this);
};

ReadStream.prototype.resume = function() {
  this._handle.ref();
  return net.Socket.prototype.resume.call(this);
};

ReadStream.prototype.setRawMode = function(flag) {
  flag = !!flag;
  this._handle.setRawMode(flag);
  this.isRaw = flag;
};

ReadStream.prototype.isTTY = true;



function WriteStream(fd) {
  if (!(this instanceof WriteStream)) return new WriteStream(fd);
  net.Socket.call(this, {
    handle: new TTY(fd, false)
  });

  this.readable = false;
  this.writable = true;

  var self = this;
  var winSize = this._handle.getWindowSize();
  this.columns = winSize[0];
  this.rows = winSize[1];

  process.on('SIGWINCH', function() {
    var winSize = self._handle.getWindowSize();
    self.columns = winSize[0];
    self.rows = winSize[1];
    self.emit('resize', winSize);
  });
}
inherits(WriteStream, net.Socket);
exports.WriteStream = WriteStream;


WriteStream.prototype.isTTY = true;


WriteStream.prototype.cursorTo = function(x, y) {
  if (typeof x !== 'number' && typeof y !== 'number')
    return;

  if (typeof x !== 'number')
    throw new Error("Can't set cursor row without also setting it's column");

  if (typeof y !== 'number') {
    this.write('\x1b[' + (x + 1) + 'G');
  } else {
    this.write('\x1b[' + (y + 1) + ';' + (x + 1) + 'H');
  }
};


WriteStream.prototype.moveCursor = function(dx, dy) {
  if (dx < 0) {
    this.write('\x1b[' + (-dx) + 'D');
  } else if (dx > 0) {
    this.write('\x1b[' + dx + 'C');
  }

  if (dy < 0) {
    this.write('\x1b[' + (-dy) + 'A');
  } else if (dy > 0) {
    this.write('\x1b[' + dy + 'B');
  }
};


WriteStream.prototype.clearLine = function(dir) {
  if (dir < 0) {
    // to the beginning
    this.write('\x1b[1K');
  } else if (dir > 0) {
    // to the end
    this.write('\x1b[0K');
  } else {
    // entire line
    this.write('\x1b[2K');
  }
};


// backwards-compat
WriteStream.prototype.getWindowSize = function() {
  return [this.columns, this.rows];
};
