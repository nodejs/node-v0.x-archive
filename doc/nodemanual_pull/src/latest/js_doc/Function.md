

/** section: Javascript_Reference
class Function

Every function in Javascript is actually a `Function` object. Yes, it's true. Thus, all the following methods can be called on any function.

**/


/**
new Function([argN...], functionBody)
- argN (Object): Names to be used by the function as formal argument names. Each must be a string that corresponds to a valid Javascript identifier or a list of such strings separated with a comma; for example "x", "theValue", or "a,b".
- functionBody (String): A string containing the Javascript statements comprising the function definition.

Function objects created with the Function constructor are parsed when the function is created. This is less efficient than declaring a function and calling it within your code, because functions declared with the function statement are parsed with the rest of the code.

All arguments passed to the function are treated as the names of the identifiers of the parameters in the function to be created, in the order in which they are passed.

Invoking the Function constructor as a function (without using the new operator) has the same effect as invoking it as a constructor.

#### Example: Specifying arguments with the `Function` constructor

 The following code creates a `Function` object that takes two arguments.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Function/function.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
The arguments "`a`" and "`b`" are formal argument names that are used in the function body, "`return a + b`".
**/


/**
Function.caller -> Function

Returns the function that invoked the specified function.

If the function `f` was invoked by the top level code, the value of `caller()` is `null`, otherwise it's the function that called `f`

This property replaces the deprecated `arguments.caller`.

#### Notes

 In case of recursion, you can't reconstruct the call stack using this property. Consider:
 
 	function f(n) { g(n-1) }
 	function g(n) { if(n>0) f(n); else stop() }
 	f(2)

 At the moment `stop()` is called, the call stack is:
 	
 	f(2) -> g(1) -> f(1) -> g(0) -> stop()
 
 The following is true:
 
 	stop.caller === g && f.caller === g && g.caller === f
 
 So if you tried to get the stack trace in the `stop()` function like this:
 
 	var f = stop;
 	var stack = "Stack trace:";
 	while (f) {
   	stack += "\n" + f.name;
   	f = f.caller;
 	}

 This loop would never stop.

 The special property `__caller__`, which returned the activation object of the caller thus allowing to reconstruct the stack, was removed for security reasons.

#### Example: Checking the value of a function's `caller` property

    function myFunc() {
       if (myFunc.caller == null) {
          return ("The function was called from the top!");
       } else
          return ("This function's caller was " + myFunc.caller);
    }

**/

/** 
Function.constructor -> Function

Returns a reference to the [[Function `Function`]] function that created the instance's prototype. Note that the value of this property is a reference to the function itself, not a string containing the function's name.

For more information, see [[Object.constructor `Object.constructor`]].

**/

/**
Function.length -> Number
  
`length` is a property of a function object, and indicates how many arguments the function expects, i.e. the number of formal parameters. By contrast, [`arguments.length`](https://developer.mozilla.org/en/Javascript/Reference/Functions_and_function_scope/arguments/length) is local to a function and provides the number of arguments actually passed to the function.

#### Example
 
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Function/function.length.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>          
 
**/

/** read-only
Function.name -> String

The `name` property returns the name of a function, or an empty string for anonymous functions:

	function doSomething() {}
	alert(doSomething.name); // alerts "doSomething"

Functions created with the syntax `new Function` or just `Function(...)` have their name property set to "anonymous" on Firefox and Safari, or to an empty string on Chrome and Opera. This property is not supported on Internet Explorer.

Note that in these examples anonymous functions are created, so `name` returns an empty string:

	var f = function() { };

	var object = {

		someMethod: function() {}

	};

	console.log(f.name == ""); // true
	console.log(object.someMethod.name == ""); // also true


You can define a function with a name in a [function expression](https://developer.mozilla.org/En/Core_Javascript_1.5_Reference/Functions#Function_constructor_vs._function_declaration_vs._function_expression "En/Core_Javascript_1.5_Reference/Functions#Function_constructor_vs._function_declaration_vs._function_expression"):

	var object = {

		someMethod: function object_someMethod() {}

	};

	console.log(object.someMethod.name); // prints "object_someMethod"

	try { object_someMethod } catch(e) { alert(e); }

	// ReferenceError: object_someMethod is not defined


#### Example

 You can use `obj.constructor.name` to check the "class" of an object:

 	function a()
 	{
 	}
 
 	var b = new a();
 	console.log(b.constructor.name); // Prints "a"
 
**/

/**
Function.apply(thisArg[, argsArray]) -> Void
- thisArg (Object): The value of this provided for the call to fun.  Note that this may not be the actual value seen by the method: if the method is a function in non-strict mode code, null and undefined will be replaced with the global object, and primitive values will be boxed.  
- argsArray (Object): An array like object, specifying the arguments with which fun should be called, or `null` or `undefined` if no arguments should be provided to the function.

Calls a function with a given `this` value and `arguments` provided as an array.

You can assign a different `this` object when calling an existing function. `this` refers to the current object, the calling object. With `apply`, you can write a method once and then inherit it in another object, without having to rewrite the method for the new object.

`apply` is very similar to [[Function.call `call()`]], except for the type of arguments it supports. You can use an arguments array instead of a named set of parameters. With `apply`, you can use an array literal, for example, `_fun_.apply(this, ['eat', 'bananas'])`, or an `Array` object, for example, `_fun_.apply(this, new Array('eat', 'bananas'))`.

You can also use [`arguments`](https://developer.mozilla.org/en/Javascript/Reference/Functions_and_function_scope/arguments "En/Core_Javascript_1.5_Reference/Functions_and_function_scope/arguments") for the `argsArray` parameter. `arguments` is a local variable of a function. It can be used for all unspecified arguments of the called object. Thus, you don't have to know the arguments of the called object when you use the `apply` method. You can use `arguments` to pass all the arguments to the called object. The called object is then responsible for handling the arguments.

Since ECMAScript 5th Edition you can also use any kind of object which is array like, so in practice this means it's going to have a property `length` and integer properties in the range `[0...length)`. As an example you can now use a [`NodeList`](https://developer.mozilla.org/En/DOM/NodeList "en/DOM/NodeList") or a own custom object like `{'length': 2, '0': 'eat', '1':'bananas'}`.

<Note>Most browsers, including Chrome 14 and Internet Explorer 9, still don't accept array like objects and will throw an exception.</Note>


#### Example: Using `apply` to chain constructors

 You can use `apply` to chain constructors for an object, similar to Java. In the following example, the constructor for the `Product` object is defined with two parameters, `name` and `value`. Two other functions `Food` and `Toy` invoke `Product` passing `this` and `arguments`. Product initializes the properties name and price, both specialized functions define the category. In this example, the `arguments` object is fully passed to the product constructor and corresponds to the two defined parameters.
 
	function Product(name, price) {
		this.name = name;
		this.price = price;
 
	if (price < 0)
     throw RangeError('Cannot create product "' + name + '" with a negative price');
     return this;
	}
 
	function Food(name, price) {
		Product.apply(this, arguments);
		this.category = 'food';
	}
 
	Food.prototype = new Product();
 
	function Toy(name, price) {
		Product.apply(this, arguments);
		this.category = 'toy';
	}
 
	Toy.prototype = new Product();
 
	var cheese = new Food('feta', 5);
	var fun = new Toy('robot', 40);
         
 #### Example: `apply()` and built-in functions

 Clever usage of `apply` allows you to use built-ins functions for some tasks that otherwise probably would have been written by looping over the array values. As an example here we are going to use Math.max/Math.min to find out the maximum/minimum value in an array.
 
	// min/max number in an array
	var numbers = [5, 6, 2, 3, 7];
 
	// using Math.min/Math.max apply
	var max = Math.max.apply(null, numbers); // Equivalent to Math.max(numbers[0], ...) or Math.max(5, 6, ..)
	var min = Math.min.apply(null, numbers);
 
	// versus a simple loop based algorithm:
	max = -Infinity, min = +Infinity;
 
	for (var i = 0; i < numbers.length; i++) {
		if (numbers[i] > max)
			max = numbers[i];
		if (numbers[i] < min) 
			min = numbers[i];
	}
         
 But beware: in using `apply` this way, as you run the risk of exceeding the Javascript engine's argument length limit. The consequences of applying a function with too many arguments (think more than tens of thousands of arguments) vary across engines, because the limit (indeed even the nature of any excessively-large-stack behavior) is unspecified. Some engines will throw an exception. More perniciously, others will arbitrarily limit the number of arguments actually passed to the applied function. (To illustrate this latter case: if such an engine had a limit of four arguments [actual limits are of course significantly higher], it would be as if the arguments `5, 6, 2, 3` had been passed to `apply` in the examples above, rather than the full array.) If your value array might grow into the tens of thousands, use a hybrid strategy: apply your function to chunks of the array at a time:
 
	function minOfArray(arr)
	{
		var min = Infinity;
		var QUANTUM = 32768;
		for (var i = 0, len = arr.length; i < len; i += QUANTUM)
		{
			var submin = Math.min.apply(null, numbers.slice(i, Math.min(i + QUANTUM, len)));
			min = Math.min(submin, min);
		}
		return min;
	}
 
	var min = minOfArray([5, 6, 2, 3, 7]);
         
#### See Also 

* [[Function.call `call()`]]
* [[Function.bind `bind()`]]

**/

/**
Function.call(thisArg[, argN...]) -> Void
- thisArg (Object): The value of this provided for the call to this function.  Note that this may not be the actual value seen by the method: if the method is a function in non-strict mode code, null and undefined will be replaced with the global object, and primitive values will be boxed.
- argN (Object): Arguments for the object.

Calls a function with a given `this` value and arguments provided individually.

<Note>While the syntax of this function is almost identical to that of [[Function.apply `Function.apply()`]], the fundamental difference is that `call()` accepts an argument list, while `apply()` accepts a single array of arguments.</Note>

You can assign a different `this` object when calling an existing function. `this` refers to the current object, the calling object.

With `call`, you can write a method once and then inherit it in another object, without having to rewrite the method for the new object.

Example: Using `call` to chain constructors for an object 
 You can use `call` to chain constructors for an object, similar to Java.In the following example, the constructor for the `Product` object is defined with two parameters, `name` and `value`. Two other functions `Food` and `Toy` invoke `Product` passing `this` and `name` and `value`. Product initializes the properties name and price, both specialized functions define the category.
 
	function Product(name, price) {
	   this.name = name;
	   this.price = price;
	 
	   if (price < 0)
	     throw RangeError('Cannot create product "' + name + '" with a negative price');
	   return this;
	 }
	 
	 function Food(name, price) {
	   Product.call(this, name, price);
	   this.category = 'food';
	 }
	 Food.prototype = new Product();
	 
	 function Toy(name, price) {
	   Product.call(this, name, price);
	   this.category = 'toy';
	 }
	 Toy.prototype = new Product();
	 
	 var cheese = new Food('feta', 5);
	 var fun = new Toy('robot', 40);
         
 #### Example: Using `call` to invoke an anonymous function 

 In this purely constructed example, we create anonymous function and use `call` to invoke it on every object in an array. The main purpose of the anonymous function here is to add a print function to every object, which is able to print the right index of the object in the array. Passing the object as `this` value was not strictly necessary, but is done for explanatory purpose.
 
	var animals = [
	   {species: 'Lion', name: 'King'},
	   {species: 'Whale', name: 'Fail'}
	 ];
	 
	 for (var i = 0; i < animals.length; i++) {
	   (function (i) { 
	     this.print = function () { 
	       console.log('#' + i  + ' ' + this.species + ': ' + this.name); 
	     } 
	   }).call(animals[i], i);
	 }
         

**/

/** 
Function.toSource() -> String
	
Returns a string representing the source code for the function.

The `toSource` method returns the following values:

* For the built-in `Function` object, `toSource` returns the following string indicating that the source code is not available:

	function Function() {
   [native code]
	}

* For custom functions, `toSource` returns the Javascript source that defines the object as a string.


This method is usually called internally by Javascript and not explicitly in code. You can call `toSource` while debugging to examine the contents of an object.


**/

/**
Function.toString(indentation) -> String
- indentation (Number): The amount of spaces to indent the string representation of the source code. If indentation is less than or equal to -1, most unnecessary spaces are removed.

Returns a string representing the source code of the function.


The `[Function]` object overrides the [[Object.toString `Object.toString()`]] method inherited from `Object`; it does not inherit `Object.prototype.toString`. For `Function` objects, the `toString` method returns a string representation of the object in the form of a function declaration. That is, `toString()` decompiles the function, and the string returned includes the `function` keyword, the argument list, curly braces, and the source of the function body.

Javascript calls the `toString` method automatically when a `Function` is to be represented as a text value, e.g. when a function is concatenated with a string.

**/

/** deprecated
Function.arguments -> Array

An array-like object corresponding to the arguments passed to a function.
 
In the case of recursion, i.e. if the function appears several times on the call stack, the value of `f.arguments` represents the arguments corresponding to the most recent invocation of the function.
 
#### Example  

	function f(n) { g(n-1) }
	function g(n) {
		print("before: " + g.arguments[0]);
		if(n>0)
			f(n);
		print("after: " + g.arguments[0]);
	}
	
Calling `f(2)` outputs:
 
	before: 1
	before: 0
	after: 0
	after: 1
 
**/

/** deprecated
Function.arity -> Number
   
Specifies the number of arguments expected by the function.

The `arity` property no longer exists and has been replaced by the [[Function.length `length`]] property.

**/

/**
Function.bind(thisArg[, argN...]) -> Function
- thisArg (Object): The value to be passed as the this parameter to the target function when the bound function is called. The value is ignored if the bound function is constructed using the new operator.
- argN (Object): Arguments to prepend to arguments provided to the bound function when invoking the target function.

The `bind` function creates a new function (a _bound function_) with the same function body (internal [Call](https://developer.mozilla.org/Call "Call") attribute in ECMAScript 5 terms) as the function it is being called on (the bound function's _target function_) with the `this` value bound to the first argument of `bind`, which can't be overridden. `bind` also accepts leading default arguments to provide to the target function when the bound function is called. A bound function may also be constructed using the `new` operator: doing so acts as though the target function had instead been constructed.  The provided `this` value is ignored, while prepended arguments are provided to the emulated function.
         
 Some of the many differences (there may well be others, as this list does not seriously attempt to be exhaustive) between this algorithm and the specified algorithm are:
* The partial implementation relies [[Array.slice `Array.slice()`]], [[Array.concat `Array.concat()`]], [[Function.call `call()`]], and [[Function.apply `apply()`]], built-in methods to have their original values.
* The partial implementation creates functions that don't have immutable "poison pill" `caller` and `arguments` properties that throw a `TypeError` upon get, set, or deletion. (This could be added if the implementation supports [[Object.defineProperty `Object.defineProperty()`]], or partially implemented (without throw-on-delete behavior) if the implementation supports the `Object.__defineGetter__` and `Object.__defineSetter__` extensions.)
* The partial implementation creates functions that have a `prototype` property. (Proper bound functions have none.)
* The partial implementation creates bound functions whose `length` property does not agree with that mandated by ECMA-262: it creates functions with length 0, while a full implementation, depending on the length of the target function and the number of pre-specified arguments, may return a non-zero length.

 If you choose to use this partial implementation, *you must not rely on those cases where behavior deviates from ECMA-262, 5th edition!* With some care, however (and perhaps with additional modification to suit specific needs), this partial implementation may be a reasonable bridge to the time when `bind` is widely implemented according to the specification.
 
#### Example: Creating a bound function 

 The simplest use of `bind` is to make a function that, no matter how it is called, is called with a particular `this` value. A common mistake for new Javascript programmers is to extract a method from an object, then to later call that function and expect it to use the original object as its `this` (e.g. by using that method in callback-based code).  Without special care, however, the original object is usually lost.  Creating a bound function from the function, using the original object, neatly solves this problem:
 
		var x = 9; 
 	var module = {
 		x: 81,
 		getX: function() { return this.x; }
		};
 
		module.getX(); // 81
 
		var getX = module.getX;
		getX(); // 9, because in this case, "this" refers to the global object
 
		// create a new function with 'this' bound to module
		var boundGetX = getX.bind(module);
		boundGetX(); // 81
         
 #### Example: Currying 

 The next simplest use of `bind` is to make a function with pre-specified initial arguments. These arguments (if any) follow the provided `this` value and are then inserted at the start of the arguments passed to the target function, followed by the arguments passed to the bound function, whenever the bound function is called.
 
		function list() {
			return Array.prototype.slice.call(arguments);
		}
 
		var list1 = list(1, 2, 3); // [1, 2, 3]
 
		//  Create a function with a preset leading argument
		var leadingZeroList = list.bind(undefined, 37);
 
		var list2 = leadingZeroList(); // [37]
		var list3 = leadingZeroList(1, 2, 3); // [37, 1, 2, 3]
         
 #### Example: Bound functions used as constructors 

 Bound functions are automatically suitable for use with the `new` operator to construct new instances created by the target function. When a bound function is used to construct a value, the provided `this` is ignored. However, provided arguments are still prepended to the constructor call:
 
		function Point(x, y) {
		this.x = x;
		this.y = y;
		}
 
		Point.prototype.toString = function() { 
			return this.x + "," + this.y; 
		};
 
		var p = new Point(1, 2);
		p.toString(); // "1,2"
 
 
		var emptyObj = {};
		var YAxisPoint = Point.bind(emptyObj, 0 /* x */);
 
		var axisPoint = new YAxisPoint(5);
		axisPoint.toString(); //  "0,5"
 
		axisPoint instanceof Point; // true
		axisPoint instanceof YAxisPoint; // true
		new Point(17, 42) instanceof YAxisPoint; // false with native bind // true, when using the above polyfill
         
 Note that you need don'thing special to create a bound function for use with `new`. The corollary is that you need don'thing special to create a bound function to be called plainly, even if you would rather require the bound function to only be called using `new`. If you wish to support use of a bound function only using `new`, or only by calling it, the target function must enforce that restriction.
 
		// Example can be run directly in your Javascript console
		// ...continuing from above
	
		// Can still be called as a normal function (although usually this is undesired)
		YAxisPoint(13);
 
		emptyObj.x + "," + emptyObj.y;
		// >  "0,13"
         
 #### Example: Creating Shortcuts 
 `bind` is also helpful in cases where you want to create a shortcut to a function which requires a specific `this` value. Take [[Array.slice `Array.slice()`]], for example, which you want to use for converting an array-like object to a real array. You could create a shortcut like this:

		var slice = Array.prototype.slice;
 
 	// ...
 
		slice.call(arguments); 

With `bind`, this can be simplified to the following. `slice` will be a bound function to the `call()` function of `Function`, with the `this `value set to the `slice()` function of `Array`. This means that additional `.call` calls can be eliminated: 

		var slice = Function.prototype.call.bind(Array.prototype.slice);
 
 	// ...
 
 	slice(arguments);

#### Supplemental

 One interesting wrinkle of bound functions working "as expected" with the `new` operator is that it is now possible to implement what one might call `construct()`, an analog to [[Function.apply `apply()`]] that takes an array of values as its sole argument,constructing this function with the provided arguments using the `new` operator:
 
	// Function.prototype.construct will work with the Function.prototype.bind defined above
 
	if (!Function.prototype.construct) { 
		Function.prototype.construct = function(aArgs) {
 
		if (aArgs.constructor !== Array)
			throw new TypeError("second argument to Function.prototype.construct must be an array");
 
			var aBoundArgs = Array.prototype.concat.apply([null], aArgs), 
			fBound = this.bind.apply(this, aBoundArgs);
         
		return new fBound();
 
		};
	}
 
	// Now consider the string "2011-7-16 19:35:46". Without an analog of the Function.apply method for constructors,
	// you would run a lot of steps in order to construct a Date object from it:
 
	 var aDateArgs = "2011-7-16 19:35:46".split(/[- :]/),
	     oMyDate1 = new Date(aDateArgs[0], aDateArgs[1], aDateArgs[2], aDateArgs[3], aDateArgs[4], aDateArgs[5]);
	 alert(oMyDate1.toLocaleString());
	 
	 
	 // With the Function.construct method we could do the same thing with a single step:
	 var oMyDate2 = Date.construct("2011-7-16 19:35:46".split(/[- :]/));
	 alert(oMyDate2.toLocaleString());
	 
	 // Here is another example:
	 
	 function Point(x, y) {
	   this.x = x;
	   this.y = y;
	 }
	 
	 Point.prototype.toString = function() { 
	   return this.x + "," + this.y; 
	 };
	 
	 alert(Point.construct([2, 4]).toString()); // "2,4"
         
 But note well: the efficiency of constructing a new function every time you wish to construct an object by invoking a bound function via `new` with a variable number of arguments is questionable. Your code will be faster and more efficient if you use `Function.apply()` instead, with normal call syntax rather than using `new` operator-based syntax.
 
#### See Also
* [[Function.apply `apply()`]]
* [[Function.call `call()`]]

**/