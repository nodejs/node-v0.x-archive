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

var common = require('../common'),
    path = require('path'),
    assert = require('assert'),
    repl = require('repl').start('');

var history = [
  'never gonna give you up',
  'never gonna let you down',
  'never gonna gonna run around and desert you',
  'never gonna make you cry',
  'never gonna say goodbye',
  'never gonna tell a lie and hurt you'
];

var historyFile = path.join(common.tmpDir, 'history');

saveHistory();

function saveHistory() {
  repl.setHistory(history);

  repl.saveHistory(historyFile, function(err) {
    if (err) throw err;
    loadHistory();
  });
}

function loadHistory() {
  repl.setHistory([]);
  repl.loadHistory(historyFile, function(err) {
    if (err) throw err;
    assert.deepEqual(repl.rli.history, history);
    process.exit();
  });
}
