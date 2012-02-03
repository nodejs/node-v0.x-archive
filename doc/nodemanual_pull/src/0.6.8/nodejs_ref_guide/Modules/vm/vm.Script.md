
## class vm.Script

This object is created as a result of the [[vm.createScript `vm.createScript()`]] method. It represents some compiled code than can be run at a later moment.





## vm.Script.runInThisContext() -> String

Similar to `vm.runInThisContext()`, but a method of the precompiled `Script` object.

`script.runInThisContext()` runs the code of `script` and returns the result. Running code doesn't have access to local scope, but does have access to the `global` object.

#### Example

Using `script.runInThisContext()` to compile code once and run it multiple times:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/vm/vm.Script.runInThisContext.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Returns

A string representing the result of running `code`.

 



## vm.Script.runInNewContext([sandbox]) -> String
- sandbox (Object): A global object with properties to pass into the `Script` object

Similar to `vm.runInNewContext()`, this is a method of a precompiled `Script` object.

`script.runInNewContext()` runs the code of `script` with `sandbox` as the global object and returns the result. Running code does not have access to local scope.

<Warning>Running untrusted code is a tricky business requiring great care.  To prevent accidental global variable leakage, `script.runInNewContext()` is quite useful, but safely running untrusted code requires a separate process.</Warning>

#### Example

Compiling code that increments a global variable and sets one, then execute the code multiple times:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/vm/vm.Script.runInNewContext.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Returns

A string representing the result of running `code`.

 

