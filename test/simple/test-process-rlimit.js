var assert = require('assert');
var common = require('../common');

var limits = [
    "core",
    "cpu",
    "data",
    "fsize",
    "nofile",
    "stack",
    "as"
];

// getrlimit: invalid input args
try {
    process.getrlimit("foobar");
    assert.ok(false);
}
catch(e) { }

try {
    process.getrlimit();
    assert.ok(false);
}
catch(e) { }

try {
    process.getrlimit(0);
    assert.ok(false);
}
catch(e) { }

// getrlimit: check all supported resources
for(var i in limits) {
    console.log("getrlimit: " + limits[i]);
    var limit = process.getrlimit(limits[i]);
    console.log(common.inspect(limit));
    assert.equal(true, typeof limit.soft == 'number');
    assert.equal(true, typeof limit.hard == 'number');
}

// setrlimit: invalid input args
try {
    process.setrlimit();
    assert.ok(false);
}
catch(e) { }

try {
    process.setrlimit("nofile");
    assert.ok(false);
}
catch(e) { }

try {
    process.setrlimit("foobar", {soft: 100});
    assert.ok(false);
}
catch(e) { }

// make some "nofile" adjustments
var begin = process.getrlimit("nofile")
console.log("begin: " + common.inspect(begin));
process.setrlimit("nofile", {soft: 500})
var now = process.getrlimit("nofile")
assert.equal(begin.hard, now.hard);
console.log("adjusted: " + common.inspect(now));
assert.equal(now.soft, 500);

// setrlimit: lower each limit by one
for(var i in limits) {
    var limit = process.getrlimit(limits[i]);
    if(limit.soft > 1) {
        console.log("setrlimit: " + limits[i] + " " + common.inspect(limit));
        process.setrlimit(limits[i], {
            soft: limit.soft - 1,
            hard: limit.hard
        });
        var limit2 = process.getrlimit(limits[i]);
        assert.equal(limit.soft - 1, limit2.soft);
        console.log(limits[i] + " was: " + common.inspect(limit));
        console.log(limits[i] + " now: " + common.inspect(limit2));
    }
}

