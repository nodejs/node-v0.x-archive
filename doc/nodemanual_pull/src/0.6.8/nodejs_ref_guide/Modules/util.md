
## class util


The `util` module provides varies utilities that you can use in your Node.js programs, fmostly around verifying the type of an object. To access these methods, add `require('util')` to your code.

A major difference between these methods and the ones found in the [[console `console`]] module is that these don't print to the console.




## util.debug(str) -> String
- str (String):  The string to print

A synchronous output function. This block the process and outputs `string` immediately to `stderr`.


 



## util.format([arg...]) -> String
- arg (String):  The string to print, and any additional formatting arguments

Returns a formatted string using the first argument in [a `printf()`-like](http://en.wikipedia.org/wiki/Printf_format_string#Format_placeholders) way.

The first argument is a string that contains zero or more placeholders. Each placeholder is replaced with the converted value from its corresponding argument. Supported placeholders are:

* `%s` - String.
* `%d` - Number (both integer and float).
* `%j` - JSON.
* `%%` - single percent sign (`'%'`). This does not consume an argument.


#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/util/util.format.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
 



## util.inspect(object, showHidden=false, depth=2) -> String
- object (Object):  The object to be represented
- showHidden (Boolean): Identifies whether the non-enumerable properties are also shown
- depth (Number): Indicates how many times to recurse while formatting the object

Returns a string representation of `object`, which is useful for debugging.

To make the function recurse an object indefinitely, pass in `null` for `depth`.

If `colors` is `true`, the output is styled with ANSI color codes.

#### Example

Here's an example inspecting all the properties of the `util` object:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/util/util.inspect.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## util.isArray(object) -> Boolean
- object (Object):  The object to be identified

Returns `true` if the given object is an `Array`.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/util/util.isArray.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## util.isDate(object) -> Boolean
- object (Object):  The object to be identified

Returns `true` if the given object is a `Date`.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/util/util.isDate.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## util.isError(object) -> Boolean
- object (Object):  The object to be identified

Returns `true` if the given object is an `Error`.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/util/util.isError.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## util.isRegExp(object) -> Boolean
- object (Object):  The object to be identified

Returns `true` if the given "object" is a `RegExp`.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/util/util.isRegExp.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
    

 



## util.log(str) -> Void
- str (String): The string to print

Outputs to `stdout`...but with a timestamp!

 



## util.pump(readableStream, writableStream, [callback()]) -> Void
- readableStream (streams.ReadableStream): The stream to read from
- writableStream (streams.WritableStream): The stream to write to
- callback (Function):  An optional callback function once the pump is through

Reads the data from `readableStream` and sends it to the `writableStream`.

When `writableStream.write(data)` returns `false`, `readableStream` is paused until the `drain` event occurs on the `writableStream`. `callback` gets an error as its only argument and is called when `writableStream` is closed or when an error occurs.

 



## util.inherits(constructor, superConstructor) -> Void
- constructor (Function): The prototype methods to inherit
- superConstructor (Object): The new object's type

Inherit the prototype methods from one constructor into another. The prototype of `constructor` is set to a new object created from `superConstructor`.

As an additional convenience, `superConstructor` is accessible through the `constructor.super_` property.

For more information, see the MDN [`constructor`](https://developer.mozilla.org/en/Javascript/Reference/Global_Objects/Object/constructor) documentation.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/util/util.inherits.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>


 

