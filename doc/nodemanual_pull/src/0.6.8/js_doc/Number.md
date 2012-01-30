

/** section: Javascript_Reference
class Number

This is a wrapper object that allows you to work with numerical values.

#### Example: Using the `Number` object to assign values to numeric variables
    
The following example uses the `Number` object's properties to assign values to several numeric variables:
    
    var biggestNum = Number.MAX_VALUE;
    var smallestNum = Number.MIN_VALUE;
    var infiniteNum = Number.POSITIVE_INFINITY;
    var negInfiniteNum = Number.NEGATIVE_INFINITY;
    var notANum = Number.NaN;

#### Example: Using `Number` to convert a `Date` object

The following example converts the `Date` object to a numerical value using `Number` as a function:
    
    var d = new Date("December 17, 1999 03:24:00");
    console.log(Number(d)); // "819199440000"

#### See Also

* [[NaN `NaN`]]
* [[Math `Math`]]


**/

/**
new Number(value)
- value (Object): The numeric value of the object being created.

The primary uses for the Number object are:

* If the argument can't be converted into a number, it returns NaN.
* In a non-constructor context (i.e., without the `new` operator), `Number` can be used to perform a type conversion.

**/

/**
Number.MAX_VALUE = "1.79E+308"

The maximum numeric value representable in Javascript. Values larger than `MAX_VALUE` are represented as [[Infinity `Infinity`]].

#### Example: Using `MAX_VALUE`

The following code multiplies two numeric values. If the result is less than or equal to `MAX_VALUE`, `func1` is called; otherwise, `func2` is called.
    
	if (num1 * num2 <= Number.MAX_VALUE)
       func1();
    else
       func2();

**/

/**
Number.MIN_VALUE = "5e-324"
   
The smallest positive numeric value representable in Javascript. Values smaller than `MIN_VALUE` ("underflow values") are converted to 0.

The `MIN_VALUE` property is the number closest to 0, not the most negative number, that Javascript can represent.

#### Example: Using `MIN_VALUE`

The following code divides two numeric values. If the result is greater than or equal to `MIN_VALUE`, the `func1` function is called; otherwise, the `func2` function is called.
   
    if (num1 / num2 >= Number.MIN_VALUE)
       func1()
    else
       func2()

**/

/**
Number.NEGATIVE_INFINITY -> Number
   
The value of `Number.NEGATIVE_INFINITY` is the same as the negative value of the global object's `[Infinity]` property.

This value behaves slightly differently than mathematical infinity:

* Any positive value, including [[Number.POSITIVE_INFINITY `POSITIVE_INFINITY`]], multiplied by `NEGATIVE_INFINITY` is` NEGATIVE_INFINITY`
* Any negative value, including `NEGATIVE_INFINITY`, multiplied by `NEGATIVE_INFINITY` is `POSITIVE_INFINITY`.
* Zero multiplied by `NEGATIVE_INFINITY` is [[NaN `NaN`]].
* `NaN` multiplied by `NEGATIVE_INFINITY` is `NaN`.
* `NEGATIVE_INFINITY`, divided by any negative value except `NEGATIVE_INFINITY`, is `POSITIVE_INFINITY`.
* `NEGATIVE_INFINITY`, divided by any positive value except `POSITIVE_INFINITY`, is `NEGATIVE_INFINITY`
* `NEGATIVE_INFINITY`, divided by either `NEGATIVE_INFINITY` or `POSITIVE_INFINITY`, is `NaN`.
* Any number divided by `NEGATIVE_INFINITY` is Zero.

Several Javascript methods (such as the `Number` constructor, `parseFloat()`, and `parseInt()`) return `NaN` if the value specified in the parameter is significantly lower than `Number.MIN_VALUE`.

You might use the `Number.NEGATIVE_INFINITY` property to indicate an error condition that returns a finite number in case of success. Note, however, that `isFinite()` would be more appropriate in such a case.

#### Example

In the following example, the variable smallNumber is assigned a value that is smaller than the minimum value. When the `if` statement executes, smallNumber has the value "`-Infinity`", so smallNumber is set to a more manageable value before continuing.

	var smallNumber = (-Number.MAX_VALUE) * 2;
	if (smallNumber == Number.NEGATIVE_INFINITY) {
		smallNumber = returnFinite();
	}
 
#### See Also
* [[Infinity `Infinity`]]
* `Number.POSITIVE_INFINITY`
**/

/** alias of: NaN
Number.NaN -> Number
  
A value representing "Not-A-Number."

**/

/**
Number.POSITIVE_INFINITY -> Number
  
A value representing the positive Infinity value.

The value of `Number.POSITIVE_INFINITY` is the same as the value of the global object's [[Infinity `Infinity`]] property.

This value behaves slightly differently than mathematical infinity:

* Any positive value, including `POSITIVE_INFINITY`, multiplied by `POSITIVE_INFINITY` is `POSITIVE_INFINITY`.
* Any negative value, including `NEGATIVE_INFINITY`, multiplied by `POSITIVE_INFINITY` is `NEGATIVE_INFINITY`.
* Zero multiplied by `POSITIVE_INFINITY` is `NaN`.
* `NaN` multiplied by `POSITIVE_INFINITY` is `NaN`.
* `POSITIVE_INFINITY`, divided by any negative value except `NEGATIVE_INFINITY`, is `NEGATIVE_INFINITY`.
* `POSITIVE_INFINITY`, divided by any positive value except `POSITIVE_INFINITY`, is `POSITIVE_INFINITY`.
* `POSITIVE_INFINITY`, divided by either `NEGATIVE_INFINITY` or `POSITIVE_INFINITY`, is `NaN`.
* Any number divided by `POSITIVE_INFINITY` is Zero.

Several Javascript methods (such as the `Number` constructor, `parseFloat()`, and `parseInt()`) return `NaN` if the value specified in the parameter is significantly higher than `Number.MAX_VALUE`.

You might use the `Number.POSITIVE_INFINITY` property to indicate an error condition that returns a finite number in case of success. Note, however, that `isFinite()` would be more appropriate in such a case.

#### Example

In the following example, the variable bigNumber is assigned a value that is larger than the maximum value. When the `if` statement executes, bigNumber has the value "`Infinity`", so bigNumber is set to a more manageable value before continuing.

	var bigNumber = Number.MAX_VALUE * 2
	if (bigNumber == Number.POSITIVE_INFINITY) {
 	bigNumber = returnFinite();
	}

#### See Also

* [[Infinity `Infinity`]]
* `Number.NEGATIVE_INFINITY`

**/

/** 
Number.toExponential([fractionDigits]) -> Function
- fractionDigits (Number): An integer specifying the number of digits after the decimal point. Defaults to as many digits as necessary to specify the number.
 
Returns a string representing a `Number` object in exponential notation with one digit before the decimal point, rounded to `fractionDigits` digits after the decimal point. If the `fractionDigits` argument is omitted, the number of digits after the decimal point defaults to the number of digits necessary to represent the value uniquely.

If you use the `toExponential` method for a numeric literal and the numeric literal has no exponent and no decimal point, leave a space before the dot that precedes the method call to prevent the dot from being interpreted as a decimal point.

If a number has more digits that requested by the `fractionDigits` parameter, the number is rounded to the nearest number represented by `fractionDigits` digits. See the discussion of rounding in the description of the [[Number.toFixed `toFixed()`]] method, which also applies to `toExponential`.
 
#### Example 

	var num = 77.1234;
	
	console.log("num.toExponential() is " + num.toExponential()); //displays 7.71234e+1
	console.log("num.toExponential(4) is " + num.toExponential(4)); //displays 7.7123e+1
	console.log("num.toExponential(2) is " + num.toExponential(2)); //displays 7.71e+1
	console.log("77.1234.toExponential() is " + 77.1234.toExponential()); //displays 7.71234e+1
	console.log("77 .toExponential() is " + 77 .toExponential()); //displays 7.7e+1

#### See Also

* [[Number.toFixed `toFixed()`]]
* [[Number.toPrecision `toPrecision()`]]
* [[Number.toString `toString()`]]

**/

/**
Number.toFixed([digits = 0]) -> String
- digits (Number): The number of digits to appear after the decimal point; this may be a value between 0 and 20, inclusive, and implementations may optionally support a larger range of values.
  
Formats a number using fixed-point notation.

#### Returns

A string representation of `number` that does not use exponential notation and has exactly `digits` digits after the decimal place. The number is rounded if necessary, and the fractional part is padded with zeros if necessary so that it has the specified length. If `number` is greater than 1e+21, this method simply calls `Number.toString()` and returns a string in exponential notation.

#### Throws
 
* `RangeError`: If digits is too small or too large. Values between 0 and 20, inclusive, will not cause a `RangeError`. Implementations are allowed to support larger and smaller values as well.<
* `TypeError`: If this method is invoked on an object that is not a `Number`.

#### Example

	var n = 12345.6789;
	
	n.toFixed();           // Returns "12346": note rounding, no fractional part
	
	n.toFixed(1);          // Returns "12345.7": note rounding
	
	n.toFixed(6);          // Returns "12345.678900": note added zeros
	
	(1.23e+20).toFixed(2); // Returns "123000000000000000000.00"
	
	(1.23e-10).toFixed(2); // Returns "0.00"
	
	2.34.toFixed(1);       // Returns "2.3"
	
	-2.34.toFixed(1);      // Returns -2.3 (due to operator precedence, negative numbers don't return a string...)
	
	(-2.24).toFixed(1);    // Returns "-2.3" (...unless you use parentheses)


#### See Also

* [[Number.toExponential `toExponential()`]]

**/

/**
Number.toLocaleString() -> String

This method converts the number into a string which is suitable for presentation in the given locale.

#### Example
 
	var number = 3500;
	console.log(number.toLocaleString()); // Displays "3,500" in English locale
         

**/

/**
Number.toPrecision([precision]) -> String
- precision (Number): An integer specifying the number of significant digits.

Returns a string representing the Number object to the specified precision. 

If the `precision` argument is omitted, behaves as [[Number.toString `toString()`]]. If it is a non-integer value, it is rounded to the nearest integer. After rounding, if that value is not between 1 and 100 (inclusive), a [[RangeError `RangeError`]] is thrown.

 <Note>[ECMA-262](http://www.ecma-international.org/publications/standards/Ecma-262.htm) only requires a precision of up to 21 significant digits. Other implementations may not support precisions higher than required by the standard.</Note> 

#### Returns

A string representing a `Number` object in fixed-point or exponential notation rounded to `precision` significant digits. See the discussion of rounding in the description of the [[Number.toFixed `toFixed()`]] method, which also applies to `toPrecision`.


#### Example

	var num = 5.123456;
	println("num.toPrecision() is " + num.toPrecision());   //displays 5.123456
	println("num.toPrecision(5) is " + num.toPrecision(5)); //displays 5.1235
	println("num.toPrecision(2) is " + num.toPrecision(2)); //displays 5.1
	println("num.toPrecision(1) is " + num.toPrecision(1)); //displays 5

#### See Also
* [[Number.toExponential `toExponential()`]]
* [[Number.toFixed `toFixed()`]]
* [[Number.toString `toString()`]]

**/

/**
	Number.toSource() -> String

Returns a string representing the source code of the object. The `toSource` method returns the following values:

* For the built-in `Number` object, `toSource` returns the following string indicating that the source code is not available:
	function Number() {[native code]}

* For instances of `Number`, `toSource` returns a string representing the source code.

This method is usually called internally by Javascript and not explicitly in code.


**/

/**
Number.toString([radix = 10]) -> String
- radix (Number): An integer between 2 and 36 specifying the base to use for representing numeric values.
	
Returns a string representing the specified Number object.

The `Number` object overrides the `toString` method of the [[Object `Object`]] object; it does not inherit [[Object.toString `Object.toString()`]]. For `Number` objects, the `toString` method returns a string representation of the object in the specified radix.

The `toString()` method parses its first argument, and attempts to return a string representation in the specified radix (base). For radixes above 10, the letters of the alphabet indicate numerals greater than 9. For example, for hexadecimal numbers (base 16), A through F are used.

If toString is given a radix not between 2 and 36, an exception is thrown.

#### Examples

	var count = 10;
	print(count.toString());   // displays "10"
	print((17).toString());    // displays "17"
	
	var x = 7;
	print(x.toString(2));      // displays "111"

#### See Also
* [[Number.toExponential `toExponential()`]]
* [[Number.ToLocaleString `ToLocaleString()`]]
* [[Number.toPrecision `toPrecision()`]]
* [[Number.toFixed `toFixed()`]]
* [[Number.toSource `toSource()`]]
* [[Number.valueOf valueOf()`]]

**/

/**
Number.valueOf() -> Number

The `valueOf` method of `Number` returns the primitive value of a `Number` object as a number data type.

This method is usually called internally by Javascript and not explicitly in code.

#### Example

	var x = new Number();
	print(x.valueOf());     // prints "0"


**/

