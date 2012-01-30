
/** section: Javascript_Reference
class Array 

Arrays are list-like objects that come with a several built-in methods to perform traversal and mutation operations. Neither the size of a Javascript array nor the types of its elements are fixed. Since an array's size can grow or shrink at any time, Javascript arrays are not guaranteed to be dense. In general, these are convenient characteristics, but if these are desirable things to have for your use case, you might consider using WebGL typed arrays.

Note that [you shouldn't use an array as an associative array](http://www.andrewdupont.net/2006/05/18/javascript-associative-arrays-considered-harmful/). You can use plain [[Object objects]] instead, although doing so comes with its own caveats. See the post on [lightweight Javascript dictionaries with arbitrary keys](http://monogatari.doukut.su/2010/12/lightweight-javascript-dictionaries.html) as an example.

#### Accessing array elements

Javascript arrays are zero-indexed; the first element of an array is actually at index 0, and the last element is at the index one less than the value of the array's [[Array.length `length`]] property:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.examples.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script> 
	 	
Array elements are just object properties, in the way that [[Array.toString `toString()`]] is a property. However, note that trying to access the first element of an array as follows will throw a syntax error:

	console.log(arr.0);
	 	
There is nothing unique about Javascript arrays and their properties that causes this. Javascript properties that begin with a digit can't be referenced with the dot notation. They must be accessed using bracket notation. For example, if you had an object with a property `3d`, it would not be possible to access it using dot notation, either. It, too, would have to be referenced using bracket notation. This similarity is exhibited in the following two code samples:

	var years = [1950, 1960, 1970, 1980, 1990, 2000, 2010];
	try {
		console.log(years.0);
	}
	catch (ex) {
		console.log("Using bracket notation");
		console.log(years[0]);
	}
	 	
	try {
		renderer.3d.setTexture(model, "character.png");
	}
	catch (ex) {
		console.log("Using bracket notation");
		renderer["3d"].setTexture(model, "character.png");
	}
	 	
Note that `3d` had to be quoted. It's possible to quote the Javascript array indexes as well (_e.g._, `years["2"]` instead of `years[2]`), though it's not necessary. The 2 in years[2] eventually gets coerced into a string by the Javascript engine anyway, through an implicit toString conversion. It is for this reason that "2" and "02" would refer to two different slots on the years object and the following example logs true:

	console.log(years["2"] != years["02"]);
	 	
#### Relationship between length and numerical properties

A Javascript array's [[Array.length `length`]] property and numerical properties are connected. Several of the built-in array methods (_e.g._, [[Array.join `join()`]], [[Array.slice `slice()`]], [[Array.indexOf `indexOf()`]], etc.) take into account the value of an array's length property when they're called. Other methods (_e.g._, [[Array.push `push()`]], [[Array.splice `splice()`]], etc.) also result in updates to an array's length property.

	var fruits = [];
	fruits.push("banana", "apple", "peach");

	console.log(fruits.length); // logs 3
	 	
When setting a property on a Javascript array when the property is a valid array index and that index is outside the current bounds of the array, the array will grow to a size large enough to accommodate an element at that index, and the engine will update the array's length property accordingly:

	fruits[3] = "mango";
	console.log(fruits[3]);
	console.log(fruits.length); // logs 4
	 	
Setting the length property directly also results in special behavior.

	fruits.length = 10;
	console.log(fruits);		// The array gets padded with undefined
	console.log(fruits.length); // 10
	 	
This is explained further on the [[Array.length length]] page.

#### Creating an array using the result of a match

The result of a match between a regular expression and a string can create a Javascript array. This array has properties and elements that provide information about the match. An array is the return value of [[RegExp.exec `RegExp.exec()`]], [[String.match `match()`]], and [[String.replace `replace()`]]. To help explain these properties and elements, look at the following example and then refer to the table below:

	// Match one d followed by one or more b's followed by one d
	// Remember matched b's and the following d
	// Ignore case

	var myRe = /d(b+)(d)/i;
	var myArray = myRe.exec("cdbBdbsbz");
	 	
The properties and elements returned from this match are as follows:
<table class = \"fullwidth-table\"> <tbody> <tr> <td class = \"header\">Property/Element</td> <td class = \"header\">Description</td> <td class = \"header\">Example</td> </tr> <tr> <td>`input`</td> <td>A read-only property that reflects the original string against which the regular expression was matched.</td> <td>cdbBdbsbz</td> </tr> <tr> <td>`index`</td> <td>A read-only property that is the zero-based index of the match in the string.</td> <td>1</td> </tr> <tr> <td>`[0]`</td> <td>A read-only element that specifies the last matched characters.</td> <td>dbBd</td> </tr> <tr> <td>`[1], ...[n]`</td> <td>Read-only elements that specify the parenthesized substring matches, if included in the regular expression. The number of possible parenthesized substrings is unlimited.</td> <td>[1]: bB<br/> [2]: d</td> </tr> </tbody></table>

#### Example: Creating an Array

The following example creates an array, msgArray, with a length of 0, then assigns values to msgArray[0] and msgArray[99], changing the length of the array to 100.
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.examples.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script> 

#### Example: Creating a Two-dimensional Array

The following creates chess board as a two dimensional array of strings. The first move is made by copying the 'P' in 6,4 to 4,4. The position 4,4 is left blank.
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.examples.3.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	
	// Move King's Pawn forward 2
	board[4][4] = board[6][4];
	board[6][4] = ' ';
	print(board.join('\n'));
		 	
Here is the output:

	R,N,B,Q,K,B,N,R
	P,P,P,P,P,P,P,P
	 , , , , , , , 
	 , , , , , , , 
	 , , , , , , , 
	 , , , , , , , 
	p,p,p,p,p,p,p,p
	r,n,b,q,k,b,n,r
	
	R,N,B,Q,K,B,N,R
	P,P,P,P,P,P,P,P
	 , , , , , , , 
	 , , , , , , , 
	 , , , ,p, , , 
	 , , , , , , , 
	p,p,p,p, ,p,p,p
	r,n,b,q,k,b,n,r
	
#### See Also

* [Indexing Object Properties](https://developer.mozilla.org/en/Javascript/Guide/Working_with_Objects#Indexing_Object_Properties]()
* [New in Javascript 1.7: Array comprehensions](https://developer.mozilla.org/en/Javascript/New_in_Javascript/1.7#Array_comprehensions)
* [New in Javascript 1.6: Array extras](https://developer.mozilla.org/en/Javascript/New_in_Javascript/1.6#Array_extras)
* [Typed Arrays](https://developer.mozilla.org/en/Javascript_typed_arrays)

**/

/**
	new Array(element0, element1..., elementN)
	new Array(arrayLength) 
- elementN (Object): A Javascript array is initialized with the given elements, except in the case where a single argument is passed to theArray constructor and that argument is a number. Note that this special case only applies to Javascript arrays created with the `Array` constructor, not with array literals created with the bracket syntax.
- arrayLength (Number): If the first argument passed to the `Array` constructor is an integer between 0 and 232-1 (inclusive), a new Javascript array is created with that number of elements. If the argument is any other number, a [[RangeError `RangeError`]] exception is thrown.

Constructs a new array. Note that you can also just create a new array by defining a sequence of elements, like this: `[element0, element1, ..., elementN]`.

	
**/

/**
Array.length -> Number

An unsigned, 32-bit integer (a value less than 2^32) that specifies the number of elements in an array.

You can set the `length` property to truncate an array at any time. When you extend an array by changing its `length` property, the number of actual elements does not increase; for example, if you set `length` to 3 when it is currently 2, the array still contains only 2 elements.

#### Example: Iterating over an array 

In the following example the array numbers is iterated through by looking at the length property to see how many elements it has. Each value is then doubled.
	 
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.length.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	
#### Example: Shortening an array 
  
The following example shortens the array `statesUS` to a length of 50 if the current length is greater than 50.

    if (statesUS.length > 50) {
        statesUS.length=50
    }
	
**/

/**
Array.join(separator=",") -> String
- separator (String): A string to separate each element of the array. The separator is converted to a string if necessary.

Joins all elements of an array into a string.	

#### Example: Joining an array three different ways

The following example creates an array, a, with three elements, then joins the array three times: using the default separator, then a comma and a space, and then a plus.
	
	var a = new Array("Wind","Rain","Fire");
	var myVar1 = a.join(); 	 // assigns "Wind,Rain,Fire" to myVar1
	var myVar2 = a.join(", ");  // assigns "Wind, Rain, Fire" to myVar2
	var myVar3 = a.join(" + "); // assigns "Wind + Rain + Fire" to myVar3
	
#### See Also

* [[Array.reverse `reverse()`]]
* [[String.split `String.split()`]]
* [[Array.toString `toString()`]]
**/

/**
Array.slice(begin[, end]) -> Array
- begin (Number): Zero-based index at which to begin extraction. As a negative index, start indicates an offset from the end of the sequence. slice(-2) extracts the second-to-last element and the last element in the sequence.
- end (Number): Zero-based index at which to end extraction. slice extracts up to but not including end. slice(1,4) extracts the second element through the fourth element (elements indexed 1, 2, and 3). As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second-to-last element in the sequence. If end is omitted, slice extracts to the end of the sequence. 

Returns a one-level deep copy of a portion of an array. 

This method doesn't alter the original array, but returns a new "one level deep" copy that contains copies of the elements sliced from the original array. Elements of the original array are copied into the new array as follows:

 * For object references (and not the actual object), slice copies object references into the new array. Both the original and new array refer to the same object. If a referenced object changes, the changes are visible to both the new and original arrays.

 * For strings and numbers (not String and Number objects), slice copies strings and numbers into the new array. Changes to the string or number in one array does not affect the other array.

If a new element is added to either array, the other array is not affected.

#### Example: Using slice

 In the following example, `slice()` creates a new array, `newCar`, from `myCar`. Both include a reference to the object `myHonda`. When the color of `myHonda` is changed to purple, both arrays reflect the change.
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.slice.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	
This script writes:
	
	myCar = [{color:"red", wheels:4, engine:{cylinders:4, size:2.2}}, 2, "cherry condition", "purchased 1997"]
	newCar = [{color:"red", wheels:4, engine:{cylinders:4, size:2.2}}, 2]
	myCar[0].color = red 
	newCar[0].color = red
	The new color of my Honda is purple
	myCar[0].color = purple
	newCar[0].color = purple
	
**/

/**
Array.indexOf(searchElement[, fromIndex = 0]) -> Number
- searchElement (String): Element to locate in the array.
- fromIndex (Number): The index at which to begin the search. Defaults to 0, i.e. the whole array will be searched. If the index is greater than or equal to the length of the array, -1 is returned, i.e. the array will not be searched. If negative, it is taken as the offset from the end of the array. Note that even when the index is negative, the array is still searched from front to back. If the calculated index is less than 0, the whole array will be searched.

 Returns the first index at which a given element can be found in the array, or -1 if it is not present.

`indexOf()` compares `searchElement` to elements of the Array using strict equality (the same method used by the `===,` or triple-equals, operator).

#### Example: Using indexOf
	
The following example uses indexOf to locate values in an array.
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.indexof.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
		 	
#### Example: Finding all the occurrences of an element

The following example uses indexOf to find all the indices of an element in a given array, using push to add them to another array as they are found.
	 
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.indexof.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
		 	
#### See also

* [[Array.lastIndexOf `lastIndexOf()`]]
**/

/**
Array.push(element0, element1..., elementN) -> Number
- elementN (Object): The elements to add to the end of the array.
	
Mutates an array by appending the given elements to the end of an array and returning its new length.
 
`push()` is intentionally generic. This method can be called or applied to objects resembling arrays. The `push()` method relies on a `length` property to determine where to start inserting the given values. If the `length` property can't be converted into a number, the index used is 0. This includes the possibility of length being nonexistent, in which case length will also be created.
The only native, array-like objects are strings, although they are not suitable in applications of this method, as strings are immutable.

#### Example: Adding elements to an array

The following code creates the sports array containing two elements, then appends two elements to it. After the code executes, sports contains 4 elements: "soccer", "baseball", "football", and "swimming".
	
	var sports = ["soccer", "baseball"];
	sports.push("football", "swimming");
		 	
#### Returns

The new length property of the object upon which the method was called.
  
#### See Also

* [[Array.pop `pop()`]] 
* [[Array.shift `shift()`]]
* [[Array.unshift `unshift()`]]
* [[Array.concat `concat()`]]

**/

/**
Array.splice(index , howMany[, element1[, element2...[, elementN]]]) -> Array
Array.splice(index[, howMany[, element1[, element2...[, elementN]]]]) -> Array
- index (Number): Index at which to start changing the array. If negative, will begin that many elements from the end.
- howMany (Number): Indicates the number of old array elements to remove. If howMany is 0, no elements are removed. In this case, you should specify at least one new element. If no howMany parameter is specified (second syntax above, which is a SpiderMonkey extension), all elements after index are removed.
- elementN (Object): The elements to add to the array. If you don't specify any elements, splice simply removes elements from the array.

Changes the content of an array, adding new elements while removing old elements.

If you specify a different number of elements to insert than the number you're removing, the array will have a different length at the end of the call.

#### Example: Using `splice`

The following script illustrate the use of splice:
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.splice.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	
#### Returns

An array containing the removed elements. If only one element is removed, an array of one element is returned.

**/

/**
Array.isArray(obj) -> Boolean
- obj (Object): The object to be checked
 
Returns `true` if an object is an array, `false` if it is not.

This function is part of the ECMAScript 5 standard. See the [Web Tech Blog](https://developer.mozilla.org/web-tech/2010/07/26/determining-with-absolute-accuracy-whether-or-not-a-javascript-object-is-an-array) for more details.

#### Examples

	// all following calls return true
	Array.isArray([]);
	Array.isArray([1]);
	Array.isArray( new Array() );
	Array.isArray( Array.prototype ); // Little known fact: Array.prototype itself is an array.

	// all following calls return false
	Array.isArray();
	Array.isArray({});
	Array.isArray(null);
	Array.isArray(undefined);
	Array.isArray(17);
	Array.isArray("Array");
	Array.isArray(true);
	Array.isArray(false);
	 	
**/

/**
Array.pop() -> Object

Removes the last element from an array and returns that element.
  
The `pop()` method removes the last element from an array and returns that value to the caller.

`pop` is intentionally generic; this method can be [[Function.call called]] or [[Function.apply applied]] to objects resembling arrays. Objects which don't contain a `length` property reflecting the last in a series of consecutive, zero-based numerical properties may not behave in any meaningful manner.
undefined

#### Example: Removing the last element of an array

 The following code creates the myFish array containing four elements, then removes its last element.
	
	myFish = ["angel", "clown", "mandarin", "surgeon"];
	popped = myFish.pop();
	

#### See Also

* [[Array.push `push()`]]
* [[Array.shift `shift()`]]
* [[Array.unshift `unshift()`]]
**/

/**
Array.reverse() -> Void

Reverses an array in place. The first array element becomes the last and the last becomes the first.

The `reverse()` method transposes the elements of the calling array object in place, mutating the array, and returning a reference to the array.

#### Example: Reversing the elements in an array

The following example creates an array myArray, containing three elements, then reverses the array.
	
	var myArray = ["one", "two", "three"];
	myArray.reverse();
 
This code changes `myArray` so that:

* `myArray[0]` is "three"
* `myArray[1]` is "two
* `myArray[2]` is "one"


#### See Also
* [[Array.join `join()`]]
* [[Array.sort `sort()`]]
**/

/**
Array.shift() -> Object
 
Removes the first element from an array and returns that element. This method changes the length of the array.

`shift` is intentionally generic; this method can be can be [[Function.call called]] or [[Function.apply applied]] to objects resembling arrays. Objects which don't contain a `length` property reflecting the last in a series of consecutive, zero-based numerical properties may not behave in any meaningful manner.

#### Example: Removing an element from an array
The following code displays the `myFish` array before and after removing its first element. It also displays the removed element:
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.shift.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	
This example displays the following:
	
	myFish before: angel,clown,mandarin,surgeon
	myFish after: clown,mandarin,surgeon
	Removed this element: angel
	
#### See also
* [[Array.pop `pop()`]]
* [[Array.push `push()`]]
* [[Array.unshift `unshift()`]]
**/

/**
Array.sort([compareFunction]) -> Array
- compareFunction (Function): Defines the sort order. If omitted, the array is sorted lexicographically according to the string conversion of each element.

Sorts the elements of an array in place and returns the array.

If `compareFunction` is not supplied, elements are sorted by converting them to strings and comparing strings in lexicographic () order. For example, "80" comes before "9" in lexicographic order, but in a numeric sort 9 comes before 80.

If `compareFunction` is supplied, the array elements are sorted according to the return value of the compare function. If `a` and `b` are two elements being compared, then:

* If `compareFunction(a, b)` is less than 0, sort `a` to a lower index than `b`.
* If `compareFunction(a, b)` returns 0, leave `a` and `b` unchanged with respect to each other, but sorted with respect to all different elements. Note: the ECMAscript standard does not guarantee this behaviour, and thus not all browsers (e.g. Mozilla versions dating back to at least 2003, respect this.
* If `compareFunction(a, b)` is greater than 0, sort `b` to a lower index than `a`.
* compareFunction(a, b)` must always returns the same value when given a specific pair of elements a and b as its two arguments. If inconsistent results are returned then the sort order is undefined

So, the compare function has the following form:

	function compare(a, b)
	{
  	if (a is less than b by some ordering criterion)
	 	return -1;
  	if (a is greater than b by the ordering criterion)
	 	return 1;
  	// a must be equal to b
  	return 0;
	}
	 	
To compare numbers instead of strings, the compare function can simply subtract `b` from `a`:

	function compareNumbers(a, b)
	{
  	return a - b;
	}
	 	
Some implementations of Javascript implement a stable sort: the index partial order of `a` and `b` does not change if `a` and `b` are equal. If `a`'s index was less than `b`'s before sorting, it will be after sorting, no matter how `a` and `b` move due to sorting.

The `sort()` method can be conveniently used with [closures](https://developer.mozilla.org/en/Javascript/Guide/Closures "en/Core Javascript 1.5 Guide/Working with Closures"):

	var numbers = [4, 2, 5, 1, 3];
	numbers.sort(function(a, b) {
	return a - b;
	});
	print(numbers);
		
#### Example: Creating, displaying, and sorting an array

The following example creates four arrays and displays the original array, then the sorted arrays. The numeric arrays are sorted without, then with, a compare function.
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.sort.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
		 	
This example produces the following output. As the output shows, when a compare function is used, numbers sort correctly whether they are numbers or numeric strings.
	
	stringArray: Blue,Humpback,Beluga
	Sorted: Beluga,Blue,Humpback
	
	numberArray: 40,1,5,200
	Sorted without a compare function: 1,200,40,5
	Sorted with compareNumbers: 1,5,40,200
	
	numericStringArray: 80,9,700
	Sorted without a compare function: 700,80,9
	Sorted with compareNumbers: 9,80,700
	
	mixedNumericArray: 80,9,700,40,1,5,200
	Sorted without a compare function: 1,200,40,5,700,80,9
	Sorted with compareNumbers: 1,5,9,40,80,200,700
	

#### See Also
* [[Array.join `join()`]]
* [[Array.reverse `reverse()`]]
**/

/**
Array.concat(value1, value2..., valueN) -> Array
- valueN (Object | Array): Objects and/or arrays to concatenate to the resulting array
	
Returns a new array comprised of this array joined with other array(s) and/or value(s).

`concat` creates a new array consisting of the elements in the `this` object on which it is called, followed in order by, for each argument, the elements of that argument (if the argument is an array) or the argument itself (if the argument is not an array).

`concat` does not alter `this` or any of the arrays provided as arguments but instead returns a "one level deep" copy that contains copies of the same elements combined from the original arrays. Elements of the original arrays are copied into the new array as follows:

* Object references (and not the actual object): `concat` copies object references into the new array. Both the original and new array refer to the same object. That is, if a referenced object is modified, the changes are visible to both the new and original arrays.

* Strings and numbers (not [[String `String]] and [[Number `Number`]]: `concat` copies the values of strings and numbers into the new array.

Any operation on the new array will have no effect on the original arrays, and vice versa.

#### Example: Concatenating two arrays

The following code concatenates two arrays:
	
	var alpha = ["a", "b", "c"];
	var numeric = [1, 2, 3];
	
	// creates array ["a", "b", "c", 1, 2, 3]; 
	// alpha and numeric are unchanged
	var alphaNumeric = alpha.concat(numeric);
		 	
	
#### Example: Concatenating three arrays

The following code concatenates three arrays:
	
	var num1 = [1, 2, 3];
	var num2 = [4, 5, 6];
	var num3 = [7, 8, 9];
	
	// creates array [1, 2, 3, 4, 5, 6, 7, 8, 9]; 
	// num1, num2, num3 are unchanged
	var nums = num1.concat(num2, num3);
		 	
	
#### Example: Concatenating values to an array
The following code concatenates three values to an array:
	
	var alpha = ['a', 'b', 'c'];
	
	// creates array ["a", "b", "c", 1, 2, 3], leaving alpha unchanged
	var alphaNumeric = alpha.concat(1, [2, 3]);

**/

/**
Array.unshift(element1, element2..., elementN) -> Number
- elementN (Object): The elements to add to the front of the array.

Adds one or more elements to the beginning of an array and returns the new length of the array.
	
`unshift` is intentionally generic; this method can be [[Function.call called]] or [[Function.apply applied]] to objects resembling arrays. Objects which don't contain a `length` property reflecting the last in a series of consecutive, zero-based numerical properties may not behave in any meaningful manner. 

#### Example: Adding elements to an array

	The following code displays the `myFish` array before and after adding elements to it.
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.unshift.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

	This example displays the following:
	
	myFish before: ["angel", "clown"]
	myFish after: ["drum", "lion", "angel", "clown"]
	New length: 4
	
#### Returns
 The new [[Array.length `length`]] property of the object upon which the method was called.
#### See Also
* [[Array.pop `pop()`]]
* [[Array.push `push()`]]
* [[Array.shift `shift()`]]
**/

/**
Array.toString() -> String

	Returns a string representing the specified array and its elements.

The [[Array `Array`]] object overrides the `toString` method of [[Object `Object`]]. For Array objects, the `toString` method joins the array and returns one string containing each array element separated by commas. For example, the following code creates an array and uses `toString` to convert the array to a string:

		var monthNames = ['Jan', 'Feb', 'Mar', 'Apr'];
		var myVar = monthNames.toString(); // assigns "Jan,Feb,Mar,Apr" to myVar.

Javascript calls the `toString` method automatically when an array is to be represented as a text value or when an array is referred to in a string concatenation.


**/

/**
Array.lastIndexOf(searchElement[, fromIndex]) -> Number
- searchElement (Object): Element to locate in the array. 
- fromIndex (Number): The index at which to start searching backwards. Defaults to the array's length, i.e. the whole array will be searched. If the index is greater than or equal to the length of the array, the whole array will be searched. If negative, it is taken as the offset from the end of the array. Note that even when the index is negative, the array is still searched from back to front. If the calculated index is less than 0, -1 is returned, i.e. the array will not be searched.

	Returns the last index at which a given element can be found in the array, or -1 if it is not present. The array is searched backwards, starting at `fromIndex`.

`lastIndexOf` compares `searchElement` to elements of the Array using strict equality (the same method used by the `===`, or triple-equals, operator).

#### Example: Using `lastIndexOf()`

The following example uses `lastIndexOf` to locate values in an array:

		var array = [2, 5, 9, 2];
		var index = array.lastIndexOf(2);
		// index is 3
		index = array.lastIndexOf(7);
		// index is -1
		index = array.lastIndexOf(2, 3);
		// index is 3
		index = array.lastIndexOf(2, 2);
		// index is 0
		index = array.lastIndexOf(2, -2);
		// index is 0
		index = array.lastIndexOf(2, -1);
		// index is 3
	
#### Example: Finding all the occurrences of an element

	The following example uses `lastIndexOf()` to find all the indices of an element in a given array, using [[Array.push `push()`]] to add them to another array as they are found:

		var indices = [];
		var idx = array.lastIndexOf(element);
		while (idx!= -1)
		{
	 	 indices.push(idx);
	 	 idx = (idx > 0 ? array.lastIndexOf(element, idx - 1) : -1);
		}
	
	Note that we have to handle the case `idx == 0, separately here because the element will always be found regardless of the `fromIndex` parameter if it is the first element of the array. This is different from the [[Array.indexOf `Array.indexOf()`]] method.

#### See also
 [[Array.indexOf `indexOf()`]]
 
**/

/**
Array.filter(callback(element, index, array)[, thisObject]) -> Array
- callback (Function): Used to test each element of the array.
- element (Object): The value of the current element
- index (Number): The index of the element
- array (Object): The array object being traversed
- thisObject (Object): Used when executing callback.

Creates a new array with all elements that pass the test implemented by the provided function.
	
`filter` calls a provided `callback` function once for each element in an array, and constructs a new array of all the values for which `callback` returns a true value. `callback` is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values. Array elements which don't pass the `callback` test are simply skipped, and are not included in the new array.

If a `thisObject` parameter is provided to `filter`, it will be used as the `this` for each invocation of the `callback`. If it is not provided, or is `null`, the global object associated with `callback` is used instead.

`filter` does not mutate the array on which it is called.

The range of elements processed by `filter` is set before the first invocation of `callback`. Elements which are appended to the array after the call to `filter` begins will not be visited by `callback`. If existing elements of the array are changed, or deleted, their value as passed to `callback` will be the value at the time `filter` visits them; elements that are deleted are not visited.

#### Example: Filtering out all small values

The following example uses `filter` to create a filtered array that has all elements with values less than 1, removed.
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.filter.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
		
**/

/**
Array.forEach(callback(element, index, array)[, thisArg]) -> Array
- callback (Function): Used to test each element of the array.
- element (Object): The value of the current element
- index (Number): The index of the element
- array (Object): The array object being traversed
- thisArg (Object): Used when executing callback.

Executes a provided function once per array element.

`callback` is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values.

If a `thisArg` parameter is provided to `forEach`, it will be used as the `this` value for each `callback` invocation as if `callback.call(thisArg, element, index, array)` was called. If `thisArg` is `undefined` or `null`, the `this` value within the function depends on whether the function is in [strict mode](https://developer.mozilla.org/en/Javascript/Strict_mode "en/Javascript/Strict_mode") or not (passed value if in strict mode, global object if in non-strict mode).

The range of elements processed by `forEach` is set before the first invocation of `callback`. Elements which are appended to the array after the call to `forEach` begins will not be visited by `callback`. If existing elements of the array are changed, or deleted, their value as passed to `callback` will be the value at the time `forEach` visits them; elements that are deleted are not visited.

#### Example: Printing the contents of an array

 The following code logs a line for each element in an array:
 
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.foreach.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	
#### Example: An object copy function

 The following code creates a copy of a given object. There are different ways to create a copy of an object. This one is just one of them here to explain how `Array.prototype.forEach` works. It uses a couple of new ECMAScript 5 Object.* functions.
 
	function copy(o){
	var copy = Object.create( Object.getPrototypeOf(o) );
	var propNames = Object.getOwnPropertyNames(o);
		propNames.forEach(function(name){
			var desc = Object.getOwnPropertyDescriptor(o, name);
			Object.defineProperty(copy, name, desc);
		});
	return copy;
 	}
  
 	var o1 = {a:1, b:2};
 	var o2 = copy(o1); // o2 looks like o1 now
	 	 	 
**/

/**
Array.every(callback(element, index, array)[, thisObject]) -> Boolean
- callback (Function): Used to test each element of the array.
- element (Object): The value of the current element
- index (Number): The index of the element
- array (Object): The array object being traversed
- thisArg (Object): Used when executing callback.

	Tests whether all elements in the array pass the test implemented by the provided function.
	
`every` executes the provided `callback` function once for each element present in the array until it finds one where `callback` returns a false value. If such an element is found, the `every` method immediately returns `false`. Otherwise, if `callback` returned a true value for all elements, `every` will return `true`. `callback` is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values.

If a `thisObject` parameter is provided to `every`, it will be used as the `this` for each invocation of the `callback`. If it is not provided, or is `null`, the global object associated with `callback` is used instead.

`every` does not mutate the array on which it is called.

The range of elements processed by `every` is set before the first invocation of `callback`. Elements which are appended to the array after the call to `every` begins will not be visited by `callback`. If existing elements of the array are changed, their value as passed to `callback` will be the value at the time `every` visits them; elements that are deleted are not visited.

`every` acts like the "for all" quantifier in mathematics. In particular, for an empty array, it returns true. (It is [vacuously true](http://en.wikipedia.org/wiki/Vacuous_truth#Vacuous_truths_in_mathematics "http://en.wikipedia.org/wiki/Vacuous_truth#Vacuous_truths_in_mathematics") that all elements of the [empty set](http://en.wikipedia.org/wiki/Empty_set#Common_problems "http://en.wikipedia.org/wiki/Empty_set#Common_problems") satisfy any given condition.)

#### Example: Testing size of all array elements

The following example tests whether all elements in the array are bigger than 10.
	
    function isBigEnough(element, index, array) {
        return (element >= 10);
    }
    var passed = [12, 5, 8, 130, 44].every(isBigEnough);
    // passed is false
    passed = [12, 54, 18, 130, 44].every(isBigEnough);
    // passed is true

**/

/**
Array.map(callback(element, index, array)[, thisArg]) -> Array
- callback (Function): Used to test each element of the array.
- element (Object): The value of the current element
- index (Number): The index of the element
- array (Object): The array object being traversed
- thisArg (Object): Used when executing callback.

	Creates a new array with the results of calling a provided function on every element in this array.
	
`map` calls a provided `callback` function once for each element in an array, in order, and constructs a new array from the results. `callback` is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values.

If a `thisArg` parameter is provided to `map`, it will be used as the `this` for each invocation of the `callback`. If it is not provided, or is `null`, the global object associated with `callback` is used instead.

`map` does not mutate the array on which it is called.

The range of elements processed by `map` is set before the first invocation of `callback`. Elements which are appended to the array after the call to `map` begins will not be visited by `callback`. If existing elements of the array are changed, or deleted, their value as passed to `callback` will be the value at the time `map` visits them; elements that are deleted are not visited.

#### Example: Pluralizing the words (strings) in an array

	The following code creates an array of "plural" forms of nouns from an array of their singular forms.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.map.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>			 	
	
#### Example: Mapping an array of numbers to an array of square roots

	The following code takes an array of numbers and creates a new array containing the square roots of the numbers in the first array.
	
		var numbers = [1, 4, 9];
		var roots = numbers.map(Math.sqrt);
		// roots is now [1, 2, 3], numbers is still [1, 4, 9]
		 	
#### Example: using `map` generically

	This example shows how to use map on a [[String string]] to get an array of bytes in the ASCII encoding representing the character values:
	
		var map = Array.prototype.map
		var a = map.call("Hello World", function(x) { return x.charCodeAt(0); })
		// a now equals [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]
		 	
#### Tricky use case

 This section is inspired by [this blog post](http://www.wirfs-brock.com/allen/posts/166).

 It is common to use the callback with one argument (the element being traversed). Some functions are also commonly used with one argument. These habits may lead to confusing behaviors.
 
		// Consider:
 	["1", "2", "3"].map(parseInt);
 	// While one could expect [1, 2, 3]
 	// The actual result is [1, NaN, NaN]
 	
 	// parseInt is often used with one argument, but takes two. The second being the radix
 	// To the callback function, Array.prototype.map passes 3 arguments: the element, the index, the array
 	// The third argument is ignored by parseInt, but not the second one, hence the possible confusion.
	 	
**/

/**
Array.some(callback(element, index, array)[, thisObject]) -> Boolean
- callback (Function): Used to test each element of the array.
- element (Object): The value of the current element
- index (Number): The index of the element
- array (Object): The array object being traversed
- thisArg (Object): Used when executing callback.

	Tests whether some element in the array passes the test implemented by the provided function.

`some` executes the `callback` function once for each element present in the array until it finds one where `callback` returns a true value. If such an element is found, `some` immediately returns `true`. Otherwise, `some` returns `false`. `callback` is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values.

If a `thisObject` parameter is provided to `some`, it will be used as the `this` for each invocation of the `callback`. If it is not provided, or is `null`, the global object associated with `callback` is used instead.

`some` does not mutate the array on which it is called.

The range of elements processed by `some` is set before the first invocation of `callback`. Elements that are appended to the array after the call to `some` begins will not be visited by `callback`. If an existing, unvisited element of the array is changed by `callback`, its value passed to the visiting `callback` will be the value at the time that `some` visits that element's index; elements that are deleted are not visited.

#### Example: Testing size of all array elements

The following example tests whether some element in the array is bigger than 10.

    function isBigEnough(element, index, array) {
        return (element >= 10);
    }
    var passed = [2, 5, 8, 1, 4].some(isBigEnough);
    // passed is false
    passed = [12, 5, 8, 1, 4].some(isBigEnough);
    // passed is true
	
**/

/**
Array.reduceRight(callback(previousValue, currentValue, index, array)[, initialValue]) -> Object
- callback (Function): Function to execute on each value in the array, taking four arguments
- previousValue (Object): The value previously returned in the last invocation of the callback, or `initialValue`, if supplied.
- currentValue (Object): The current element being processed in the array.
- index (Number): The index of the current element being processed in the array.
- array (Array): The array reduce was called upon.
- initialValue (Object): Used as the first argument to the first call of the callback.

	Apply a function simultaneously against two values of the array (from right-to-left) as to reduce it to a single value.

`reduceRight` executes the callback function once for each element present in the array, excluding holes in the array.

The call to the `reduceRight()` `callback` looks something like this:

    array.reduceRight(function(previousValue, currentValue, index, array) {
       // ...
    });

The first time the function is called, the `previousValue` and `currentValue` can be one of two values. If an `initialValue` was provided in the call to `reduceRight`, then `previousValue` will be equal to `initialValue` and `currentValue` will be equal to the last value in the array. If no `initialValue` was provided, then `previousValue` will be equal to the last value in the array and `currentValue` will be equal to the second-to-last value.

Some example run-throughs of the function would look like this:
	
		[0, 1, 2, 3, 4].reduceRight(function(previousValue, currentValue, index, array) {
			return previousValue + currentValue;
		});
	
		// First call
		previousValue = 4, currentValue = 3, index = 3
	
		// Second call
		previousValue = 7, currentValue = 2, index = 2
	
		// Third call
		previousValue = 9, currentValue = 1, index = 1
	
		// Fourth call
		previousValue = 10, currentValue = 0, index = 0
	
		// array is always the object [0,1,2,3,4, upon which reduceRight was called
	
		// Return Value: 10
	 	
And if you were to provide an `initialValue`, the result would look like this:
	
		[0, 1, 2, 3, 4].reduceRight(function(previousValue, currentValue, index, array) {
			return previousValue + currentValue;
		}, 10);
	
		// First call
		previousValue = 10, currentValue = 4, index = 4
	
		// Second call
		previousValue = 14, currentValue = 3, index = 3
	
		// Third call
		previousValue = 17, currentValue = 2, index = 2
	
		// Fourth call
		previousValue = 19, currentValue = 1, index = 1
	
		// Fifth call
		previousValue = 20, currentValue = 0, index = 0
	
		// array is always the object [0,1,2,3,4, upon which reduceRight was called
	
		// Return Value: 20
	 
#### Example: Sum up all values within an array
		
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.reduceright.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
		 	
	
#### Example: Flatten an array of arrays
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.reduceright.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	
#### See Also

 * [[Array.reduce `reduce()`]]

**/

/**
Array.reduce(callback(previousValue, currentValue, index, array)[, initialValue]) -> Object
- callback (Function): Function to execute on each value in the array, taking four arguments
- previousValue (Object): The value previously returned in the last invocation of the callback, or `initialValue`, if supplied.
- currentValue (Object): The current element being processed in the array.
- index (Number): The index of the current element being processed in the array.
- array (Array): The array reduce was called upon.
- initialValue (Object): Used as the first argument to the first call of the callback.

`reduce` executes the `callback` function once for each element present in the array, excluding holes in the array.

The first time the callback is called, `previousValue` and `currentValue` can be one of two values. If `initialValue` is provided in the call to `reduce`, then `previousValue` will be equal to `initialValue` and `currentValue` will be equal to the first value in the array. If no `initialValue` was provided, then `previousValue` will be equal to the first value in the array and `currentValue` will be equal to the second.

Suppose the following use of `reduce` occurred:

	[0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
  	return previousValue + currentValue;
		});
	 	
The callback would be invoked four times, with the arguments and return values in each call being as follows:
<table border="1" cellpadding="1" cellspacing="1" style="width: 100%; table-layout: fixed;"> <thead> <tr> <th scope="col">&nbsp;</th> <th scope="col"><code>previousValue</code></th> <th scope="col"><code>currentValue</code></th> <th scope="col"><code>index</code></th> <th scope="col"><code>array</code></th> <th scope="col">return value</th> </tr> </thead> <tbody> <tr> <th scope="row">first call</th> <td><code>0</code></td> <td><code>1</code></td> <td><code>1</code></td> <td>`[0,1,2,3,4]`</td> <td><code>1</code></td> </tr> <tr> <th scope="row">second call</th> <td><code>1</code></td> <td><code>2</code></td> <td><code>2</code></td> <td>`[0,1,2,3,4]`</td> <td><code>3</code></td> </tr> <tr> <th scope="row">third call</th> <td><code>3</code></td> <td><code>3</code></td> <td><code>3</code></td> <td>`[0,1,2,3,4]`</td> <td><code>6</code></td> </tr> <tr> <th scope="row">fourth call</th> <td><code>6</code></td> <td><code>4</code></td> <td><code>4</code></td> <td>`[0,1,2,3,4]`</td> <td><code>10</code></td> </tr> </tbody>
</table>

The value returned by `reduce` would be that of the last callback invocation (`10`).

If you were to provide an initial value as the second argument to `reduce`, the result would look like this:

		[0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
  		return previousValue + currentValue;
		}, 10);
	 	
<table border="1" cellpadding="1" cellspacing="1" style="width: 100%; table-layout: fixed;"> <thead> <tr> <th scope="col">&nbsp;</th> <th scope="col">`previousValue`</th> <th scope="col">`currentValue`</th> <th scope="col">`index`</th> <th scope="col">`array`</th> <th scope="col">return value</th> </tr> </thead> <tbody> <tr> <th scope="row">first call</th> <td>`10`</td> <td>`0`</td> <td>`0`</td> <td>`[0,1,2,3,4]`</td> <td>`10`</td> </tr> <tr> <th scope="row">second call</th> <td>`10`</td> <td>`1`</td> <td>`1`</td> <td>`[0,1,2,3,4]`</td> <td>`11`</td> </tr> <tr> <th scope="row">third call</th> <td>`11`</td> <td>`2`</td> <td>`2`</td> <td>`[0,1,2,3,4]`</td> <td>`13`</td> </tr> <tr> <th scope="row">fourth call</th> <td>`13`</td> <td>`3`</td> <td>`3`</td> <td>`[0,1,2,3,4]`</td> <td>`16`</td> </tr> <tr> <th scope="row">fifth call</th> <td>`16`</td> <td>`4`</td> <td>`4`</td> <td>`[0,1,2,3,4]`</td> <td>`20`</td> </tr> </tbody>
</table>

The value returned by `reduce` this time would be, of course, `20`.

#### Example: Sum up all values within an array
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.reduce.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
	
#### Example: Flatten an array of arrays
	
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/Array/array.reduce.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
		
#### See Also

* [[Array.reduceRight `reduceRight()`]]
 
**/

