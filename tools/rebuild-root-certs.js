// Copyright Fedor Indutny and other Node contributors.
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

var fs = require('fs');
var assert = require('assert');

function Rebuilder(lines, out) {
  this.lines = lines;
  this.out = out;

  this.state = 'initial';
}

Rebuilder.prototype.run = function run() {
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    this.rebuildLine(line);
  }
};

Rebuilder.prototype.rebuildLine = function rebuildLine(line) {
  do {
    var prev = this.state;

    if (this.state === 'initial') {
      if (/^##/.test(line)) {
        this.state = 'comments/start';
        continue;
      }

      // Pass through
      this.write(line);
    } else if (this.state === 'comments/start' ||
               this.state === 'comments/cont') {
      var match = line.match(/^##(.*)$/);
      if (match === null) {
        this.state = 'title';
        this.write(' */');
      } else {
        if (this.state === 'comments/start')
          this.write('/*' + match[1]);
        else
          this.write(' *' + match[1]);
        this.state = 'comments/cont';
      }
    } else if (this.state === 'title') {
      if (line) {
        this.write('/* ' + line + ' */');
        this.state = 'separator';
      } else {
        this.write('');
      }
    } else if (this.state === 'separator') {
      assert(/^=+$/g.test(line));
      this.state = 'content';
    } else if (this.state === 'content') {
      if (line === '-----END CERTIFICATE-----') {
        this.write('"' + line + '\\n",');
        this.state = 'title';
      } else {
        this.write('"' + line + '\\n"');
      }
    }
    break;
  } while (prev !== this.state);
};

Rebuilder.prototype.write = function write(line) {
  this.out.write(line + '\n');
};

var lines = fs.readFileSync(process.argv[2]).toString().split(/[\r\n]/g);

var r = new Rebuilder(lines, process.stdout);
r.run();
