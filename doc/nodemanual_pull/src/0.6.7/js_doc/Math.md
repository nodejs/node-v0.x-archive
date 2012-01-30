
/** section: Javascript_Reference
class Math

A built-in object that has properties and methods for mathematical constants and functions.

Unlike the other global objects, `Math` is not a constructor. All properties and methods of `Math` are static. You refer to the constant pi as `Math.PI` and you call the sine function as `Math.sin(x)`, where x is the method's argument. Constants are defined with the full precision of real numbers in Javascript.
**/

/**
Math.LN2 = "0.693"

The natural logarithm of 2.

#### Example: Using `Math.LN2`

The following function returns the natural log of 2:

	function getNatLog2() {
		return Math.LN2
	}

**/

/**
Math.E = "2.718"

The base of natural logarithms, e.

 #### Example: Using `Math.E`

 The following function returns e:
    function getNapier() {
       return Math.E
    }

**/

/**
Math.LN10 = "2.302"

The natural logarithm of 10.

 #### Example: Using `Math.LN10`

 The following function returns the natural log of 10:
    function getNatLog10() {
       return Math.LN10;
    }

**/

/**
Math.LOG2E = "1.442"

The base 2 logarithm of `E`.

 #### Example: Using `Math.LOG2E`

 The following function returns the base 2 logarithm of `E`:

	function getLog2e() {
		return Math.LOG2E;
	}

**/

 
/**
Math.LOG10E = "0.434"

The base 10 logarithm of `E`.

#### Example: Using `Math.LOG10E`

The following function returns the base 10 logarithm of `E`:

	function getLog10e() {
		return Math.LOG10E;
	}

**/

/**
Math.PI = "3.14159"

The ratio of the circumference of a circle to its diameter.

#### Example: Using `Math.PI`

The following function returns the value of pi:

	function getPi() {
		return Math.PI;
	}

**/

/**
Math.SQRT1_2 = "0.707"

The square root of 1/2; equivalently, 1 over the square root of 2.

#### Example: Using `Math.SQRT1_2`

The following function returns 1 over the square root of 2:

	function getRoot1_2() {
		return Math.SQRT1_2;
	}

**/

/**
Math.SQRT2 = "1.414"

The square root of 2.

#### Example: Using `Math.SQRT2`

The following function returnsthe square root of 2:

	function getRoot2() {
		return Math.SQRT2;
	}

**/

 /**
Math.abs(x) -> Number
- x (Number): A positive or negative integer

Returns the absolute value of a number.

#### Example: `Math.abs` behavior

Passing a non-numeric string or undefined/empty variable returns NaN. Passing null returns 0.

	Math.abs('-1');     // 1
	Math.abs(-2);       // 2
	Math.abs(null);     // 0
	Math.abs("string"); // NaN
	Math.abs();

**/

 /**
Math.acos(x) -> Number
- x (Number): A number

This method returns a numeric value between 0 and pi radians for x between -1 and 1\. If the value of `number` is outside this range, it returns `NaN`.

#### Example: Using `Math.acos`

The following function returns the arccosine of the variable `x`:

    function getAcos(x) {
       return Math.acos(x)
    }

If you pass -1 to `getAcos`, it returns 3.141592653589793; if you pass 2, it returns `NaN` because 2 is out of range.

#### See Also

* [[Math.asin `asin()`]]
* [[Math.atan `atan()`]]
* [[Math.atan2 `atan2()`]]
* [[Math.cos `cos()`]]
* [[Math.sin `sin()`]]
* [[Math.tan `tan()`]]

**/

/**
	Math.asin(x) -> Number
- x (Number): A number
	
The `asin` method returns a numeric value between -pi/2 and pi/2 radians for x between -1 and 1. If the value of `number` is outside this range, it returns `NaN`.


#### Example: Using `Math.asin`

The following function returns the arcsine of the variable `x`:

    function getAsin(x) {
       return Math.asin(x)
    }

If you pass `getAsin` the value 1, it returns 1.570796326794897 (pi/2); if you pass it the value 2, it returns `NaN` because 2 is out of range.

#### See Also

* [[Math.acos `acos()`]] 
* [[Math.atan `atan()`]] 
* [[Math.atan2 `atan2()`]] 
* [[Math.cos `cos()`]] 
* [[Math.sin `sin()`]] 
* [[Math.tan `tan()`]] 

**/

/**
	Math.atan(x) -> Number
- x (Number): A number
	
The `atan` method returns a numeric value between -pi/2 and pi/2 radians.

#### Example: Using `Math.atan`

The following function returns the arctangent of the variable `x`:

    function getAtan(x) {
       return Math.atan(x)
    }

If you pass `getAtan` the value 1, it returns 0.7853981633974483; if you pass it the value .5, it returns 0.4636476090008061.

#### See Also
* [[Math.acos `acos()`]] 
* [[Math.asin `asin()`]] 
* [[Math.atan2 `atan2()`]] 
* [[Math.cos `cos()`]] 
* [[Math.sin `sin()`]] 
* [[Math.tan `tan()`]] 

**/

/**
Math.atan2(x, y) -> Number
- x (Number): A number
- y (Number): A number	

The `atan2()` method returns a numeric value between -pi and pi representing the angle theta of an (x,y) point. This is the counterclockwise angle, measured in radians, between the positive X axis, and the point (`x,y`). Note that the arguments to this function pass the y-coordinate first and the x-coordinate second.

`atan2` is passed separate `x` and `y` arguments, and `atan` is passed the ratio of those two arguments.

#### Example: Using `Math.atan2`

The following function returns the angle of the polar coordinate:

    function getAtan2(y,x) {
       return Math.atan2(y,x)
    }

If you pass `getAtan2` the values (90,15), it returns 1.4056476493802699; if you pass it the values (15,90), it returns 0.16514867741462683. In addition:

* `Math.atan2( ±0, -0 )` returns `±PI`.<br/>
* `Math.atan2( ±0, +0 )` returns `±0`.<br/>
* `Math.atan2( ±0, -x )` returns `±PI` for x &lt; 0.<br/>
* `Math.atan2( ±0, x )` returns `±0` for x &gt; 0.<br/>
* `Math.atan2( y, ±0 )` returns `-PI/2` for y &gt; 0.<br/>
* `Math.atan2( ±y, -Infinity )` returns `±PI` for finite y &gt; 0.<br/>
* `Math.atan2( ±y, +Infinity )` returns `±0` for finite y &gt; 0.<br/>
* `Math.atan2( ±Infinity, +x )` returns `±PI/2` for finite x.<br/>
* `Math.atan2( ±Infinity, -Infinity )` returns `±3*PI/4`.<br/>
* `Math.atan2( ±Infinity, +Infinity )` returns `±PI/4`.

#### See Also
* [[Math.acos `acos()`]] 
* [[Math.asin `asin()`]] 
* [[Math.atan `atan()`]] 
* [[Math.cos `cos()`]] 
* [[Math.sin `sin()`]] 
* [[Math.tan `tan()`]] 

**/

/**
	Math.ceil(x) -> Number
- x (Number): A number
	
Returns the smallest integer greater than or equal to a number.
	

#### Example: Using `Math.ceil`

The following function returns the ceil value of the variable `x`:

    function getCeil(x) {
       return Math.ceil(x)
    }

If you pass 45.95 to `getCeil`, it returns 46; if you pass -45.95, it returns -45.

#### See Also
* [[Math.floor `floor()`]]
* [[Math.round `round()`]]
**/

/**
	Math.cos(x) -> Number
- x (Number): A number
	
The `cos` method returns a numeric value between -1 and 1\. which represents the cosine of the angle.


#### Example: Using `Math.cos`

The following function returns the cosine of the variable `x`:

    function getCos(x) {
       return Math.cos(x)
    }

If `x` equals 2*`Math.PI`, `getCos` returns 1; if `x` equals `Math.PI`, the `getCos` method returns -1. 

#### See Also
* [[Math.acos `acos()`]] 
* [[Math.asin `asin()`]] 
* [[Math.atan `atan()`]] 
* [[Math.atan2 `atan2()`]] 
* [[Math.sin `sin()`]] 
* [[Math.tan `tan()`]] 

**/

/**	
	Math.floor(x) -> Number
- x (Number): A number

Returns the largest integer less than or equal to a number.

#### Example: Using `Math.floor`

The following function returns the floor value of the variable `x`:

    function getFloor(x) {
       return Math.floor(x)
    }

If you pass 45.95 to `getFloor`, it returns 45; if you pass -45.95, it returns -46.

#### See Also
* [[Math.ceil `ceil()`]]
* [[Math.round `round()`]]

**/

/**	
	Math.log(x) -> Number
- x (Number): A number

Returns the natural logarithm (base `E`) of a number. If the value of `x` is negative, the return value is always `NaN`.



Because `log` is a static method of `Math`, you always use it as `Math.log()`, rather than as a method of a `Math` object you created. 

#### Example: Using `Math.log`

The following function returns the natural log of the variable `x`:

    function getLog(x) {
       return Math.log(x)
    }

If you pass `getLog` the value 10, it returns 2.302585092994046; if you pass it the value 0, it returns `-Infinity`; if you pass it the value -1, it returns `NaN` because -1 is out of range.

#### See Also
* [[Math.exp `exp()`]] 
* [[Math.pow `pow()`]] 

**/

/**
	Math.exp(x) -> Void
- x (Number): A number

Returns `E^x`, where `x` is the argument, and `E` is Euler's constant, the base of the natural logarithms.

#### Example: Using `Math.exp`

The following function returns the exponential value of the variable `x`:

    function getExp(x) {
       return Math.exp(x)
    }

If you pass `getExp` the value 1, it returns 2.718281828459045.

#### See Also
* [[Math.E `E`]] 
* [[Math.log `log()`]] 
* [[Math.pow `pow()`]] 

**/

/**
Math.max([value1][, value2...]) -> Number
- valueN (Number): A sequence of numbers  

Returns the largest of zero or more numbers.

If no arguments are given, the results is [[Infinity `-Infinity`]]

If at least one of arguments can't be converted to a number, the result is [[NaN `NaN`]].

#### Example: Using `Math.max`

`Math.max(10, 20)` returns 20. `Math.max(-10, -20)` returns -10. `Math.max(-10, 20)` returns 20.


#### Example: Using `Math.max` with an array

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Math/math.max.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

This function uses [[Function.apply `Function.apply()`]] to find the maximum element in a numeric array. `getMaxOfArray([1,2,3])` is equivalent to `Math.max(1, 2, 3)`, but you can use `getMaxOfArray` on programmatically constructed arrays of any size.

**/

/**
	Math.pow(base,exponent) -> Number
- base (Number): The base number.
- exponents (Number): The exponent to which to raise base.
	
Returns `base` to the `exponent` power, that is, `base^exponent`.
	

#### Example: Using `Math.pow`

	Math.pow(7, 2); // returns 49 == 7 to the power of 2


#### See Also
* [[Math.exp `exp()`]] 
* [[Math.log `log()`]] 

**/

/**
Math.min([value1][,value2...]) -> Number
- valueN (Number): A sequence of numbers. 

Returns the smallest of zero or more numbers.

If no arguments are given, the result is [[Infinity `Infinity`]].

If at least one of arguments can't be converted to a number, the result is [[NaN `NaN`]].

#### Example: Using `Math.min`

This finds the min of x and y and assigns it to z:

	var x = "10", y = -20;
	var z = Math.min(x, y); // z == -20

#### Example: Clipping a value with `Math.min`

`Math.min` is often used to clip a value so that it is always less than or equal to a boundary. For instance, this:

	var x = f(foo);
	if (x > boundary)
		x = boundary;

may be written as this:

	var x = Math.min(f(foo), boundary);
   
**/

/**
Math.random() -> Number
 
Returns a floating-point, pseudo-random number in the range `[0\. 1)` that is, from 0 (inclusive) up to but not including 1 (exclusive), which you can then scale to your desired range.

The random number generator is seeded from the current time, as in Java.

 
#### Example: Using `Math.random`

Note that as numbers in Javascript are IEEE 754 floating point numbers with round-to-nearest-even behavior, these ranges, excluding the one for `Math.random()` itself, aren't exact, and depending on the bounds it's possible in extremely rare cases (on the order of 1 in 2<sup>62</sup>) to calculate the usually-excluded upper bound.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Math/math.random.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

**/

/**
	Math.sin(x) -> Number
- x (Number): A number.

The `sin` method returns a numeric value between -1 and 1, which represents the sine of the argument.


#### Example: Using `Math.sin`

The following function returns the sine of the variable `x`:

    function getSine(x) {
       return Math.sin(x)
    }

If you pass `getSine` the value `Math.PI/2`, it returns 1.


#### See Also
* [[Math.acos `acos()`]] 
* [[Math.asin `asin()`]] 
* [[Math.atan `atan()`]] 
* [[Math.atan2 `atan2()`]] 
* [[Math.cos `cos()`]] 
* [[Math.tan `tan()`]] 

**/

/**
Math.round(x) -> Number
- x (Number): A number.

Returns the value of a number rounded to the nearest integer.

If the fractional portion of `number` is .5 or greater, the argument is rounded to the next higher integer. If the fractional portion of `number` is less than .5, the argument is rounded to the next lower integer.


#### Example: Using `Math.round`

    //Returns the value 20
    var x = Math.round(20.49)
    
    //Returns the value 21
    x = Math.round(20.5)
    
    //Returns the value -20
    x = Math.round(-20.5)
    
    //Returns the value -21
    x = Math.round(-20.51)

#### See Also
* [[Math.ceil `Math.ceil()`]]

**/

/**
	Math.sqrt(x) -> Number
- x (Number): A number.

Returns the square root of a number. If the value of `number` is negative, `sqrt` returns `NaN`.

#### Example: Using `Math.sqrt`

The following function returns the square root of the variable `x`:

    function getRoot(x) {
       return Math.sqrt(x)
    }

If you pass `getRoot` the value 9, it returns 3; if you pass it the value 2, it returns 1.414213562373095.


**/

/**
	Math.tan(x) -> Number
- x (Number): A number representing an angle in radians.
	
The `tan` method returns a numeric value that represents the tangent of the angle.

#### Example: Using `Math.tan`

The following function returns the tangent of the variable `x`:

    function getTan(x) {
       return Math.tan(x)
    }

Because the `Math.tan()` function accepts radians, but it is often easier to work with degrees, the following function accepts a value in degrees, converts it to radians and returns the tangent.

    function getTanDeg(deg) {
       var rad = deg * Math.PI/180;
       return Math.tan(rad)
    }

#### See Also
* [[Math.acos `acos()`]] 
* [[Math.asin `asin()`]] 
* [[Math.atan `atan()`]] 
* [[Math.atan2 `atan2()`]] 
* [[Math.cos `cos()`]] 
* [[Math.sin `sin()`]] 

**/

