/** section: Errors
class RangeError

A `RangeError` is thrown when trying to pass a number as an argument to a function that does not allow a range that includes that number. This can be encountered when to create an array of an illegal length with the [[Array `Array`]] constructor, or when passing bad values to the numeric methods [[Number.toExponential `Number.toExponential()`]], [[Number.toFixed `Number.toFixed()`]], or [[Number.toPrecision `Number.toPrecision()`]].

**/

/**
new RangeError([message][, fileName][, lineNumber])
- message (String): Human-readable description of the error
- fileName (String): The name of the file containing the code that caused the exception (Non-standard)
- lineNumber (Number): The line number of the code that caused the exception (Non-standard)

Creates an new RangeError object.

**/