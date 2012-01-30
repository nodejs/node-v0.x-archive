
/** read-only
NaN -> Object

NaN is a property of the global object, i.e. it is a variable in global scope.

The initial value of NaN is Not-A-Number&mdash;the same as the value of `Number.NaN`. In modern browsers, NaN is a non-configurable, non-writable property. Even when this is not the case, avoid overriding it.

It is rather rare to use NaN in a program. It is the returned value when [[Math `Math`]] functions fail (like `Math.sqrt(-1)`) or when a function trying to parse a number fails (like `parseInt("blabla")`).

#### Testing against NaN

Equality operator (`==` and `===`) can't be used to test a value against NaN. Use `isNaN()` instead:

	NaN === NaN;        // false
	Number.NaN === NaN; // false
	isNaN(NaN);         // true
	isNaN(Number.NaN);  // true


**/

