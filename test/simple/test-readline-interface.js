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
var readline = require('readline');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function FakeInput() {
  EventEmitter.call(this);
}
inherits(FakeInput, EventEmitter);
FakeInput.prototype.resume = function() {};
FakeInput.prototype.pause = function() {};
FakeInput.prototype.write = function(str) {this.emit('write', str)};
FakeInput.prototype.end = function() {};

var fi;
var rli;
var called;
var echo;

var functionKeyCodeRe = /(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/g

// check if input is echoed when line is refreshed (terminal must be true)
fi = new FakeInput();
rli = new readline.Interface({ input: fi, output: fi, terminal: true });
rli.setPrompt('> ');
echo = false;
called = false;
fi.emit('data', 'a');
var res = '';
fi.on('write', function(char) {
  called = true;
  res += char
});
rli._refreshLine();
assert.equal(res.replace(functionKeyCodeRe, ''), '> a');


// check if input is not echoed when line is refreshed with input echo off (terminal must be true)
rli.setEcho(false);
fi.emit('data', 'aa');
rli._refreshLine();
assert.ok(/> $/.test(res.replace(functionKeyCodeRe, '')));


// check if input is echoed when line is refreshed with input echo back on (terminal must be true)
rli.setEcho();
rli._refreshLine();
assert.ok(/> aaa$/.test(res.replace(functionKeyCodeRe, '')));


[ true, false ].forEach(function(terminal) {

  // sending a full line
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  called = false;
  rli.on('line', function(line) {
    called = true;
    assert.equal(line, 'asdf');
  });
  fi.emit('data', 'asdf\n');
  assert.ok(called);
  
  // sending a full line
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  called = false;
  rli.on('line', function(line) {
    called = true;
    assert.equal(line, 'asdf');
  });
  fi.emit('data', 'asdf\n');
  assert.ok(called);
  
  // check if input is echoed
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  rli.setPrompt('');
  echo = false;
  called = false;
  fi.on('write', function(char) {
    echo = true;
    called = true;
    assert.equal(char, 'a');
  });
  fi.emit('data', 'a');
  assert.ok(called === terminal);
  assert.ok(echo === terminal);
  
  // sending a single character with no newline
  fi = new FakeInput();
  rli = new readline.Interface(fi, {});
  called = false;
  rli.on('line', function(line) {
    called = true;
  });
  fi.emit('data', 'a');
  assert.ok(!called);
  rli.close();

  // sending a single character with no newline and then a newline
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  called = false;
  rli.on('line', function(line) {
    called = true;
    assert.equal(line, 'a');
  });
  fi.emit('data', 'a');
  assert.ok(!called);
  fi.emit('data', '\n');
  assert.ok(called);
  rli.close();

  // sending multiple newlines at once
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  var expectedLines = ['foo', 'bar', 'baz'];
  var callCount = 0;
  rli.on('line', function(line) {
    assert.equal(line, expectedLines[callCount]);
    callCount++;
  });
  fi.emit('data', expectedLines.join('\n') + '\n');
  assert.equal(callCount, expectedLines.length);
  rli.close();

  // sending multiple newlines at once that does not end with a new line
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  expectedLines = ['foo', 'bar', 'baz', 'bat'];
  callCount = 0;
  rli.on('line', function(line) {
    assert.equal(line, expectedLines[callCount]);
    callCount++;
  });
  fi.emit('data', expectedLines.join('\n'));
  assert.equal(callCount, expectedLines.length - 1);
  rli.close();

  // \r\n should emit one line event, not two
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  expectedLines = ['foo', 'bar', 'baz', 'bat'];
  callCount = 0;
  rli.on('line', function(line) {
    assert.equal(line, expectedLines[callCount]);
    callCount++;
  });
  fi.emit('data', expectedLines.join('\r\n'));
  assert.equal(callCount, expectedLines.length - 1);
  rli.close();

  // \r\n should emit one line event when split across multiple writes.
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  expectedLines = ['foo', 'bar', 'baz', 'bat'];
  callCount = 0;
  rli.on('line', function(line) {
    assert.equal(line, expectedLines[callCount]);
    callCount++;
  });
  expectedLines.forEach(function(line) {
    fi.emit('data', line + '\r');
    fi.emit('data', '\n');
  });
  assert.equal(callCount, expectedLines.length);
  rli.close();

  // \r should behave like \n when alone
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: true });
  expectedLines = ['foo', 'bar', 'baz', 'bat'];
  callCount = 0;
  rli.on('line', function(line) {
    assert.equal(line, expectedLines[callCount]);
    callCount++;
  });
  fi.emit('data', expectedLines.join('\r'));
  assert.equal(callCount, expectedLines.length - 1);
  rli.close();


  // sending a multi-byte utf8 char over multiple writes
  var buf = Buffer('☮', 'utf8');
  fi = new FakeInput();
  rli = new readline.Interface({ input: fi, output: fi, terminal: terminal });
  callCount = 0;
  rli.on('line', function(line) {
    callCount++;
    assert.equal(line, buf.toString('utf8'));
  });
  [].forEach.call(buf, function(i) {
    fi.emit('data', Buffer([i]));
  });
  assert.equal(callCount, 0);
  fi.emit('data', '\n');
  assert.equal(callCount, 1);
  rli.close();

  // wide characters should be treated as two columns.
  assert.equal(readline.isFullWidthCodePoint('a'.charCodeAt(0)), false);
  assert.equal(readline.isFullWidthCodePoint('あ'.charCodeAt(0)), true);
  assert.equal(readline.isFullWidthCodePoint('谢'.charCodeAt(0)), true);
  assert.equal(readline.isFullWidthCodePoint('고'.charCodeAt(0)), true);
  assert.equal(readline.isFullWidthCodePoint(0x1f251), true); // surrogate
  assert.equal(readline.codePointAt('ABC', 0), 0x41);
  assert.equal(readline.codePointAt('あいう', 1), 0x3044);
  assert.equal(readline.codePointAt('\ud800\udc00', 0),  // surrogate
      0x10000);
  assert.equal(readline.codePointAt('\ud800\udc00A', 2), // surrogate
      0x41);
  assert.equal(readline.getStringWidth('abcde'), 5);
  assert.equal(readline.getStringWidth('古池や'), 6);
  assert.equal(readline.getStringWidth('ノード.js'), 9);
  assert.equal(readline.getStringWidth('你好'), 4);
  assert.equal(readline.getStringWidth('안녕하세요'), 10);
  assert.equal(readline.getStringWidth('A\ud83c\ude00BC'), 5); // surrogate

  assert.deepEqual(fi.listeners('end'), []);
  assert.deepEqual(fi.listeners(terminal ? 'keypress' : 'data'), []);
});
