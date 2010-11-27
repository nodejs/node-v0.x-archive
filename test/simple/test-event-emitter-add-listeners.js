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

console.log("start");

var times_prop_emited = 0;

function onprop() {
  times_prop_emited++;
  return false;
}
e.on("prop", onprop);
e.on("prop", onprop);

var result_of_not_stopped = e.emit("hello", "a", "b");

var result_of_not_called = e.emit("does-not-exist");

var result_of_stopped = e.emit("prop");

process.addListener("exit", function () {
  assert.deepEqual(["hello", "prop", "prop"], events_new_listener_emited);
  assert.equal(1, times_hello_emited);
  assert.equal(1, times_prop_emited);
  assert.equal(result_of_not_stopped, events.EVENT_EMITTED);
  assert.equal(result_of_not_called, events.NO_EFFECT);
  assert.equal(result_of_stopped, events.STOPPED_PROPAGATION);
});


