# Using ECMA5 in Node.js

When developing for a browser, there are many built-in Javascript functions that we can't use because certain browsers don't implement them.  As a result, most developers never use them.  In Node.js, however, we can assume that everyone has the same Javascript implementation (since it's always running on [the V8 engine](http://code.google.com/p/v8/)). As such, we can use these wonderful functions and not implement them over and over in our own libraries.

The following is a list of some interesting API functions that aren't considered safe to use in a web setting, but are built into Node's V8 engine. Note that V8 implements all of the ECMA 3rd Edition, and some parts of the new [ECMA 5th Edition](http://www.ecma-international.org/publications/standards/Ecma-262.htm). You can see a list of all the supported features from [this gist](https://github.com/joyent/node/wiki/ECMA-5-Mozilla-Features-Implemented-in-V8).

#### Syntax Extensions

 You can use a new getter and setter syntax, similar to many other languages.

Here's an example:

    var speak = {
    _name: 'Stranger',
        get name() { // getter
            return this._name + '!';
        },
        set name(n) { // setter
            this._name = n.trim();
        }
    };

    console.log("Hello, " + speak.name);
    speak.name = ' John ';
    console.log("Hello, " + speak.name);

#### Array

`Array.isArray(array)`: Returns `true` if the passed argument is an array.

#### Array.prototype

`indexOf(value)`: Returns the first (least) index of an element within the array equal to the specified value, or -1 if none is found.
`lastIndexOf(value)`: Returns the last (greatest) index of an element within the array equal to the specified value, or -1 if none is found.
 - `filter(callback)`: Creates a new array with all of the elements of this array for which the provided filtering function returns `true`. For example:

<pre>
    var myArray = ([1, 2, 3, 4]).filter(function(x) {
                        return x > 2;
                    });
    // myArray is now [3, 4]
</pre>

`forEach(callback)`: Calls a function for each element in the array.
`every(callback)`: Returns `true` if every element in this array satisfies the provided testing function. For example:

<pre>
    ([-1, 0, 1, 2, 3]).every(function(x) {
      return x > 0;
    });
    // false, since -1 and 0 are not greater than 0.
</pre>

`some(callback)`: Returns `true` if at least one element in this array satisfies the provided testing function.

`map(callback)`: Creates a new array with the results of calling a provided function on every element in this array. For example:

<pre>
    var myArray = ([1, 2, 3]).map(function(x) {
        return x * 2;
    });
    // myArray is now [2, 4, 6]
</pre>

`reduce(callback[, initialValue])`: Apply a function simultaneously against two values of the array (from left-to-right), reducing it to a single value. For example:

<pre>
    var myString = (['a', 'b', 'c', 'd']).reduce(function(x, y) {
      return x + y;
    });
    // myString is now 'abcd'
</pre>

If the `initialValue` parameter is provided, it is the very first parameter called by the function. For example:

<pre>
    var myString = (['a', 'b', 'c', 'd']).reduce(function(x, y) {
      return x + y;
    }, '*');
    // myString is now '*abcd'
</pre>

`reduceRight(callback[, initialValue])`: Apply a function simultaneously against two values of the array (from right-to-left), reducing it to a single value.

#### Date

`Date.now()`: Returns the numeric value corresponding to the current date. For example: `1320952608012`.

#### Date.prototype

`Date.toISOString()`: Returns the value of the current date in the [ISO standard](http://en.wikipedia.org/wiki/ISO_8601#Times). For example: `2011-11-10T19:16:48.011Z`.

#### Object

`Object.create(proto, props)`: Creates a new object whose prototype is the passed in parent object and whose properties are those specified by `props`. For example:

<pre>
    var obj = Object.create(x: 10, y: 20);
    // obj.x = 10; obj.y = 20
</pre>

`Object.keys(obj)`: Returns a list of the ownProperties of an object that are enumerable. For example: 

<pre>
     function o() {
      this.a = 1;
    }
    console.log(Object.keys(new o())); // [ 'a' ]
    function p() {
      this.b = 2;
    }

    var obj = Object.create({a: 10, b: 20}, {
      x: {
        value: 30,
        enumerable: true
      },
      y: {
        value: 40,
        enumerable: false
      }
    });
    console.log(Object.keys(obj)); // [ 'x' ]
</pre>

`Object.getOwnPropertyNames(obj)`: Returns a list of the ownProperties of an object including ones that are not enumerable.

`Object.getPrototypeOf(obj)`: Returns the prototype of an object. For example: 

<pre>
     var obj = Object.create({a: 10, b: 20}, {
      x: {
        value: 30,
        enumerable: true
      },
      y: {
        value: 40,
        enumerable: false
      }
    });
    console.log(Object.getPrototypeOf(obj)); // { a: 10, b: 20 }
</pre>

* `Object.getOwnPropertyDescriptor(obj, property)`: Returns an object with keys describing the description of a property (value, writable, enumerable, configurable). For example:

<pre>
    var obj = Object.create({a: 10, b: 20}, {
      x: {
        value: 30,
        enumerable: true
      },
      y: {
        value: 40,
        enumerable: false
      }
    });
    console.log(Object.getOwnPropertyDescriptor(obj, 'x'));
    // { value: 30,
    //   writable: false,
    //   enumerable: true,
    //   configurable: false }
</pre>

`Object.defineProperty(obj, prop, desc)`: Defines a property on an object with the given descriptor. For example:

<pre>
    var obj = {};
    Object.defineProperty(obj, 'num', {
      value: 10,
      writable: false,
      enumerable: false,
      configurable: false
    });
    log(obj.num); // 10
    for (var i in obj) {
      log(i); // not display
    }
    obj.num = 20;
    log(obj.num); // still 10
</pre>

`Object.defineProperties(obj, props)`: Adds own properties, and/or updates the attributes of existing own properties of an object. For example:
 

<pre>
    var obj = {};
    Object.defineProperties(obj, {
      num: {
        value: 4,
        writable: false,
        enumerable: false,
        configurable: false
      },
      root: {
        get: function() {
          return Math.pow(this.num, 0.5);
        }
      }
    });
    log(obj.num); // 4
    log(obj.root); // 2
</pre>
 
`Object.preventExtensions(obj)`: Prevents any new properties from being added to the given `obj` object.
`Object.isExtensible(obj)`: Returns `true` if properties can still be added, `false` otherwise (in other words, `false` if Object.preventExtensions() was called).
`Object.seal(obj)`: Prevents code from adding or deleting properties, or changing the descriptors of any property on an object. However, property values can still change.
`Object.isSealed(obj)`: Returns `true` if `Object.seal` was called on this object.
`Object.freeze(obj)`: This is the same as `Object.seal()`, except property values can't be changed.
`Object.isFrozen(obj)`: Returns `true` if `Object.freeze()` was called on this object.

#### Object.prototype

`__defineGetter__(name, callback)`: Associates a function with a property that, when accessed, executes that function and returns its return value. This functions is a Mozilla extension and is not in ECMAScript 5.
`__lookupGetter__(name)`: Returns the function associated with the specified property by the __defineGetter__ method. This functions is a Mozilla extension and is not in ECMAScript 5.
`__defineSetter__(name, callback)`: Associates a function with a property that, when set, executes that function which modifies the property. This functions is a Mozilla extension and is not in ECMAScript 5.
`__lookupSetter__(name)`: Returns the function associated with the specified property by the __defineSetter__ method. This functions is a Mozilla extension and is not in ECMAScript 5.
`isPrototypeOf(obj)` - (Available in ECMAScript 3 and 5) Returns true if `this` is a prototype of the passed in object. For example:

<pre>
    var proto = {a: 10, b: 20};
    var obj = Object.create(proto);
    console.log(proto.isPrototypeOf(obj)); // true
</pre>

#### Function.prototype

`bind(thisArg[, arg1[, arg2, arg3...]])` - Sets the value of `this` inside the function to always be the value of `thisArg` when the function is called. Optionally, function arguments can also be specified (arg1, arg2, e.t.c.) that will automatically be prepended to the argument list whenever this function is called. For example:

<pre>
    var f = function() {return this.a + this.b };
    console.log(f()); // NaN
    var g = f.bind({ a: 10, b: 20 });
    console.log(g()); // 30

    var f = function(c) {
        return this.a + this.b + c;
    };
    log(f()); // NaN
    var g = f.bind({ a: 10, b: 20 }, 30);
    console.log(g()); // 60

    var f = function(c, d) {
        return this.a + this.b + c + d;
    };
    log(f()); // NaN
    var g = f.bind({ a: 10, b: 20 }, 30);
    console.log(g(40)); // 100
</pre>

#### String.prototype

`trim()`: Trims all whitespace from both ends of the string
`trimRight()`: Trims all whitespace from the right side of the string
`trimLeft()`: Trims all whitespace from the left side of the string

#### Default Property Descriptors

`value`: undefined
`get`: undefined
`set`: undefined
`writable`: `false`
`enumerable`: `false`
`configurable`: `false`

#### Features Not Implemented

`Object.__noSuchMethod__`: (This is a Mozilla extension, not ECMAScript 5)
`"use strict";`:  This syntax extension is a [v8 issue](http://code.google.com/p/v8/issues/detail?id=919)