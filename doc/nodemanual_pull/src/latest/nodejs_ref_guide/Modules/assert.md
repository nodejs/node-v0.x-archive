

### section: NodeJS_Ref_Guide
## class assert

The Assert module is used for writing unit tests for your applications. You can access it by adding `require('assert')` to your code.

All of the `assert` methods basically compare two different states&mdash;an expected one, and an actual one&mdash;and return a Boolean condition. If the comparisson is `true`, the condition passes. If an assert method is `false`, the entire Node.js app crashes.

Some methods have an additional `message` parameter, which sends text out to the console when the assert fails.

#### Example: Testing for equivalency

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/assert/assert.js?linestart=3&lineend=0&showlines=true' defer='defer'></script>




## assert.fail(actual, expected, message, operator) -> Void
- actual (Object): The value you receive
- expected (Object): The expected value you're looking for
- message (String): The message to send to the console if the comparisson fails
- operator (String): The operator used to separate the `actual` and `expected` values in the `message`

Throws an exception that displays the values for `actual` and `expected` separated by the provided operator.


#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/assert/assert.fail.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## assert.assert(value, message) -> Void
- value (Object): The value you receive
- message (String): The message to send to the console if the comparisson fails

Tests if value is a `true` value. This is equivalent to `assert.equal(true, value, message)`. This is the same as `assert.ok()`, except that `message` is required.

 



## assert.ok(value, [message]) -> Void
- value (Object): The value you receive
- message (String): The message to send to the console if the comparisson fails

Tests if value is a `true` value. This is equivalent to `assert.equal(true, value, message);`. This is the same as `assert()`, except that `message` is not required.

 



## assert.equal(actual, expected [, message]) -> Void
- actual (Object): The value you receive
- expected (Object): The expected value you're looking for
- message (String): The message to send to the console if the comparisson fails

Tests shallow, coercive equality with the equal comparison operator ( `==` ).

 



## assert.notEqual(actual, expected, [message]) -> Void
- actual (Object): The value you receive
- expected (Object): The expected value you're looking for
- message (String): The message to send to the console if the comparisson fails

Tests shallow, coercive non-equality with the not equal comparison operator ( `!=` ).

 



## assert.deepEqual(actual, expected, [message]) -> Void
- actual (Object): The value you receive
- expected (Object): The expected value you're looking for
- message (String): The message to send to the console if the comparisson fails

Tests for deep equality.

 



## assert.notDeepEqual(actual, expected, [message]) -> Void
- actual (Object): The value you receive
- expected (Object): The expected value you're looking for
- message (String): The message to send to the console if the comparisson fails

Tests for any deep inequality. 

 



## assert.strictEqual(actual, expected, [message]) -> Void
- actual (Object): The value you receive
- expected (Object): The expected value you're looking for
- message (String): The message to send to the console if the comparisson fails

Tests strict equality, as determined by the strict equality operator ( `===` ).


 



## assert.notStrictEqual(actual, expected, [message]) -> Void
- actual (Object): The value you receive
- expected (Object): The expected value you're looking for
- message (String): The message to send to the console if the comparisson fails

Tests strict non-equality, as determined by the strict not equal operator ( `!==` ).

 



## assert.throws(block, [error], [message]) -> Void
- block (Function): A block of code to check against
- error (Function | RegExp | Function): The expected error that's thrown; this can be a constructor, regexp, or validation function
- message (String): The message to send to the console if the comparisson fails

If `block`throws an error, then the assertion passes.

#### Example: Validate `instanceof` using a constructor:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/assert/assert.throws_1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: Validate an error message using regular expressions:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/assert/assert.throws_2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: Custom error validation:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/assert/assert.throws_3.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## assert.doesNotThrow(block, [error], [message]) -> Void
- block  (Function): A block of code to check against
- error  (RegExp | Function): The expected error that's thrown; this can be a constructor, regexp, or validation function
- message  (String): The message to send to the console if the comparisson fails

Expects `block` not to throw an error; for more details, see `assert.throws()`.


 



## assert.ifError(value) -> Void
- value (Object): The value to check against 

Tests if value is `false`; throws an error if it is `true`. Useful when testing the first argument, `error`, in callbacks.

 
