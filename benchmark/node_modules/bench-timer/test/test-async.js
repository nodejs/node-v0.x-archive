var Timer = require('../lib/bench-timer');

// create async tests

var test0 = Timer('test0');
var test1 = Timer('test1', 1000);
var test2 = Timer('test2', 1000, 5);
var test3 = Timer('test3', 1000, 5, true);

// setup each test

test0.onstart(function(delay) {
  console.log('maxNameLength: %s', Timer.maxNameLength());
  setTimeout(function() {
    test0.end();
  }, delay);
}, 1000);

test0.onend(function() {
  console.log('test0', arguments);
  test1.start();
});

test1.onstart(function(cntr) {
  setInterval(function() {
    if (--cntr < 0)
      test1.end();
  }, 500);
}, 5);

test1.onend(function() {
  test2.start();
});

test2.onend(function() {
  console.log('test2', arguments);
});

test2.onstart(function(arg) {
  setInterval(function() {
    test2.inc(arg);
  }, 1);
}, 1e4);

test2.onend(function() {
  console.log('test2', arguments);
  test3.start();
});

test3.onstart(function() {
  setInterval(function() {
    for (var i = 0; i < 1e6; i++)
      test3.inc();
  }, 10);
});

test3.onend(function() {
  console.log('test3', arguments);
});

// start test cycle

test0.start();
