
/** section: Javascript_Reference
class Error


Runtime errors result in new `Error` objects being created and thrown.

#### Error types

Besides the generic `Error` constructor, there are six other core error constructors in Javascript:

* [[EvalError `EvalError`]]: Creates an instance representing an error that occurs regarding the global function `eval()`.
* [[RangeError `RangeError`]]: Creates an instance representing an error that occurs when a numeric variable or parameter is outside of its valid range
* [[ReferenceError `ReferenceError`]]: Creates an instance representing an error that occurs when de-referencing an invalid reference
* [[SyntaxError `SyntaxError`]]: Creates an instance representing a syntax error that occurs while parsing code in `eval()`
* [[TypeError `TypeError`]]: Creates an instance representing an error that occurs when a variable or parameter is not of a valid type
* [[URIError `URIError`]]: Creates an instance representing an error that occurs when `encodeURI()` or `decodeURI()` are passed invalid parameters

For client-side exceptions, see [Exception Handling Statements](https://developer.mozilla.org/en/Javascript/Guide/Statements#Exception_Handling_Statements).

        
#### Example: Throwing a generic error

Usually you create an Error object with the intention of raising it using the [`throw`](https://developer.mozilla.org/en/Javascript/Reference/Statements/throw "en/Javascript/Reference/Statements/throw") keyword. You can handle the error using the [`try...catch`](https://developer.mozilla.org/en/Javascript/Reference/Statements/try...catch "en/Javascript/Reference/Statements/try...catch") construct:
    
	try {
		throw new Error("Whoops!");
	} catch (e) {
		console.log(e.name + ": " + e.message);
	}
            
#### Example: Handling a specific error

You can choose to handle only specific error types by testing the error type with the error's [constructor](https://developer.mozilla.org/en/Javascript/Reference/Global_Objects/Object/constructor "en/Javascript/Reference/Global_Objects/Object/constructor") property or, if you're writing for modern Javascript engines, [`instanceof`](https://developer.mozilla.org/en/Javascript/Reference/Operators/instanceof "en/Javascript/Reference/Operators/Special_Operators/instanceof_Operator") keyword:
    
	try {
		foo.bar();
	} catch (e) {
		if (e instanceof EvalError) {
	 		console.log(e.name + ": " + e.message);
		} else if (e instanceof RangeError) {
			console.log(e.name + ": " + e.message);
	  	}
		// ... etc
	}

**/

/**
new Error([message[, fileName[, lineNumber]]])
- message (String): Human-readable description of the error
- fileName (String): The name of the file containing the code that caused the exception (Non-standard)
- lineNumber (Number): The line number of the code that caused the exception (Non-standard)

Creates an error object.

#### Example: Custom Error Types

The Error object can be extended to create Error Types for your project.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Error/error.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

**/

/**
Error.message -> String
    
A human-readable description of the error.

This property contains a brief description of the error if one is available or has been set. 

By default, the `message` property is an empty string, but this behavior can be overridden for an instance by specifying a message as the first argument to the `Error` constructor.

#### Example: Throwing a custom error

	var e = new Error("Could not parse input"); // e.message is "Could not parse input"
	throw e;
    
**/

/**
Error.name -> String
   
A name for the type of error.
    
By default, `Error` instances are given the name "Error". The `name` property, in addition to the [[Error.message `message`]] property, is used by the to create a string representation of the error.

#### Example: Throwing a custom error

	var e = new Error("Malformed input"); // e.name is "Error"
	e.name = "ParseError";                // e.toString() would return
	throw e;                              // "ParseError: Malformed input"

**/

/**
Error.stack -> String

This non-standard property of `Error` objects offers a trace of which functions were called, in what order, from which line and file, and with what arguments. The stack string proceeds from the most recent calls to earlier ones, leading back to the original global scope call.

Each step will be separated by a newline, with the first part of the line being the function name (if not a call from the global scope), followed by the argument values converted to string in parentheses, then by an at (@) sign, the file location (except when the function is the error constructor as the error is being thrown), a colon, and, if there is a file location, the line number. (Note the Error object also possesses the fileName and lineNumber properties for retrieving these from the error thrown (but only the error, and not its trace).)

While an object (or array, etc.) will appear in the converted form "[object Object]", and as such can't be evaluated back into the actual objects, scalar values can be retrieved (though it may be easier to use arguments.callee.caller.arguments, as could the function name be retrieved by arguments.callee.caller.name). "undefined" is listed as "(void 0)". Note that if string arguments are passed in with values such as "@", "(", ")" (or if in file names), you can't easily rely on these for breaking the line into its component parts.

#### Example

The following HTML markup demonstrates the use of `stack` property.

	<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
	<meta http-equiv="Content-Type" content="text/html; charset=windows-1251">
	<meta http-equiv="Content-Script-Type" content="text/Javascript">
	<title>Stack Trace Example</title>
	<body>
    <script type="text/Javascript">
        function trace() {
            try {
                throw new Error("myError");
            }
            catch(e) {
                alert(e.stack);
            }
        }
        function b() {
            trace();
        }
        function a() {
            b(3\. 4\. "\n\n", undefined, {});
        }
        a("first call, firstarg");
    </script>
        
Assuming the above markup is saved as C:\example.html on a Windows file system and is open in a browser it produces an alert message box with the following text:

	Error("myError")@:0
	trace()@file:///C:/example.html:9
	b(3,4,"\n\n",(void 0),[object Object])@file:///C:/example.html:16
	a("first call, firstarg")@file:///C:/example.html:19
	@file:///C:/example.html:21


**/

/**
Error.toString() -> String

Returns a string representing the specified Error object.
    

The `Error` object overrides the [[Object.toString `Object.toString()`]] method inherited by all objects. According to [ECMA-262](https://developer.mozilla.org/en/ECMAScript), implementations are free to decide the behavior of this method.

If the string representation of either of these two properties is an empty string, this method simply returns the string representation of the property that has a non-zero length. If both properties' string representations are empty strings, this method returns an empty string.

Note that when creating a string representation of the `name` and `message` properties, this method does not invoke those properties' `toString` methods. If the value in either of these properties is not already a string, this method will behave as if that property contained an empty string.

#### Example

	var e = new Error("fatal error");
	e.toString(); // returns "Error: fatal error"

	e.name = undefined;
	e.toString(); // returns "fatal error"

	e.message = undefined;
	e.toString(); // returns ""

	e.name = "Error";
	e.toString(); // returns "Error"

**/
