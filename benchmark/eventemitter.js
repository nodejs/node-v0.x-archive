var EventEmitter = require('events').EventEmitter;

// One listener
!function() {
  var e = new EventEmitter();

  e.on('data', function(x, y) {
  });

  console.time('emit - one listener');
  for (var i = 0; i < 1e7; i++) {
    e.emit('data', 1, 2);
  }
  console.timeEnd('emit - one listener');
}();

// Multiple listeners
!function() {
  var e = new EventEmitter();

  e.on('data', function(x, y) {
  });

  e.on('data', function(x, y) {
  });

  e.on('data', function(x, y) {
  });

  console.time('emit - multiple listeners');
  for (var i = 0; i < 1e7; i++) {
    e.emit('data', 1, 2);
  }
  console.timeEnd('emit - multiple listeners');
}();
