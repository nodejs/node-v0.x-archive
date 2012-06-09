var EventEmitter = require('events').EventEmitter,
    assert       = require('assert');


function noListeners(max) {
  var ee = new EventEmitter();

  for (var i = 0 ; i < max ; i ++) {
    ee.emit('myevent');
  }
}

function oneEventOneListener(max) {
  var ee = new EventEmitter();
  var eventCount = 0;

  ee.on('myevent', function() {
    eventCount ++;
  });

  for (var i = 0 ; i < max ; i ++) {
    ee.emit('myevent');
  }

  assert.equal(eventCount, max);
}

function oneEventFourListeners(max) {
  var ee = new EventEmitter();
  var eventCount = 0;

  for ( var l = 0 ; l < 4 ; l ++) {
    ee.on('myevent', function() {
      eventCount ++;
    });
  }

  for (var i = 0 ; i < max ; i ++) {
    ee.emit('myevent');
  }

  assert.equal(eventCount, max * 4);
}

function twoEventsTwoListeners(max) {
  var ee = new EventEmitter();
  max = max / 2;
  var eventCount = 0;

  for ( var l = 0 ; l < 2 ; l ++) {
    ee.on('myevent' + l, function() {
      eventCount ++;
    });
  }

  for ( var j = 0 ; j < 2 ; j ++) {
    for (var i = 0 ; i < max ; i ++) {
      ee.emit('myevent' + j);
    }
  }

  assert.equal(eventCount, max * 2);
}

function twoEventsFourListeners(max) {
  var ee = new EventEmitter();
  max = max / 2;
  var eventCount = 0;

  for ( var l = 0 ; l < 2 ; l ++) {
    for ( var m = 0 ; m < 2 ; m ++) {
      ee.on('myevent' + l, function() {
        eventCount ++;
      });
    }
  }

  for ( var j = 0 ; j < 2 ; j ++) {
    for (var i = 0 ; i < max ; i ++) {
      ee.emit('myevent' + j);
    }
  }

  assert.equal(eventCount, max * 4);
}

//
// Test definitions
//
var tests = [
  { name: 'no listeners'
  , loop: 1e8
  , fn: noListeners }
, { name: '1 event, 1 listener'
  , loop: 1e8
  , fn: oneEventOneListener }
, { name: '1 event, 4 listeners'
  , loop: 1e8
  , fn: oneEventFourListeners }
, { name: '2 events, 2 listeners'
  , loop: 1e8
  , fn: twoEventsTwoListeners }
, { name: '2 events, 4 listeners'
  , loop: 1e8
  , fn: twoEventsFourListeners }
];

function run(i) {

  if (i >= tests.length) {
    console.log('All done.');
    return;
  }

  var test = tests[i];
  var testFunc = test.fn;
  var loop = test.loop;

  var start = Date.now();

  testFunc(loop);
  var end = Date.now();
  var diff = end - start;
  var seconds = diff / 1000;
  var rate = Math.round(loop / seconds);
  console.log(test.name + ': Ellapsed: '  + seconds + 's. Rate: ' + rate + ' emits/sec.');
  process.nextTick(function() {
    run(i + 1);
  });
}

if (process.argv[2]) {
  tests = tests.filter(function(test) {
    return test.name === process.argv[2];
  });
}

run(0);