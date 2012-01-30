

/** section: Javascript_Reference
class Object

All objects in Javascript are descended from `Object`; all objects inherit methods and properties from `Object.prototype`, although they may be overridden. For example, other constructors' prototypes override the constructor property and provide their own `toString()` methods. Changes to the Object prototype object are propagated to all objects unless the properties and methods subject to those changes are overridden further along the prototype chain.
	            

**/

/**
new Object([value])
- value (Object): Any value

Creates an object wrapper.

The Object constructor creates an object wrapper for the given value. If the value is `null` or `undefined`, it will create and return an empty object, otherwise, it will return an object of a type that corresponds to the given value.

When called in a non-constructor context, Object behaves identically.

#### Example: Using `Object` given `undefined` and `null` types

The following examples store an empty `Object` object in `o`:
    
	var o = new Object();     
	var o = new Object(undefined);
	var o = new Object(null);
            
   
#### Example: Using `Object` to create `Boolean` objects

The following examples store [[Boolean `Boolean`]] objects in `o`:
    
	// equivalent to o = new Boolean(true);
    var o = new Object(true);
  
	// equivalent to o = new Boolean(false);
    var o = new Object(Boolean());

**/

/** deprecated
Object.proto -> Object
 
Refers to the prototype of the object, which may be an object or `null` (which usually means the object is `Object.prototype`, which has no prototype).  It is sometimes used to implement prototype-inheritance based property lookup.

This property is deprecated and should not be used in new code: use [[Object.getPrototypeOf `getPrototypeOf()`]] instead.


**/

/**	
Object.toLocaleString() -> String

Returns a string representing the object. This method is meant to be overriden by derived objects for locale-specific purposes.

This function is provided to give objects a generic `toLocaleString()` method, even though not all may use it. Currently, only [[Array `Array`]], [[Number `Number`]], and [[Date `Date]]` override `toLocaleString()`.

**/

/**
Object.toSource() -> String

Returns a string representing the source code of the object.

The `toSource` method returns the following values:

* For the built-in `Object` object, `toSource` returns the following string indicating that the source code is not available:


	function Object() {
		[native code]
		}


* For instances of `Object`, `toSource` returns a string representing the source code.


You can call `toSource` while debugging to examine the contents of an object.

It is safe for objects to override the `toSource` method. For example:

	function Person(name) {

	this.name = name;

	}

	Person.prototype.toSource = function Person_toSource() {

		return "new Person(" + uneval(this.name) + ")";

	};

	alert(new Person("Joe").toSource());    // ---> new Person("Joe")


<div id = "section_5"><span id = "Built-in_toString_methods"></span><span id = "Built-in_toSource_methods"></span>

#### Example: Using `toSource`

	The following code defines the `Dog` object type and creates `theDog`, an object of type `Dog`:

	function Dog(name, breed, color, sex) {
		this.name=name;
		this.breed=breed;
		this.color=color;
		this.sex=sex;
	}
    
	theDog = new Dog("Gabby", "Lab", "chocolate", "girl");


Calling the `toSource` method of `theDog` displays the Javascript source that defines the object:

    theDog.toSource();


returns

	({name:"Gabby", breed:"Lab", color:"chocolate", sex:"girl"})

**/

/**
Object.toString() -> String
   
 Returns a string representing the object.


Every object has a `toString()` method that is automatically called when the object is to be represented as a text value or when an object is referred to in a manner in which a string is expected. By default, the `toString()` method is inherited by every object descended from `Object`. If this method is not overridden in a custom object, `toString()` returns "[object _type_]", where _type_ is the object type. The following code illustrates this:

	var o = new Object();
	o.toString();           // returns [object Object]


<Note>Starting in Javascript 1.8.5 `toString()` called on `null` returns `null`, and `undefined` returns `undefined`, as defined in the 5th Edition of ECMAScript and a subsequent Errata. See [Using toString to detect object type](https://developer.mozilla.org/en/Javascript/Reference/Global_Objects/Object/toString#Using_toString_to_detect_object_type).</Note>

#### Example: Overriding the default `toString` method

 You can create a function to be called in place of the default `toString()` method. The `toString()` method takes no arguments and should return a string. The `toString()` method you create can be any value you want, but it will be most useful if it carries information about the object.

The following code defines the `Dog` object type and creates `theDog`, an object of type `Dog`:
 
	function Dog(name,breed,color,sex) {
		this.name=name;
		this.breed=breed;
		this.color=color;
		this.sex=sex;
	}
 
	theDog = new Dog("Gabby","Lab","chocolate","female");
         
If you call the `toString()` method on this custom object, it returns the default value inherited from `Object`:

	theDog.toString(); //returns [object Object]

The following code creates and assigns `dogToString()` to override the default `toString()` method. This function generates a string containing the name, breed, color, and sex of the object, in the form "`property = value;`".
 
	Dog.prototype.toString = function dogToString() {
		var ret = "Dog " + this.name + " is a " + this.sex + " " + this.color + " " + this.breed;
		return ret;
	}
         
With the preceding code in place, any time `theDog` is used in a string context, Javascript automatically calls the `dogToString()` function, which returns the following string:

	Dog Gabby is a female chocolate Lab
 
#### Example: Using toString() to detect object class

`toString()` can be used with every object and allows you to get its class. To use the `Object.prototype.toString()` with every object, you need to call [[Function.call `Function.call()`]] or [[Function.apply `Function.apply()`]] on it, passing the object you want to inspect as the first parameter called `thisArg`.
 
	var toString = Object.prototype.toString;
 
	toString.call(new Date); // [object Date]
	toString.call(new String); // [object String]
	toString.call(Math); // [object Math]
 
	//Since Javascript 1.8.5
	toString.call(undefined); // [object Undefined]
	toString.call(null); // [object Null]
 
#### Example: Overriding the default `toString` method

You can create a function to be called in place of the default `toString()` method. The `toString()` method takes no arguments and should return a string. The `toString()` method you create can be any value you want, but it will be most useful if it carries information about the object.

The following code defines the `Dog` object type and creates `theDog`, an object of type `Dog`:
 
	function Dog(name,breed,color,sex) {
		this.name=name;
		this.breed=breed;
		this.color=color;
		this.sex=sex;
	}
 
	theDog = new Dog("Gabby","Lab","chocolate","female");
         
If you call the `toString()` method on this custom object, it returns the default value inherited from `Object`:

	theDog.toString(); //returns [object Object]
 
The following code creates and assigns `dogToString()` to override the default `toString()` method. This function generates a string containing the name, breed, color, and sex of the object, in the form "`property = value;`".
 
	Dog.prototype.toString = function dogToString() {
		var ret = "Dog " + this.name + " is a " + this.sex + " " + this.color + " " + this.breed;
		return ret;
	}
         
With the preceding code in place, any time `theDog` is used in a string context, Javascript automatically calls the `dogToString()` function, which returns the following string:

	Dog Gabby is a female chocolate Lab
 

#### See Also
* [[Object.toSource `toSource()`]]]
* [[Object.valueOf `valueOf()`]]

**/

/**
Object.valueOf() -> Object

Returns the primitive value of the specified object

Javascript calls the `valueOf` method to convert an object to a primitive value. You rarely need to invoke the `valueOf` method yourself; Javascript automatically invokes it when encountering an object where a primitive value is expected.

By default, the `valueOf` method is inherited by every object descended from `Object`. Every built-in core object overrides this method to return an appropriate value. If an object has no primitive value, `valueOf` returns the object itself, which is displayed as:

	[object Object]

You can use `valueOf` within your own code to convert a built-in object into a primitive value. When you create a custom object, you can override `Object.valueOf` to call a custom method instead of the default `Object` method.

#### Note

Objects in string contexts convert via the [[Object.toString `toString()`]] method, which is different from [[String `String`]] objects converting to string primitives using `valueOf`. All objects have a string conversion, if only "`[object _type_]`". But many objects don't convert to number, boolean, or function.

#### Example: Overriding `valueOf` for custom objects 

You can create a function to be called in place of the default `valueOf` method. Your function must take no arguments.

Suppose you have an object type `myNumberType` and you want to create a `valueOf` method for it. The following code assigns a user-defined function to the object's `valueOf` method:

	myNumberType.prototype.valueOf = new Function(functionText);

With the preceding code in place, any time an object of type `myNumberType` is used in a context where it is to be represented as a primitive value, Javascript automatically calls the function defined in the preceding code.

An object's `valueOf` method is usually invoked by Javascript, but you can invoke it yourself as follows:

	myNumber.valueOf()


#### See Also

* [[Object.toString `toString()`]]

**/

/** deprecated
Object.__defineGetter__(sprop, fun)
- sprop (String): Contains the name of the property to bind to the given function
- fun (Function): A Function to be bound to a lookup of the specified property

Binds an object's property to a function to be called when that property is looked up.

    
The `__defineGetter__` allows a [getter](https://developer.mozilla.org/en/Javascript/Reference/Operators/Special/get "en/Core_Javascript_1.5_Reference/Operators/Special_Operators/get_Operator") to be defined on a pre-existing object.


#### See Also

* [`get`](https://developer.mozilla.org/en/Javascript/Reference/Operators/Special/get)
* `Object.__lookupGetter__`
* [JS Guide:Defining Getters and Setters](https://developer.mozilla.org/en/Javascript/Guide/Obsolete_Pages/Creating_New_Objects/Defining_Getters_and_Setters)

**/

/**
Object.__defineSetter__(sprop, fun)
- sprop (String): Contains the name of the property to bind to the given function
- fun (Function): A Function to be bound to a lookup of the specified property

Binds an object's property to a function to be called when an attempt is made to set that property.


The `__defineSetter__` method allows a [setter](https://developer.mozilla.org/en/Javascript/Reference/Operators/Special/set) to be defined on a pre-existing object.

#### See Also

* [`set`](https://developer.mozilla.org/en/Javascript/Reference/Operators/Special/set)
* `Object.__lookupSetter__`
* [JS Guide:Defining Getters and Setters](https://developer.mozilla.org/en/Javascript/Guide/Obsolete_Pages/Creating_New_Objects/Defining_Getters_and_Setters)

**/

/**
Object.hasOwnProperty() -> Boolean
- prop (String): The name of the property to test.
  
Returns a boolean indicating whether the object has the specified property.

Every object descended from `Object` inherits the `hasOwnProperty` method. This method can be used to determine whether an object has the specified property as a direct property of that object; unlike the [`in`](https://developer.mozilla.org/en/Javascript/Reference/Operators/Special/in "en/Core_Javascript_1.5_Reference/Operators/Special_Operators/in_Operator") operator, this method does not check down the object's prototype chain.

#### Example: Using `hasOwnProperty()` to test for a property's existence

The following example determines whether the `o` object contains a property named `prop`:
    
	o = new Object();
	o.prop = 'exists';
    
    function changeO() {
      o.newprop = o.prop;
      delete o.prop;
    }
    
    o.hasOwnProperty('prop');   //returns true
    changeO();
    o.hasOwnProperty('prop');   //returns false
            
#### Example: Direct versus inherited properties

The following example differentiates between direct properties and properties inherited through the prototype chain:
    
	o = new Object();
    o.prop = 'exists';
    o.hasOwnProperty('prop');             // returns true
    o.hasOwnProperty('toString');         // returns false
    o.hasOwnProperty('hasOwnProperty');   // returns false
            
#### Example: Iterating over the properties of an object

The following example shows how to iterate over the properties of an object without executing on inherit properties.
    
	var buz = {
        fog: 'stack'
    };
    
    for (var name in buz) {
        if (buz.hasOwnProperty(name)) {
            alert("this is fog (" + name + ") for sure. Value: " + buz[name]);
        }
        else {
            alert(name); // toString or something else
        }
    }
      

**/

/**
Object.isPrototypeOf(object) -> Boolean
- object (Object): The object whose prototype chain will be searched

Tests for an object in another object's prototype chain.


`isPrototypeOf` allows you to check whether or not an object exists within another object's prototype chain.

For example, consider the following prototype chain:

	function Fee() {
		// . . .
	}

	function Fi() {
 	// . . .
	}

	Fi.prototype = new Fee();

	function Fo() {
		// . . .
	}

	Fo.prototype = new Fi();

	function Fum() {
		// . . .
	}

	Fum.prototype = new Fo();


Later on down the road, if you instantiate `Fum` and need to check if `Fi`'s prototype exists within the `Fum` prototype chain, you could do this:

	var fum = new Fum();

	. . .

	if (Fi.prototype.isPrototypeOf(fum)) {

		// do something safe

	}

This, along with the `instanceof` operator particularly comes in handy if you have code that can only function when dealing with objects descended from a specific prototype chain, e.g., to guarantee that certain methods or properties will be present on that object.

#### See Also

* [`instanceof`](https://developer.mozilla.org/en/Javascript/Reference/Operators/instanceof)

**/

/** deprecated
Object.__lookupGetter__(sprop) -> Function
- sprop (String): Contains the name of the property whose getter should be returned

Return the function bound as a getter to the specified property.


If a getter has been defined for an object's property, it's not possible to reference the getter function through that property, because that property refers to the return value of that function. `__lookupGetter__` can be used to obtain a reference to the getter function.

#### See Also

* [`get`](https://developer.mozilla.org/en/Javascript/Reference/Operators/Special/get)
* `Object.__defineGetter__`
* `Object.__defineSetter__`
* [JS Guide:Defining Getters and Setters](https://developer.mozilla.org/en/Javascript/Guide/Obsolete_Pages/Creating_New_Objects/Defining_Getters_and_Setters)


**/

/**
Object.__lookupSetter__(sprop) -> Function
- sprop (String): Contains the name of the property whose getter should be returned

Return the function bound as a setter to the specified property.

If a setter has been defined for an object's property, it's not possible to reference the setter function through that property, because that property refers to the return value of that function. `__lookupSetter__` can be used to obtain a reference to the setter function.

#### See Also

* [`set`](https://developer.mozilla.org/en/Javascript/Reference/Operators/Special/set)
* `Object.__defineSetter__`
* [JS Guide:Defining Getters and Setters](https://developer.mozilla.org/en/Javascript/Guide/Obsolete_Pages/Creating_New_Objects/Defining_Getters_and_Setters)


**/

/**
Object.__noSuchMethod__ -> Function

Executes a function when a non-existent method is called on an object. It takes the form of:

	obj.__noSuchMethod__ = function (id, args) { . . . }

where:

* `id`: the name of the non-existent method that was called
* `args`: an array of the arguments passed to the method  

By default, an attempt to call a method that doesn't exist on an object results in a [[TypeError `TypeError`]] being thrown. This behavior can be circumvented by defining a function at that object's `noSuchMethod` member. The function takes two arguments, the first is the name of the method attempted and the second is an array of the arguments that were passed in the method call. The second argument is an actual array (that is, it inherits through the `Array` prototype chain) and not the array-like [arguments object](https://developer.mozilla.org/en/Javascript/Reference/Functions_and_function_scope/arguments).

If this method can't be called, either as if `undefined` by default, if deleted, or if manually set to a non-function, the Javascript engine will revert to throwing `TypeError`s.

#### Example

`__noSuchMethod__` can be used to simulate multiple inheritance. An example of code that implements a primitive form of multiple inheritance is shown below.
 
	// Doesn't work with multiple inheritance objects as parents
	 function noMethod(name, args) {
	   var parents=this.__parents_;
	   
	   // Go through all parents
	   
	   for (var i=0;i<parents.length;i++) {
	     // If we find a function on the parent, we call it
	     if (typeof parents[i][name] =="function") {
	       return parents[i][name].apply(this, args);
	     }
	   }
	   
	   // If we get here, the method hasn't been found
	   
	   throw new TypeError;
	 }
	 
	 // Used to add a parent for multiple inheritance
	 
	 function addParent(obj, parent) {
	   // If the object isn't initialized, initialize it
	   
	   if (!obj.__parents_) {
	     obj.__parents_=[];
	     obj.__noSuchMethod__ = noMethod;
	   }
	   
	   // Add the parent
	   
	   obj.__parents_.push(parent);
	 }
	         
An example of using this idea is shown below.
	 
		// Example base class 1
	 
	 function NamedThing(name){
	   this.name=name;
	 }
	 
	 NamedThing.prototype = {
	   getName: function() {return this.name;},
	   setName: function(newName) {this.name=newName;}
	 }
	 
	 //Example base class 2
	 
	 function AgedThing(age){
	   this.age=age;
	 }
	 
	 AgedThing.prototype = {
	   getAge: function(){return this.age;},
	   setAge: function(age){this.age=age;}
	 }
	 
	 // Child class. inherits from NamedThing and AgedThing as well as defining address
	 
	 function Person(name, age, address){
	   addParent(this, NamedThing.prototype);
	   NamedThing.call(this, name);
	   addParent(this, AgedThing.prototype);
	   AgedThing.call(this, age);
	   this.address=address;
	 }
	 
	 Person.prototype = {
	   getAddr: function() {return this.address;},
	   setAddr: function(addr) {this.address=addr;}
	 }
	 
	 var bob=new Person("bob", 25, "New York");
	 
	 console.log("getAge is "+(("getAge" in bob)?"in":"not in")+" bob");
	 console.log("bob's age is: "+bob.getAge());
	 console.log("getName is "+(("getName" in bob)?"in":"not in")+" bob");
	 console.log("bob's name is: "+bob.getName());
	 console.log("getAddr is "+(("getAddr" in bob)?"in":"not in")+" bob");
	 console.log("bob's address is: "+bob.getAddr());
         

**/

/**
Object.propertyIsEnumerable(prop) -> Boolean
- prop (String): The name of the property to test.

Returns a Boolean indicating whether the specified property is enumerable.

Every object has a `propertyIsEnumerable` method. This method can determine whether the specified property in an object can be enumerated by a [`for...in`](https://developer.mozilla.org/en/Core_Javascript_1.5_Reference/Statements/for...in "en/Core_Javascript_1.5_Reference/Statements/for...in") loop, with the exception of properties inherited through the prototype chain. If the object does not have the specified property, this method returns false.

<Note>Starting in Javascript 1.8.1, `propertyIsEnumerable("prototype")` returns `false` instead of `true`; this makes the result compliant with ECMAScript 5.</Note>

#### Example: A basic use of `propertyIsEnumerable`

The following example shows the use of `propertyIsEnumerable` on objects and arrays:
    
	var o = {};
    var a = [];
    o.prop = 'is enumerable';
    a[0] = 'is enumerable';
    
    o.propertyIsEnumerable('prop');   // returns true
    a.propertyIsEnumerable(0);        // returns true
            
#### Example: User-defined versus built-in objects

The following example demonstrates the enumerability of user-defined versus built-in properties:
    
	var a = ['is enumerable'];
    
    a.propertyIsEnumerable(0);          // returns true
    a.propertyIsEnumerable('length');   // returns false
    
    Math.propertyIsEnumerable('random');   // returns false
    this.propertyIsEnumerable('Math');     // returns false
            
#### Example: Direct versus inherited properties
    
	var a = [];
    a.propertyIsEnumerable('constructor');         // returns false
    
    function firstConstructor()
    {
      this.property = 'is not enumerable';
    }
    firstConstructor.prototype.firstMethod = function () {};
    
    function secondConstructor()
    {
      this.method = function method() { return 'is enumerable'; };
    }
    
    secondConstructor.prototype = new firstConstructor;
    secondConstructor.prototype.constructor = secondConstructor;
    
    var o = new secondConstructor();
    o.arbitraryProperty = 'is enumerable';
    
    o.propertyIsEnumerable('arbitraryProperty');   // returns true
    o.propertyIsEnumerable('method');              // returns true
    o.propertyIsEnumerable('property');            // returns false
    
    o.property = 'is enumerable';
    
    o.propertyIsEnumerable('property');            // returns true
    
    // These return false as they are on the prototype which 
    // propertyIsEnumerable does not consider (even though the last two
    // are iteratable with for-in)
    o.propertyIsEnumerable('prototype'); // returns false (as of JS 1.8.1/FF3.6)
    o.propertyIsEnumerable('constructor'); // returns false
    o.propertyIsEnumerable('firstMethod'); // returns false


**/


 


/**
Object.defineProperty(obj, prop, descriptor) -> Object 
- obj (Object): The object on which to define the property.
- prop (String): The name of the property to be defined or modified.
- descriptor (String): The descriptor for the property being defined or modified.
 
Defines a new property directly on an object, or modifies an existing property on an object, and returns the object.

This method allows precise addition to or modification of a property on an object. Normal property addition through assignment creates properties which show up during property enumeration ([`for...in` loop](https://developer.mozilla.org/en/Javascript/Reference/Statements/for...in)), whose values may be changed, and which may be [deleted](https://developer.mozilla.org/en/Javascript/Reference/Operators/Special/delete). This method allows these extra details to be changed from their defaults.

Property descriptors present in objects come in two main flavors: data descriptors and accessor descriptors. A _data descriptor_ is a property that has a value, which may or may not be writable. An _accessor descriptor_ is a property described by a getter-setter pair of functions. A descriptor must be one of these two flavors; it can't be both. All descriptors regardless of flavor include the **configurable** and **enumerable** fields.

A property descriptor is an object with the following fields:

* `value`: The value associated with the property; data descriptors only. Defaults to `undefined`.
* `writable`: `true` if and only if the value associated with the property may be changed; data descriptors only. Defaults to `false`.
* `get`: A function which serves as a getter for the property, or `undefined` if there is no getter; accessor descriptors only. Defaults to `undefined`.
* `set`: A function which serves as a setter for the property, or `undefined` if there is no setter; accessor descriptors only. Defaults to `undefined`.
* `configurable`: `true` if and only if the type of this property descriptor may be changed and if the property may be deleted from the corresponding object. Defaults to `false`.
* `enumerable`: `true` if and only if this property shows up during enumeration of the properties on the corresponding object. Defaults to `false`.

##### Creating a property

When the property specified doesn't exist in the object, `defineProperty()` creates a new property as described. Fields may be omitted from the descriptor, and default values for those fields are imputed. All of the boolean-valued fields default to `false`. The `value`, `get`, and `set` fields default to `undefined`.

##### Modifying a property

When the property already exists, `defineProperty()` attempts to modify the property according to the values in the descriptor and the object current configuration. If the old descriptor had its <strong>configurable</strong> attribute set to `false` (the property is said "non-configurable"), then no attribute besides <strong>writable</strong> can be changed. In that case, it is also not possible to switch back and forth from data/accessor properties type (a property which would have been defined without `get`/`set`/`value`/`writable` is called "generic" and is "typed" as a data descriptor).

A [[TypeError `TypeError`]] is thrown when non-configurable property attributes are changed unless it's the `writable` attribute or if the current and new values are equal.

##### Code considerations

If you have to define many properties through the `defineProperty()` method, you can utilise the same descriptor object for each property, redefining it from time to time through binary flags.

#### Example
	var oDesc = {};
	function setProp (nMask, oObj, sKey, vVal_fGet, fSet) {
		if (nMask & 12) {
			if (arguments.length > 3) { oDesc.value = vVal_fGet; } else { delete oDesc.value; }
			oDesc.writable = Boolean(nMask & 8);
			delete oDesc.get;
			delete oDesc.set;
		} else {
			if (vVal_fGet) { oDesc.get = vVal_fGet; } else { delete oDesc.get; }
			if (fSet) { oDesc.set = fSet; } else { delete oDesc.set; }
			delete oDesc.value;
			delete oDesc.writable;
		}
		oDesc.enumerable = Boolean(nMask & 1);
		oDesc.configurable = Boolean(nMask & 2);
		Object.defineProperty(oObj, sKey, oDesc);
	}
	
	/**
	*	:: function setProp ::
	*
	*	vVal_fGet is the value to assign to a data descriptor or the getter function to assign to an accessor descriptor;
	*
	*	nMask is a bitmask:
	*
	*	flag 0x1: property is enumerable,
	*	flag 0x2: property is configurable,
	*	flag 0x4: property is data descriptor,
	*	flag 0x8: property is writable.
	*	Note: If flag 0x8 is setted to "writable", the propery will be considered a data descriptor even if the flag 0x4 is setted to "accessor descriptor"!
	*
	*	Values:
	*
	*	0  : accessor descriptor - not configurable, not enumerable (0000).
	*	1  : accessor descriptor - not configurable, enumerable (0001).
	*	2  : accessor descriptor - configurable, not enumerable (0010).
	*	3  : accessor descriptor - configurable, enumerable (0011).
	*	4  : readonly data descriptor - not configurable, not enumerable (0100).
	*	5  : readonly data descriptor - not configurable, enumerable (0101).
	*	6  : readonly data descriptor - configurable, not enumerable (0110).
	*	7  : readonly data descriptor - configurable, enumerable (0111).
	*	8  : writable data descriptor - not configurable, not enumerable (1000).
	*	9  : writable data descriptor - not configurable, enumerable (1001).
	*	10 : writable data descriptor - configurable, not enumerable (1010).
	*	11 : writable data descriptor - configurable, enumerable (1011).
	*/
	
	// creating a new empty object
	var myObj = {};
	
	// adding a writable data descriptor - not configurable, not enumerable
	setProp(8, myObj, "myNumber", 25);
	
	// adding a readonly data descriptor - not configurable, enumerable
	setProp(5, myObj, "myString", "Hello world!");
	
	// adding an accessor descriptor - not configurable, enumerable
	setProp(1, myObj, "myArray", function() {
		for (var iBit = 0, iFlag = 1, aBoolArr = [false]; iFlag < this.myNumber + 1 || (this.myNumber & iFlag); iFlag = iFlag << 1) { aBoolArr[iBit++] = Boolean(this.myNumber & iFlag); }
		return aBoolArr;
	}, function(aNewMask) {
		for (var nNew = 0, iBit = 0; iBit < aNewMask.length; iBit++) { nNew |= Boolean(aNewMask[iBit]) << iBit; }
		this.myNumber = nNew;
	});
	
	// adding a writable data descriptor (undefined value) - configurable, enumerable
	setProp(11, myObj, "myUndefined");
	
	// adding an accessor descriptor (only getter) - not configurable, enumerable
	setProp(1, myObj, "myDate", function() { return new Date(); });
	
	// adding an accessor descriptor (only setter) - not configurable, not enumerable
	setProp(0, myObj, "myAlert", null, function(sTxt) { alert(sTxt); });
	
	myObj.myAlert = myObj.myDate.toLocaleString() + "\n\n" + myObj.myString + "\nThe number " + myObj.myNumber + " represents the following bitmask: " + myObj.myArray.join(", ") + ".";

You can do the same thing with an anonymous descriptor object.

	new (function() {
		function buildProp (nMask, oObj, sKey, vVal_fGet, fSet) {
			if (nMask & 12) {
				if (arguments.length > 3) { this.value = vVal_fGet; } else { delete this.value; }
				this.writable = Boolean(nMask & 8);
				delete this.get;
				delete this.set;
			} else {
				if (vVal_fGet) { this.get = vVal_fGet; } else { delete this.get; }
				if (fSet) { this.set = fSet; } else { delete this.set; }
				delete this.value;
				delete this.writable;
			}
			this.enumerable = Boolean(nMask & 1);
			this.configurable = Boolean(nMask & 2);
			Object.defineProperty(oObj, sKey, this);
		};
		buildProp(5, window, "setProp", buildProp);
	})();
	
	// creating a new empty object
	var myObj = {};
	
	// adding a writable data descriptor - not configurable, not enumerable
	setProp(8, myObj, "myNumber", 25);
	
	// adding a readonly data descriptor - not configurable, enumerable
	setProp(5, myObj, "myString", "Hello world!");
	// etc. etc.
**/

/**
Object.create(proto [, propertiesObject]) -> Object | TypeError
- proto (Object): The object which should be the prototype of the newly-created object.
- propertiesObject (Object): If specified and not undefined, an object whose enumerable own properties (that is, those properties defined upon itself and not enumerable properties along its prototype chain) specify property descriptors to be added to the newly-created object, with the corresponding property names.

Creates a new object with the specified prototype object and properties. Throws a `TypeError` exception if the proto parameter isn't `null` or an object.

#### Examples
 
	var o;
 
	// create an object with null as prototype
	o = Object.create(null);
	
	o = {};
	// is equivalent to:
	o = Object.create(Object.prototype);
	
	
	function Constructor(){}
	o = new Constructor();
	// is equivalent to:
	o = Object.create(Constructor.prototype);
	// Of course, if there is actual initialization code in the Constructor function, the Object.create can't reflect it
	
	
	// create a new object whose prototype is a new, empty object
	// and a adding single property 'p', with value 42
	o = Object.create({}, { p: { value: 42 } })
	
	// by default properties ARE NOT writable, enumerable or configurable:
	o.p = 24
	o.p
	//42
	
	o.q = 12
	for (var prop in o) {
	   console.log(prop)
	}
	//"q"
	
	delete o.p
	//false
	
	//to specify an ES3 property
	o2 = Object.create({}, { p: { value: 42, writable: true, enumerable: true, configurable: true } });
	        

#### See Also
* [[Object.defineProperty `defineProperty()`]]
* [[Object.defineProperties `defineProperties`]]
* [[Object.isPrototypeOf `isPrototypeOf()`]]
* John Resig's post on [getPrototypeOf](http://ejohn.org/blog/objectgetprototypeof/)
 

**/

/**
Object.defineProperties() -> Void
- obj (Object): The object on which to define or modify properties.
- props (Object): An object whose own enumerable properties constitute descriptors for the properties to be defined or modified.

Defines new or modifies existing properties directly on an object, returning the object.

`defineProperties()`, in essence, defines all properties corresponding to the enumerable own properties of props on the object `objrops` object.

Assuming a pristine execution environment with all names and properties referring to their initial values, `defineProperties()` is almost completely equivalent (note the comment in `isCallable`) to the following reimplementation in Javascript:
	function defineProperties(obj, properties)
	{
	  function convertToDescriptor(desc)
	  {
	    function hasProperty(obj, prop)
	    {
	      return Object.prototype.hasOwnProperty.call(obj, prop);
	    }
	
	    function isCallable(v)
	    {
	      // NB: modify as necessary if other values than functions are callable.
	      return typeof v === "function";
	    }
	
	    if (typeof desc !== "object" || desc === null)
	      throw new TypeError("bad desc");
	
	    var d = {};
	    if (hasProperty(desc, "enumerable"))
	      d.enumerable = !!obj.enumerable;
	    if (hasProperty(desc, "configurable"))
	      d.configurable = !!obj.configurable;
	    if (hasProperty(desc, "value"))
	      d.value = obj.value;
	    if (hasProperty(desc, "writable"))
	      d.writable = !!desc.writable;
	    if (hasProperty(desc, "get"))
	    {
	      var g = desc.get;
	      if (!isCallable(g) && g !== "undefined")
	        throw new TypeError("bad get");
	      d.get = g;
	    }
	    if (hasProperty(desc, "set"))
	    {
	      var s = desc.set;
	      if (!isCallable(s) && s !== "undefined")
	        throw new TypeError("bad set");
	      d.set = s;
	    }
	
	    if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
	      throw new TypeError("identity-confused descriptor");
	
	    return d;
	  }
	
	  if (typeof obj !== "object" || obj === null)
	    throw new TypeError("bad obj");
	
	  properties = Object(properties);
	  var keys = Object.keys(properties);
	  var descs = [];
	  for (var i = 0; i < keys.length; i++)
	    descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);
	  for (var i = 0; i < descs.length; i++)
	    Object.defineProperty(obj, descs[i][0], descs[i][1]);
	
	  return obj;
	}
#### See Also
* [[Object.defineProperty `defineProperty()`]]
* [[Object.keys `keys()`]]

**/

/**
Object.getOwnPropertyDescriptor(obj, prop) -> Object
- obj (Object): The object in which to look for the property
- prop (String): The name of the property whose description is to be retrieved

This method permits examination of the precise description of a property. A property in Javascript consists of a string-valued name and a property descriptor. A property descriptor< is a record with some of the following attributes:

* `value`: The value associated with the property; data descriptors only. Defaults to `undefined`.
* `writable`: `true` if and only if the value associated with the property may be changed; data descriptors only. Defaults to `false`.
* `get`: A function which serves as a getter for the property, or `undefined` if there is no getter; accessor descriptors only. Defaults to `undefined`.
* `set`: A function which serves as a setter for the property, or `undefined` if there is no setter; accessor descriptors only. Defaults to `undefined`.
* `configurable`: `true` if and only if the type of this property descriptor may be changed and if the property may be deleted from the corresponding object. Defaults to `false`.
* `enumerable`: `true` if and only if this property shows up during enumeration of the properties on the corresponding object. Defaults to `false`.


#### Example
 
	var o, d;
 
	o = { get foo() { return 17; } };
	d = Object.getOwnPropertyDescriptor(o, "foo");
	// d is { configurable: true, enumerable: true, get: /*the getter function*/, set: undefined }
	
	o = { bar: 42 };
	d = Object.getOwnPropertyDescriptor(o, "bar");
	// d is { configurable: true, enumerable: true, value: 42, writable: true }
	
	o = {};
	Object.defineProperty(o, "baz", { value: 8675309, writable: false, enumerable: false });
	d = Object.getOwnPropertyDescriptor(o, "baz");
	// d is { value: 8675309, writable: false, enumerable: false, configurable: false }
	        
#### Returns

Returns a property descriptor for an own property (that is, one directly present on an object, not present by dint of being along an object's prototype chain) of a given object.

#### See Also

* [[Object.defineProperty `defineProperty()`]]

**/

/**
Object.keys(obj) -> Array
- obj (Object): The object whose enumerable own properties are to be returned.

Returns an array of all own enumerable properties found upon a given object, in the same order as that given by looping over the properties of the object manually (such as by using `for...in`).

#### Examples
 
	var arr = ["a", "b", "c"]; alert(Object.keys(arr)); // will alert "0,1,2"
	
	// array like object
	var obj = { 0 : "a", 1 : "b", 2 : "c"};
	alert(Object.keys(obj)); // will alert "0,1,2"
	
	// getFoo is property which isn't enumerable
	var my_obj = Object.create({}, { getFoo : { value : function () { return this.foo } } });
	my_obj.foo = 1;
	
	alert(Object.keys(my_obj)); // will alert only foo
         
If you want all properties, even the not enumerable, see [[Object.getOwnPropertyNames `getOwnPropertyNames`]].

#### See Also
* [[Object.propertyIsEnumerable `propertyIsEnumerable()`]]
* [[Object.create `create()`]]
* [[Object.getOwnPropertyNames `getOwnPropertyNames()`]]

**/

/**
Object.getOwnPropertyNames(obj) -> Array
- obj (Object): The object whose enumerable and non-enumerable own properties are to be returned.
 
 Returns an array  whose elements are strings corresponding to the enumerable _and non-enumerable_ properties found directly upon `obj`. The ordering of the enumerable properties in the array is consistent with the ordering exposed by looping over the properties of the object manually (such as by using `for...in`).  The ordering of the non-enumerable properties in the array, and among the enumerable properties, is not defined.

If you want only the enumerable properties, see [[Object.keys `keys()`]].

#### Example
 
	var arr = ["a", "b", "c"];
	print(Object.getOwnPropertyNames(arr).sort()); // prints "0,1,2,length"
 
	// array-like object
	var obj = { 0: "a", 1: "b", 2: "c"};
	print(Object.getOwnPropertyNames(obj).sort()); // prints "0,1,2"
 
	// non-enumerable property
	var my_obj = Object.create({}, { getFoo: { value: function() { return this.foo; }, enumerable: false } });
	my_obj.foo = 1;
 
	print(Object.getOwnPropertyNames(my_obj).sort()); // prints "foo, getFoo"
         

#### See Also
* [[Object.propertyIsEnumerable `propertyIsEnumerable()`]]
* [[Object.create `create()`]]
* [[Object.keys `keys()`]]

**/

/**
Object.getPrototypeOf(object) -> Object
- object (Object): The object whose prototype is to be returned.  

Returns the prototype of the specified object. Throws a [[TypeError `TypeError`]] exception if the object parameter isn't an `Object`.

  
#### See Also
* [[Object.isPrototypeOf `isPrototypeOf()`]]
* John Resig's post on [getPrototypeOf](http://ejohn.org/blog/objectgetprototypeof)

**/

/**
Object.preventExtensions(object) -> Void
- object (Object): The object which should be made non-extensible.

Prevents new properties from ever being added to an object (i.e. prevents future extensions to the object).

An object is extensible if new properties can be added to it. This method marks an object as no longer extensible, so that it will never have properties beyond the ones it had at the time it was marked as non-extensible.  Note that the properties of a non-extensible object, in general, may still be _deleted_. Attempting to add new properties to a non-extensible object will fail, either silently or by throwing a [[TypeError `TypeError`]] (most commonly, but not exclusively, when in [strict mode](https://developer.mozilla.org/en/Javascript/Strict_mode)).

#### Examples
 
	// Object.preventExtensions returns the object being made non-extensible.
	var obj = {};
	var obj2 = Object.preventExtensions(obj);
	assert(obj === obj2);
	
	// Objects are extensible by default.
	var empty = {};
	assert(Object.isExtensible(empty) === true);
	
	// ...but that can be changed.
	Object.preventExtensions(empty);
	assert(Object.isExtensible(empty) === false);
	
	// Object.defineProperty throws when adding a new property to a non-extensible object.
	var nonExtensible = { removable: true };
	Object.preventExtensions(nonExtensible);
	Object.defineProperty(nonExtensible, "new", { value: 8675309 }); // throws a TypeError
	
	// In strict mode, attempting to add new properties to a non-extensible object throws a TypeError.
	function fail()
	{
	  "use strict";
	  nonExtensible.newProperty = "FAIL"; // throws a TypeError
	}
	fail();


#### See Also

* [[Object.isExtensible `isExtensible()`]]
* [[Object.seal `seal()`]]]
* [[Object.isSealed `isSealed()`]]
* [[Object.freeze `freeze()`]]
* [[Object.isFrozen `isFrozen()`]]

**/

/**
Object.isExtensible() -> Boolean

Determines if an object is extensible (whether it can have new properties added to it).

Objects are extensible by default: they can have new properties added to them. An object can be marked as non-extensible using [[Object.preventExtensions `preventExtensions()`]], [[Object.seal `seal()`]], or [[Object.freeze `freeze()`]].

#### Examples
 
		// New objects are extensible.
		var empty = {};
		assert(Object.isExtensible(empty) === true);
	
		// ...but that can be changed.
		Object.preventExtensions(empty);
		assert(Object.isExtensible(empty) === false);
 
		// Sealed objects are by definition non-extensible.
		var sealed = Object.seal({});
		assert(Object.isExtensible(sealed) === false);
 
		// Frozen objects are also by definition non-extensible.
		var frozen = Object.freeze({});
		assert(Object.isExtensible(frozen) === false);
 
#### See Also

* [[Object.preventExtensions `preventExtensions()`]]
* [[Object.seal `seal()`]]
* [[Object.isSealed `isSealed()`]]
* [[Object.freeze `freeze()`]]
* [[Object.isFrozen `isFrozen()`]]

**/

/**
Object.seal(obj) -> Void
- obj (Object): The object which should be sealed.

By default objects are [[Object.extensible extensible]] (meaning, new properties can be added to them). Sealing an object prevents new properties from being added and marks all existing properties as non-configurable. This has the effect of making the set of properties on the object fixed and immutable.

Making all properties non-configurable also prevents them from being converted from data properties to accessor properties and vice versa, but it does not prevent the values of data properties from being changed. Attempting to delete or add properties to a sealed object, or to convert a data property to accessor or vice versa, will fail, either silently or by throwing a [[TypeError `TypeError`]] (most commonly, although not exclusively, when in [strict mode](https://developer.mozilla.org/en/Javascript/Strict_mode) code).

#### Examples

	var obj = {
	    prop: function () {},
	    foo: "bar"
	  };
	
	// New properties may be added, existing properties may be changed or removed
	obj.foo = "baz";
	obj.lumpy = "woof";
	delete obj.prop;
	
	var o = Object.seal(obj);
	assert(o === obj);
	assert(Object.isSealed(obj) === true);
	
	// Changing property values on a sealed object still works.
	obj.foo = "quux";
	
	// But you can't convert data properties to accessors, or vice versa.
	Object.defineProperty(obj, "foo", { get: function() { return "g"; } }); // throws a TypeError
	
	// Now any changes, other than to property values, will fail.
	obj.quaxxor = "the friendly duck"; // silently doesn't add the property
	delete obj.foo; // silently doesn't delete the property
	
	// ...and in strict mode such attempts will throw TypeErrors
	function fail() {
	  "use strict";
	  delete obj.foo; // throws a TypeError
	  obj.sparky = "arf"; // throws a TypeError
	}
	fail();
	
	// Attempted additions through Object.defineProperty will also throw
	Object.defineProperty(obj, "ohai", { value: 17 }); // throws a TypeError
	Object.defineProperty(obj, "foo", { value: "eit" }); // throws a TypeError

#### See Also

* [[Object.isSealed `isSealed()`]]
* [[Object.preventExtensions `preventExtensions()`]]
* [[Object.isExtensible `isExtensible()`]]
* [[Object.isSealed `isSealed()`]]
* [[Object.freeze `freeze()`]]
* [[Object.isFrozen `isFrozen()`]]

**/

/**
Object.freeze(obj) -> Object
- obj (Object): The object which should be frozen.

Freezes an object: that is, prevents new properties from being added to it; prevents existing properties from being removed; and prevents existing properties, or their enumerability, configurability, or writability, from being changed.In essence the object is made effectively immutable. The method returns the object being frozen.

Any attempt to add or remove from the property set of a frozen object throws a [[TypeError `TypeError`]] exception (most commonly, but not exclusively, when in [strict mode](https://developer.mozilla.org/en/Javascript/Strict_mode)).

#### Example

	var obj = {
	  prop: function (){},
	  foo: "bar"
	};
	
	// New properties may be added, existing properties may be changed or removed
	obj.foo = "baz";
	obj.lumpy = "woof";
	delete obj.prop;
	
	var o = Object.freeze(obj);
	
	assert(Object.isFrozen(obj) === true);
	
	// Now any changes will fail
	obj.foo = "quux"; // silently does nothing
	obj.quaxxor = "the friendly duck"; // silently doesn't add the property
	
	// ...and in strict mode such attempts will throw TypeErrors
	function fail(){
	  "use strict";
	  obj.foo = "sparky"; // throws a TypeError
	  delete obj.quaxxor; // throws a TypeError
	  obj.sparky = "arf"; // throws a TypeError
	}
	fail();
	
	// Attempted changes through Object.defineProperty will also throw
	Object.defineProperty(obj, "ohai", { value: 17 }); // throws a TypeError
	Object.defineProperty(obj, "foo", { value: "eit" }); // throws a TypeError

#### See Also

* [[Object.isFrozen `isFrozen()`]]
* [[Object.preventExtensions `preventExtensions()`]]
* [[Object.isExtensible `isExtensible()`]]
* [[Object.seal `seal()`]]
* [[Object.seal `seal()`]]
* [[Object.isSealed `isSealed()`]]

**/

/**
Object.isSealed(obj) -> Boolean
- obj (Object): The object which should be checked.

Returns true if the object is sealed, otherwise false. An object is sealed if it is [[Object.isExtensible non-extensible]] and if all its properties are non-configurable and therefore not removable (but not necessarily non-writable).

#### Examples

	// Objects aren't sealed by default.
	var empty = {};
	assert(Object.isSealed(empty) === false);
	
	// If you make an empty object non-extensible, it is vacuously sealed.
	Object.preventExtensions(empty);
	assert(Object.isSealed(empty) === true);
	
	// The same is not true of a non-empty object, unless its properties are all non-configurable.
	var hasProp = { fee: "fie foe fum" };
	Object.preventExtensions(hasProp);
	assert(Object.isSealed(hasProp) === false);
	
	// But make them all non-configurable and the object becomes sealed.
	Object.defineProperty(hasProp, "fee", { configurable: false });
	assert(Object.isSealed(hasProp) === true);
	
	// The easiest way to seal an object, of course, is Object.seal.
	var sealed = {};
	Object.seal(sealed);
	assert(Object.isSealed(sealed) === true);
	
	// A sealed object is, by definition, non-extensible.
	assert(Object.isExtensible(sealed) === false);
	
	// A sealed object might be frozen, but it doesn't have to be.
	assert(Object.isFrozen(sealed) === true); // all properties also non-writable
	
	var s2 = Object.seal({ p: 3 });
	assert(Object.isFrozen(s2) === false); // "p" is still writable
	
	var s3 = Object.seal({ get p() { return 0; } });
	assert(Object.isFrozen(s3) === true); // only configurability matters for accessor properties

#### See Also

* [[Object.seal `seal()`]]
* [[Object.preventExtensions `preventExtensions()`]]
* [[Object.isExtensible `isExtensible()`]]
* [[Object.seal `seal()`]]
* [[Object.freeze `freeze()`]]
* [[Object.isFrozen `isFrozen()`]]

**/

/**
Object.isFrozen(obj) -> Boolean
- obj (Object): The object which should be checked.
    
Determine if an object is frozen.

An object is frozen if and only if it is not [[Object.isExtensible extensible]], all its properties arenon-configurable, and all its data properties (that is, properties which are not accessor properties with getter or setter components) are non-writable.

#### See Also

* [[Object.freeze `freeze()`]]
* [[Object.preventExtensions `preventExtensions()`]]
* [[Object.isExtensible `isExtensible()`]]
* [[Object.seal `seal()`]]
* [[Object.seal `seal()`]]
* [[Object.isSealed `isSealed()`]]

**/

/**
Object.constructor -> Function
   
Returns a reference to the `Object` function that created the instance's prototype. Note that the value of this property is a reference to the function itself, not a string containing the function's name, but it isn't read only (except for primitive [[Boolean `Boolean`]], [[Number `Number`]], or [[String `String`]] values of: 1, true, "read-only").


#### Example: Displaying the constructor of an object

The following example creates a prototype, `Tree`, and an object of that type, `theTree`. The example then displays the `constructor` property for the object `theTree`.

    function Tree(name) {
       this.name = name;
    }
    theTree = new Tree("Redwood");
    console.log("theTree.constructor is " + theTree.constructor);


This example displays the following output:

    theTree.constructor is function Tree(name) {
        this.name = name;
    }

#### Example: Changing the constructor of an object

The following example shows how to modify constructor value of generic objects. Only true, 1 and "test" variable constructors will not be changed. This example explains that is not always so safe to believe in constructor function.

    function Type(){};
    var	types = [
    	new Array,	[],
    	new Boolean,	true,
    	new Date,
    	new Error,
    	new Function,	function(){},
    	Math,	
    	new Number,	1,
    	new Object,	{},
    	new RegExp,	/(?:)/,
    	new String,	"test"
    ];
    for(var i = 0; i < types.length; i++){
    	types[i].constructor = Type;
    	types[i] = [types[i].constructor, types[i] instanceof Type, types[i].toString()];
    };
    alert(types.join("\n"));


**/