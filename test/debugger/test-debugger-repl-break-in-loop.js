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

var repl = require('./helper-debugger-repl.js');

repl.startDebugger('breakpoints-loop.js');

repl.addTest('n', [
  /break/,
  /1/, /2/, /3/, /4/, /5/
]);

// -- SET BREAKPOINT --

// Set breakpoint on current line(3rd)
repl.addTest('sb()', [
  /1/, /2/, /3/, /4/, /5/, /6/, /7/, /8/
]);

// CHeck if it shows the breakpoint marker
repl.addTest('n', [
  /break/,
  /2/, /\* 3/, /> 4/, /5/, /6/
]);

// Check if breakpoint is working
repl.addTest('c', [
  /break/,
  /1/, /2/, /> 3/, /4/, /5/
]);

// Set breakpoint on 2nd line
repl.addTest('sb(2)', [
  /1/, /\* 2/, /> 3/, /4/, /5/, /6/, /7/, /8/
]);

// Check if it stops on 2nd line
repl.addTest('c', [
  /break/, /1/, /> 2/, /\* 3/, /4/
]);

// Clear current line breakpoint
repl.addTest('cb()', [
  /1/, /> 2/, /\* 3/, /4/, /5/, /6/, /7/
]);

// Clear 3rd breakpoint
repl.addTest('cb(3)', [
  /1/, /> 2/, /  3/, /4/, /5/, /6/, /7/
]);

repl.addTest('sb(8)', [
  /1/, /> 2/, /3/, /4/, /5/, /6/, /7/
]);

repl.addTest('c', [
  /break/, /6/, /7/, /> 8/, /9/, /10/
]);

repl.addTest('sb("someFn()")', [
  /3/, /4/, /5/, /6/, /7/, /> 8/, /9/, /\*10/, /11/, /12/, /13/
]);

// Check if the function break point works
repl.addTest('c', [
  /break/, /9/, /10/, />11/, /12/, /13/
]);

repl.addTest('cb("someFn()")', [
  /6/, /7/, /8/, /9/, /10/, />11/, /12/, /13/, /14/
]);

repl.addTest('c', [
  /program terminated/
]);

repl.addTest('quit', []);
