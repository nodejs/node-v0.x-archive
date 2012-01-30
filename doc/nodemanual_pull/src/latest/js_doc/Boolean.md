
/** section: Javascript_Reference
class Boolean

The `Boolean` object is an object wrapper for a boolean value.

Don't confuse the primitive Boolean values `true` and `false` with the `true` and `false` values of the Boolean object.

Any object whose value is not undefined or null, including a Boolean object whose value is false, evaluates to true when passed to a conditional statement. For example, the condition in the following if statement evaluates to true:

	x = new Boolean(false);
	if (x) {
		// . . . this code is executed
	}
        
This behavior does not apply to Boolean primitives. For example, the condition in the following if statement evaluates to false:

	x = false;
	if (x) {
		// . . . this code is not executed
	}
        
Don't use a Boolean object to convert a non-boolean value to a boolean value. Instead, use Boolean as a function to perform this task:

	x = Boolean(expression);     // preferred
	x = new Boolean(expression); // don't use
        
If you specify any object, including a Boolean object whose value is false, as the initial value of a Boolean object, the new Boolean object has a value of true.

	myFalse = new Boolean(false);   // initial value of false
	g = new Boolean(myFalse);       // initial value of true
	myString = new String("Hello"); // string object
	s = new Boolean(myString);      // initial value of true
        
Don't use a Boolean object in place of a Boolean primitive.

**/

/**
new Boolean(value)
- value (Boolean): The initial value of the Boolean object.

The value passed as the first parameter is converted to a boolean value, if necessary. If value is omitted or is 0, -0, null, `false`, NaN, undefined, or the empty string (""), the object has an initial value of false. All other values, including any object or the string "false", create an object with an initial value of `true`.

#### Example: Creating `Boolean` objects with an initial value of `false`

	bNoParam = new Boolean();
	bZero = new Boolean(0);
	bNull = new Boolean(null);
	bEmptyString = new Boolean("");
	bfalse = new Boolean(false);

#### Example: Creating `Boolean` objects with an initial value of `true`
  

	true = new Boolean(true);
	btrueString = new Boolean("true");
	bfalseString = new Boolean("false");
	bSuLin = new Boolean("Su Lin");

**/

/**
Boolean.toString() -> String
  
For Boolean objects, this method returns a string representation of the object.

The [[Boolean `Boolean`]] object overrides the `toString()` method of the [[Object `Object`]] object; it does not inherit [[Object.toString `Object.toString()`]].

Javascript calls the `toString()` method automatically when a Boolean is to be represented as a text value or when a Boolean is referred to in a string concatenation.

For Boolean objects and values, the built-in `toString` method returns the string "`true`" or "`false`" depending on the value of the boolean object. In the following code, `flag.toString` returns "`true`".

	var flag = new Boolean(true)
	var myVar = flag.toString()

#### See Also 
* [[Object.toString `Object.toString()`]]

**/

/**
Boolean.valueOf() -> Boolean

This method returns the primitive value of a Boolean object or literal Boolean as a Boolean data type.

This method is usually called internally by Javascript and not explicitly in code.

#### Example: Using `valueOf`

	x = new Boolean();
	myVar = x.valueOf()      //assigns false to myVar
    
#### See Also
* [[Object.valueOf `Object.valueOf`]]

**/

