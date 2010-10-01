common = require("../common");
assert = common.assert
var events = require('events');

var e = new events.EventEmitter();

var events_new_listener_emited = [];
var times_hello_emited = 0;

e.addListener("newListener", function (event, listener) {
  console.log("newListener: " + event);
  events_new_listener_emited.push(event);
});

e.on("hello", function (a, b) {
  console.log("hello");
  times_hello_emited += 1
  assert.equal("a", a);
  assert.equal("b", b);
});

var propagation_test_times = 0;

e.on("propagation-test", function () {
  propagation_test_times++;
  
  console.log("This listener will stop propagation");
  
  return false;
});

e.on("propagation-test", function (msg) {
  propagation_test_times++;
  console.log("You will not see this message!");
});

console.log("start");

var not_propagated_emit = e.emit("hello", "a", "b");

var propagated_emit = e.emit("propagation-test");

process.addListener("exit", function () {
  assert.deepEqual(["hello", "propagation-test", "propagation-test"],
                   events_new_listener_emited);
  
  // When noone stops propagation
  // Emit return false
  assert.equal(false, not_propagated_emit);
  
  // But when propagation was stopped
  // Emit returns true
  assert.equal(true, propagated_emit);
  
  assert.equal(1, propagation_test_times);
  assert.equal(1, times_hello_emited);
});


