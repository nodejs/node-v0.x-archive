assert = require('assert');
fs = require('fs');

oldfd = fs.openSync(__filename, 'r');
newfd = fs.dup(oldfd);
assert.notEqual(oldfd, newfd, 'oldfd and newfd must not be identical');

threw = false;
try {
  fs.dup(-1);
} catch (ex) {
  threw = true;
}
assert.ok(threw, 'fs.dup(-1) must throw exception');

oldfd = fs.openSync(__filename, 'r');
newfd = fs.openSync(__filename, 'r');
rv = fs.dup(oldfd, newfd);
assert.notEqual(rv, oldfd, 'dup2(oldfd, newfd) must not return oldfd');
assert.equal(rv, newfd, 'dup2(oldfd, newfd) must return newfd');

newfd = 42;
rv = fs.dup(oldfd, newfd);
assert.notEqual(rv, oldfd, 'dup2(oldfd, newfd) must not return oldfd');
assert.equal(rv, newfd, 'dup2(oldfd, newfd) must return newfd');

rv = fs.dup(oldfd, oldfd);
assert.equal(rv, oldfd, 'dup2(oldfd, newfd) must not return oldfd');

threw = false;
try {
  fs.dup(-1, -1);
} catch (ex) {
  threw = true;
}
assert.ok(threw, 'fs.dup2(-1, -1) should throw exception');
