
/** section: Javascript_Reference
class String

Strings are useful for holding data that can be represented in text form. Some of the most-used operations on strings are to check their [[String.length length]], to build and concatenate them using the `+` and `+=` string operators, and checking for the existence or location of substrings with the [[String.substring `substring()`]] and [[String.substr `substr()`]] methods.

#### Character access

There are two ways to access an individual character in a string. The first is the [[String.charAt `charAt()`]] method:

	return 'cat'.charAt(1); // returns "a"

The other way is to treat the string as an array-like object, where individual characters correspond to a numerical index:

	return 'cat'[1]; // returns "a"

<Note>Array-like character access (the second way above) is not part of ECMAScript 3. It is a Javascript and ECMAScript 5 feature.</Note>

For character access using bracket notation, attempting to delete or assign a value to these properties will not succeed. The properties involved are neither writable nor configurable. For more information, see [[Object.defineProperty `Object.defineProperty`]].

#### Comparing strings

C developers have the `strcmp()` function for comparing strings. In Javascript, you just use the `<` and `>` operators:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

A similar result can be achieved using the [[String.localeCompare `localeCompare()`]] method inherited by String instances.

#### Distinction between string primitives and String objects

Note that Javascript distinguishes between String objects and primitive string values. (The same is true of [[Boolean booleans]] and [[Number numbers]].)

String literals (denoted by double or single quotes) and strings returned from String calls in a non-constructor context (i.e., without using the `new` keyword) are primitive strings. Javascript automatically converts primitives and String objects, so that it's possible to use String object methods for primitive strings. In contexts where a method is to be invoked on a primitive string or a property lookup occurs, Javascript will automatically wrap the string primitive and call the method or perform the property lookup.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Some more examples:

	s1 = "2 + 2";               // creates a string primitive

	s2 = new String("2 + 2");   // creates a String object

	console.log(eval(s1));      // returns the number 4

	console.log(eval(s2));      // returns the string "2 + 2"

For these reasons, code may break when it encounters String objects when it expects a primitive string instead, although generally authors need not worry about the distinction.

A String object can always be converted to its primitive counterpart with the [[String.valueOf `valueOf()`]] method.

	console.log(eval(s2.valueOf())); // returns the number 4

**/


/**
new String(thing)
String(thing)
- thing (Object): Anything to be converted to a string.

The `String` global object is a constructor for strings, or a sequence of characters.

String literals can also take the forms:

	'string text'  
	"string text"  

**/

/**
String.replace(pattern, replacement[, flags]) -> String
- pattern (RegExp | String): A RegExp object to match, or a String to match. The match is replaced by the return value of `replacement`.
- replacement (String | Function): The String that replaces the substring received from the `pattern` (a number of special replacement patterns are supported); or,a function to be invoked to create the new substring (to put in place of the substring received from `phrase`).
- flags (String): A string specifying a combination of regular expression flags. 

Returns a new string with some or all matches of a `pattern` replaced by a `replacement`. The `pattern` can be a string or a RegExp, and the `replacement` can be a string or a function to be called for each match.

This method does not change the `String` object it is called on. It simply returns a new string.

To perform a global search and replace, either include the `g` switch in the regular expression or if the first parameter is a string, include `g` in the `flags` parameter.

The use of the `flags` parameter in this method is non-standard; use a RegExp object with the corresponding flags:
* `g`: global match
* `i`: ignore case
* `m`: match over multiple lines
* `y`: sticky  

#### Specifying a string as a parameter

The replacement string can include the following special replacement patterns:

<table class = \"fullwidth-table\"> <tbody> <tr> <td class = \"header\">Pattern</td> <td class = \"header\">Inserts</td> </tr> <tr> <td><code>$$</code></td> <td>Inserts a &quot;$&quot;.</td> </tr> <tr> <td><code>$&amp;</code></td> <td>Inserts the matched substring.</td> </tr> <tr> <td><code>$`</code></td> <td>Inserts the portion of the string that precedes the matched substring.</td> </tr> <tr> <td><code>$'</code></td> <td>Inserts the portion of the string that follows the matched substring.</td> </tr> <tr> <td style = \"white-space: nowrap;\"><code>$<em>n</em></code> or <code>$<em>nn</em></code></td> <td>Where <code><em>n</em></code> or <code><em>nn</em></code> are decimal digits, inserts the <em>n</em>th parenthesized submatch string, provided the first argument was a <code>RegExp</code> object.</td> </tr> </tbody></table>


#### Specifying a function as a parameter

You can specify a function as the second parameter. In this case, the function will be invoked after the match has been performed. The function's result (return value) will be used as the replacement string. (Note: the above-mentioned special replacement patterns do _not_ apply in this case.) Note that the function will be invoked multiple times for each full match to be replaced if the regular expression in the first parameter is global.

The arguments to the function are as follows:

<table class = "fullwidth-table"> <tbody> <tr> <td class = "header">Possible name</td> <td class = "header">Supplied value</td> </tr> <tr> <td>`str`</td> <td>The matched substring. (Corresponds to $& above.)</td> </tr> <tr> <td>`p1\. p2\. ...`</td> <td>The _n_th parenthesized submatch string, provided the first argument to `replace` was a `RegExp` object. (Correspond to $1\. $2\. etc. above.)</td> </tr> <tr> <td>`offset`</td> <td>The offset of the matched substring within the total string being examined. (For example, if the total string was `"abcd"`, and the matched substring was `"bc"`, then this argument will be `1`.)</td> </tr> <tr> <td style = "white-space: nowrap;">`s`</td> <td>The total string being examined.</td> </tr> </tbody> </table>

(The exact number of arguments will depend on whether the first argument was a `RegExp `object and, if so, how many parenthesized submatches it specifies.)

The following example will set `newString `to `"XXzzzz - XX , zzzz"`:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.replace.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: Using `global` and `ignore` with `replace`

In the following example, the regular expression includes the global and ignore case flags which permits `replace` to replace each occurrence of 'apples' in the string with 'oranges'.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.replace.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
In this version, a string is used as the first parameter and the global and ignore case flags are specified in the `flags` parameter.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.replace.3.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
Both of these examples print "oranges are round, and oranges are juicy."

#### Example: Defining the regular expression in `replace`

In the following example, the regular expression is defined in `replace` and includes the ignore case flag.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.replace.4.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
This prints "Twas the night before Christmas..."
   
#### Example: Switching words in a string

The following script switches the words in the string. For the replacement text, the script uses the `$1\. and `$2\. replacement patterns.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.replace.5.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
This prints "Smith, John".
    
#### Example: Using an inline function that modifies the matched characters

In this example, all occurrences of capital letters in the string are converted to lower case, and a hyphen is inserted just before the match location. The important thing here is that additional operations are needed on the matched item before it is given back as a replacement.

The replacement function accepts the matched snippet as its parameter, and uses it to transform the case and concatenate the hyphen before returning.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.replace.6.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Given `styleHyphenFormat('borderTop')`, this returns 'border-top'.

Because we want to further transform the _result_ of the match before the final substitution is made, we must use a function. This forces the evaluation of the match prior to the `toLowerCase()` method. If we had tried to do this using the match without a function, the toLowerCase() would have no effect.
    
    var newString = propertyName.replace(/[A-Z]/, '-' + '$&'.toLowerCase());  // won't work
            
This is because `'$&'.toLowerCase()` would be evaluated first as a string literal (resulting in the same `'$&'`) before using the characters as a pattern.
    
#### Example: Replacing a Fahrenheit degree with its Celsius equivalent

The following example replaces a Fahrenheit degree with its equivalent Celsius degree. The Fahrenheit degree should be a number ending with F. The function returns the Celsius number ending with C. For example, if the input number is 212F, the function returns 100C. If the number is 0F, the function returns -17.77777777777778C.

The regular expression `test` checks for any number that ends with F. The number of Fahrenheit degree is accessible to the function through its second parameter, `p1`. The function sets the Celsius number based on the Fahrenheit degree passed in a string to the `f2c` function. `f2c` then returns the Celsius number. This function approximates Perl's s///e flag.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.replace.7.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
**/

/**
String.length() -> Number

The length of a string.

This property returns the number of code units in the string. 

[UTF-16](http://en.wikipedia.org/wiki/UTF-16), the string format used by Javascript, uses a single 16-bit code unit to represent the most common characters, but needs to use two code units for less commonly-used characters, so it's possible for the value returned by `length` to not match the actual number of characters in the string.

For an empty string, `length` is 0.

#### Examples

	var x = "Cloud9";
	var empty = "";

	console.log("Cloud9 is " + x.length + " code units long"); // 6
	console.log("The empty string is has a length of " + empty.length); /* should be 0 */

#### See also

* [Javascript String.length and Internationalizing Web Applications](http://developer.teradata.com/blog/jasonstrimpel/2011/11/Javascript-string-length-and-internationalizing-web-applications "http://developer.teradata.com/blog/jasonstrimpel/2011/11/Javascript-string-length-and-internationalizing-web-applications")
**/

/**
String.substring(indexA[, indexB]) -> String
- indexA (Number): Value between 0 and one less than the length of the string.
- indexB (Number): Value between 0 and the length of the string.

Returns a subset of a string between one index and another, or through the end of the string.

`substring()` extracts characters from `indexA` up to but not including `indexB`. In particular:

* If `indexA` equals `indexB`, `substring` returns an empty string
* If `indexB` is omitted, `substring` extracts characters to the end of the string
* If either argument is less than 0 or is [[NaN `NaN`]], it is treated as if it were 0
* If either argument is greater than `stringName.length`, it is treated as if it were `stringName.length`


If `indexA` is larger than `indexB`, then the effect of `substring` is as if the two arguments were swapped; for example, `str.substring(1, 0) == str.substring(0, 1)`.

#### Example: Using `substring`

 The following example uses `substring` to display characters from the string "`Mozilla`":

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.substring.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
    
   
#### Example: Replacing a substring within a string

The following example replaces a substring within a string. It will replace both individual characters and substrings. The function call at the end of the example changes the string "`Brave New World`" into "`Brave New Web`".

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.substring.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Note that this can result in an infinite loop if `oldS` is itself a substring of `newS` -- for example, if you attempted to replace "World" with "OtherWorld" here. A better method for replacing strings is as follows:
    
	function replaceString(oldS, newS,fullS){
		return fullS.split(oldS).join(newS);
	}

#### See also

* [[String.substr `substr()`]]
* [[String.slice `slice()`]] 

**/

/**
String.substr(start[, length]) -> String
- start (Number): Location at which to begin extracting characters.
- length (Number): The number of characters to extract.

Returns the characters in a string beginning at the specified location through the specified number of characters.

`start` is a character index. The index of the first character is 0\. and the index of the last character is 1 less than the length of the string. `substr` begins extracting characters at `start` and collects `length` characters (unless it reaches the end of the string first, in which case it will return fewer).

If `start` is positive and is greater than or equal to the length of the string, `substr` returns an empty string.

If `start` is negative, `substr` uses it as a character index from the end of the string. If `start` is negative and `abs(start)` is larger than the length of the string, `substr` uses 0 as the start index.

If `length` is 0 or negative, `substr` returns an empty string. If `length` is omitted, `substr` extracts characters to the end of the string.


#### Example: Using `substr`

Consider the following script:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.substr.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
    
This script displays:

    (1,2): bc
    (-3,2): hi
    (-3): hij
    (1): bcdefghij
    (-20\. 2): ab
    (20\. 2):
    

#### See also

* [[String.slice `slice()`]]
* [[String.substring `substring()`]] 

**/

/**
String.charAt(index)
- index (Number): Value between 0 and 1 less than the length of the string.

Returns the specified character from a string.

Characters in a string are indexed from left to right. The index of the first character is 0\. and the index of the last character in a string called `stringName` is `stringName.length - 1`. If the `index` you supply is out of range, Javascript returns an empty string.

#### Example: Displaying characters at different locations in a string

The following example displays characters at different locations in the string "`Brave new world`":
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.charat.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
These lines display the following:

    The character at index 0 is 'B'
    The character at index 1 is 'r'
    The character at index 2 is 'a'
    The character at index 3 is 'v'
    The character at index 4 is 'e'
    The character at index 999 is ''
    

#### Example: Getting whole characters

The following provides a means of ensuring that going through a string loop always provides a whole character, even if the string contains characters that are not in the Basic Multi-lingual Plane.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.charat.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>       
         
 
#### Example: Fixing charAt to support non-Basic-Multilingual-Plane (BMP) characters

While the previous example may be more frequently useful for those wishing to support non-BMP characters (since the above does not require the caller to know where any non-BMP character might appear), in the event that one _does_ wish, in choosing a character by index, to treat the surrogate pairs within a string as the single characters they represent, one can use the following:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.charat.3.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>      

#### See Also
* [[String.indexOf `indexOf()`]]
* [[String.lastIndexOf `lastIndexOf()`]]
* [[String.split `split()`]]
* [[String.charCodeAt `charCodeAt()`]]

**/

/**
String.valueOf() -> String

Returns the primitive value of a String object.


The `valueOf` method of `String` returns the primitive value of a String object as a string data type. This value is equivalent to String.toString.

This method is usually called internally by Javascript and not explicitly in code.

#### Example: Using `valueOf`

    x = new String("Hello world");
    console.log(x.valueOf()) // Displays "Hello world"
    

#### See Also

* [[String.toString `toString()`]]
* [[Object.valueOf `Object.valueOf()`]]

**/

/**
String.fromCharCode(num1..., numN) -> String
- numN (Number): A sequence of numbers that are Unicode values.

Returns a string created by using the specified sequence of Unicode values. This method returns a string and not a `String` object.

Because `fromCharCode` is a static method of `String`, you always use it as `String.fromCharCode()`, rather than as a method of a `String` object you created.

#### Getting `fromCharCode()` to work with higher values

Although most common Unicode values can be represented in a fixed width system/with one number (as expected early on during Javascript standardization) and `fromCharCode()` can be used to return a single character for the most common values (i.e., UCS-2 values which are the subset of UTF-16 with the most common characters), in order to deal with ALL legal Unicode values, `fromCharCode()` alone is inadequate. Since the higher code point characters use two (lower value) "surrogate" numbers to form a single character, `fromCharCode()` can be used to return such a pair and thus adequately represent these higher valued characters.

Be aware, therefore, that the following utility function to grab the accurate character even for higher value code points, may be returning a value which is rendered as a single character, but which has a string count of two (though usually the count will be one).


<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.fromcharcode.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: Using `fromCharCode`

The following example returns the string "ABC".

	String.fromCharCode(65,66,67)
    

#### See Also
[[String.charCodeAt `charCodeAt()`]] 

**/

/**
String.localeCompare(compareString) 
- compareString (String): The string against which the referring string is comparing

Returns a number indicating whether a reference string comes before or after or is the same as the given string in sort order. Returns -1 if the string occurs earlier in a sort than `compareString`, returns 1 if the string occurs afterwards in such a sort, and returns 0 if they occur at the same level.

#### Example: Using `localeCompare`

The following example demonstrates the different potential results for a string occurring before, after, or at the same level as another:
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.localecompare.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
**/

/** 
String.constructor -> Function

Returns a reference to the [[String `String`]] function that created the instance's prototype. Note that the value of this property is a reference to the function itself, not a string containing the function's name. Note that the value of this property is a reference to the function itself, not a string containing the function's name.

For more information, see [[Object.constructor `Object.constructor`]].

**/

/**
String.charCodeAt(index)
- index (Number): Value greater than 0 and less than the length of the string; if it is not a number, it defaults to 0.

Returns the numeric Unicode value of the character at the given index (except for unicode codepoints > 0x10000).


Unicode code points range from 0 to 1,114,111. The first 12 Unicode code points are a direct match of the ASCII character encoding. For information on Unicode, see the [Core Javascript 1.5 Guide](https://developer.mozilla.org/en/Javascript/Guide/Obsolete_Pages/Unicode "en/Core_Javascript_1.5_Guide/Unicode").

Note that `charCodeAt` will always return a value that is less than 65,536. This is because the higher code points are represented by a pair of (lower valued)"surrogate" pseudo-characters which are used to comprise the real character. Because of this, in order to examine or reproduce the full character for individual characters of value 65,536 and above, for such characters, it is necessary to retrieve not only `charCodeAt(i)`, but also `charCodeAt(i+1)` (as if examining/reproducing a string with two letters).

`charCodeAt` returns [[NaN `NaN`]] if the given index is not greater than 0 or is greater than the length of the string.

#### Example: Using `charCodeAt`

The following example returns 65, the Unicode value for A.

	"ABC".charCodeAt(0) // returns 65


#### Example 2: Fixing charCodeAt to handle non-Basic-Multilingual-Plane characters if their presence earlier in the string is unknown

This version might be used in for loops and the like when it is unknown whether non-BMP characters exist before the specified index position.

	function fixedCharCodeAt (str, idx) {
    // ex. fixedCharCodeAt ('\uD800\uDC00', 0); // 65536
    // ex. fixedCharCodeAt ('\uD800\uDC00', 1); // 65536
    idx = idx || 0;
    var code = str.charCodeAt(idx);
    var hi, low;
    if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
        hi = code;
        low = str.charCodeAt(idx+1);
        if (isNaN(low)) {
            throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
        }
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }
    if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
        // We return false to allow loops to skip this iteration since should have already handled high surrogate above in the previous iteration
        return false;
        /* hi = str.charCodeAt(idx-1);
        low = code;
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000; */
    }
    return code;
	}
 
#### Example 3: Fixing charCodeAt to handle non-Basic-Multilingual-Plane characters if their presence earlier in the string is known
 

	function knownCharCodeAt (str, idx) {
    str += '';
    var code,
        end = str.length;

    var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    while ((surrogatePairs.exec(str)) != null) {
        var li = surrogatePairs.lastIndex;
        if (li - 2 < idx) {
            idx++;
        }
        else {
            break;
        }
    }

    if (idx >= end || idx < 0) {
        return NaN;
    }

    code = str.charCodeAt(idx);

    var hi, low;
    if (0xD800 <= code && code <= 0xDBFF) {
        hi = code;
        low = str.charCodeAt(idx+1); // Go one further, since one of the "characters" is part of a surrogate pair
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }
    return code;
}
        

#### See Also
* [[String.fromCharCode `fromCharCode()`]]
* [[String.charAt `charAt()`]]

**/

/**
String.concat(string1..., stringN) -> String
- stringN (String): Strings to concatenate to this string.

This method combines the text from one or more strings and returns a new string. Changes to the text in one string don't affect the other string.

#### Example: Using `concat`

The following example combines strings into a new string.
    
	var hello = "Hello, ";
 console.log(hello.concat("Kevin", " have a nice day.")); /// Hello, Kevin have a nice day.
   

**/

/**
String.indexOf(searchValue[, fromIndex=0]) -> Number
- searchValue (String): A string representing the value to search for.
- fromIndex (Number): The location within the calling string to start the search from. It can be any integer between 0 and the length of the string.

Returns the index within the calling `String` object of the first occurrence of the specified value, starting the search at `fromIndex`,
 returns -1 if the value is not found.


Characters in a string are indexed from left to right. The index of the first character is 0, and the index of the last character of a string called `stringName` is `stringName.length - 1`.
      

The `indexOf` method is case sensitive. For example, the following expression returns -1:

	"Blue Whale".indexOf("blue") // returns -1         

Note that '0' doesn't evaluate to `true` and '-1' doesn't evaluate to `false`. Therefore, when checking if a specific string exists within another string the correct way to check would be:

	"Blue Whale".indexOf("Blue") != -1 // true

	"Blue Whale".indexOf("Bloe") != -1 // false

#### Example: Using `indexOf` and `lastIndexOf`
The following example uses `indexOf` and `lastIndexOf` to locate values in the string "`Brave new world`".
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.indexof.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
#### Example: `indexOf` and case-sensitivity

The following example defines two string variables. The variables contain the same string except that the second string contains uppercase letters. The first `writeln` method displays 19. But because the `indexOf` method is case sensitive, the string "`cheddar`" is not found in `myCapString`, so the second `writeln` method displays -1.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.indexof.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
#### Example: Using `indexOf` to count occurrences of a letter in a string

The following example sets `count` to the number of occurrences of the letter `x` in the string `str`:
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.indexof.3.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
   
#### See Also
* [[String.charAt `charAt()`]]
* [[String.lastIndexOf `lastIndexOf()`]]
* [[String.split `split()`]]
* [[Array.indexOf `Array.indexOf()`]]

**/

/**
String.lastIndexOf(searchValue[, fromIndex]) -> Number
- searchValue (String): A string representing the value to search for.
- fromIndex (String): The location within the calling string to start the search from, indexed from left to right. It can be any integer between 0 and the length of the string. The default value is the length of the string.

Returns the index within the calling `String` object of the last occurrence of the specified value, or -1 if not found. The calling string is searched backward, starting at `fromIndex`.

Characters in a string are indexed from left to right. The index of the first character is 0\. and the index of the last character is `stringName.length - 1`.

The `lastIndexOf` method is case sensitive. For example, the following expression returns -1:

	"Blue Whale, Killer Whale".lastIndexOf("blue") // returns -1

#### Example: Using `indexOf` and `lastIndexOf`

The following example uses `indexOf` and `lastIndexOf` to locate values in the string "`Brave new world`".
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.lastindexof.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
    
#### See Also
* [[String.charAt `charAt()`]]
* [[String.indexOf `indexOf()`]]
* [[String.split `split()`]]

**/

/**
String.match(regexp) -> String | Array | null
-regexp (RegExp): A regular expression used to find a match. If a non-RegExp object is passed, it is implicitly converted to a RegExp by using `new RegExp(regexp)`.

Used to retrieve the matches when matching a string against a regular expression.


If the regular expression does not include the `g` flag, this returns the same result as [[RegExp.exec `RegExp.exec()`]].

If the regular expression includes the `g` flag, the method returns an [[Array `Array`]] containing all matches. If there were no matches, the method returns `null`.

The returned [[Array `Array`]] has an extra `input` property, which contains the regexp that generated it as a result. In addition, it has an `index` property, which represents the zero-based index of the match in the string.

#### Notes

* If you need to know if a string matches a regular expression `regexp`, use [[RegExp.test `RegExp.test()`]]
* If you only want the first match found, you might want to use [[RegExp.exec `RegExp.exec()`]] instead
* See §15.5.4.10 of [the ECMA-262 specification](http://www.ecma-international.org/publications/standards/Ecma-262.htm)


#### Example: Using `match`

In the following example, `match` is used to find "`Chapter`" followed by 1 or more numeric characters followed by a decimal point and numeric character 0 or more times. The regular expression includes the `i` flag so that case will be ignored.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.match.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
    
This returns the array containing Chapter 3.4.5.1,Chapter 3.4.5.1,.1.

"`Chapter 3.4.5.1`" is the first match and the first value remembered from `(Chapter \d+(\.\d)*)`.

"`.1`" is the second value remembered from `(\.\d)`.

#### Example: Using global and ignore case flags with `match`

The following example demonstrates the use of the global and ignore case flags with `match`. All letters A through E and a through e are returned, each its own element in the array

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.match.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

**/

/**
	String.quote() -> String

Returns a copy of the string, replacing various special characters in the string with their escape sequences and wrapping the result in double-quotes (").

#### Example:

<table class = \"standard-table\" style = \"table-layout: fixed; width: 100%;\"> <thead> <tr> <th class = \"header\" scope = \"col\"><code>str</code></th> <th class = \"header\" scope = \"col\"><code>str.quote()</code></th> <th class = \"header\" scope = \"col\"><code>eval(str.quote())</code></th> </tr> </thead> <tbody> <tr> <td><code>Hello world!</code></td> <td><code>&quot;Hello world!&quot;</code></td> <td><code>Hello world!</code></td> </tr> <tr> <td><code>Hello<br/> &nbsp; &nbsp; &nbsp; &nbsp; world!</code></td> <td><code>&quot;Hello\\n\\tworld!&quot;</code></td> <td><code>Hello<br/> &nbsp; &nbsp; &nbsp; &nbsp; world!</code></td> </tr> <tr> <td><code>&quot; \\ &mdash; '</code></td> <td><code>\\&quot; \\\\ \\u2014 '</code></td> <td><code>&quot; \\ &mdash; '</code></td> </tr> </tbody></table>

**/

/**
String.search(regexp) -> Number
- regexp (RegExp): A  regular expression object. If a non-RegExp object obj is passed, it is implicitly converted to a RegExp by using `new RegExp(regexp)`.

Executes the search for a match between a regular expression and this `String` object.

If successful, search returns the index of the regular expression inside the string. Otherwise, it returns -1.

When you want to know whether a pattern is found in a string use `search()` (similar to the regular expression [[RegExp.test `RegExp.test()`]]; for more information (but slower execution) use [[RegExp.test `RegExp.match()`]] (similar to the [[RegExp.exec `RegExp.exec()`]] method).

#### Example: Using `search`

The following example prints a message which depends on the success of the test.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.search.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
**/

/**
String.slice(beginslice[, endSlice]) -> String
- beginSlice (Number): The zero-based index at which to begin extraction.
- endSlice  (Number): The zero-based index at which to end extraction. If omitted, slice extracts to the end of the string.

Extracts a section of a string and returns a new string.

`slice` extracts the text from one string and returns a new string. Changes to the text in one string don't affect the other string.

`slice` extracts up to but not including `endSlice`. `string.slice(1,4)` extracts the second character through the fourth character (characters indexed 1\. 2\. and 3).

As a negative index, endSlice indicates an offset from the end of the string. string.slice(2,-1\. extracts the third character through the second to last character in the string.

#### Example: Using `slice` to create a new string
The following example uses `slice` to create a new string.
    
	// assumes a print function is defined
    var str1 = "The morning is upon us.";
    var str2 = str1.slice(4, -2);
    console.log(str2);
            
This writes:

    morning is upon u
    
**/

/**
String.split([separator][, limit]) -> Array
- separator (String): Specifies the character to use for separating the string. The separator is treated as a string or a regular expression. If separator is omitted, the array returned contains one element consisting of the entire string.
- limit (Number): Number specifying a limit on the number of splits to be found. The split method still splits on every match of separator, but it truncates the returned array to at most limit elements.

Splits a `String` object into an array of strings by separating the string into substrings.

When found, `separator` is removed from the string and the substrings are returned in an array. If `separator` is omitted, the array contains one element consisting of the entire string.

If `separator` is a regular expression that contains capturing parentheses, then each time separator is matched the results (including any undefined results) of the capturing parentheses are spliced into the output array. However, not all browsers support this capability.


#### Example: Using `split`

The following example defines a function that splits a string into an array of strings using the specified separator. After splitting the string, the function displays messages indicating the original string (before the split), the separator used, the number of elements in the array, and the individual array elements.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.split.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
This example produces the following output:

	The original string is: "Oh brave new world that has such people in it."
    The separator is: " "
    The array has 10 elements: Oh / brave / new / world / that / has / such / people / in / it. /
    
    The original string is: "Oh brave new world that has such people in it."
    The separator is: "undefined"
    The array has 1 elements: Oh brave new world that has such people in it. /
    
    The original string is: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec"
    The separator is: ","
    The array has 12 elements: Jan / Feb / Mar / Apr / May / Jun / Jul / Aug / Sep / Oct / Nov / Dec /
    
#### Example: Removing spaces from a string

In the following example, `split` looks for 0 or more spaces followed by a semicolon followed by 0 or more spaces and, when found, removes the spaces from the string. `nameList` is the array returned as a result of `split`.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.split.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
This prints two lines; the first line prints the original string, and the second line prints the resulting array:

	Harry Trump;Fred Barney; Helen Rigby ; Bill Abel ;Chris Hand
    Harry Trump,Fred Barney,Helen Rigby,Bill Abel,Chris Hand
    
#### Example: Returning a limited number of splits

In the following example, `split` looks for 0 or more spaces in a string and returns the first 3 splits that it finds.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.split.3.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
This script displays the following:
	
	Hello,World.,How
    
#### Example: Capturing parentheses

If `separator` contains capturing parentheses, matched results are returned in the array.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/String/string.split.4.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
This script displays the following:

	Hello ,1, word. Sentence number ,2, .
   
#### See Also
* [[String.charAt `charAt()`]] 
* [[String.indexOf `indexOf()`]]
* [[String.lastIndexOf `lastIndexOf()`]] 
* [[Array.join `Array.join()`]]

**/

/**
String.toLocaleLowerCase() -> String

Returns the calling string value converted to lower case, according to any locale-specific case mappings.


The `toLocaleLowerCase` method returns the value of the string converted to lower case according to any locale-specific case mappings. `toLocaleLowerCase` does not affect the value of the string itself. In most cases, this will produce the same result as [[String.toLowerCase `toLowerCase()`]], but for some locales, such as Turkish, whose case mappings don't follow the default case mappings in Unicode, there may be a different result.

#### Example: Using `toLocaleLowerCase`

The following example displays the string "alphabet":
    
	var upperText="ALPHABET";
	console.log(upperText.toLocaleLowerCase());

**/

/**
String.toLowerCase() -> String

Returns the calling string value converted to lowercase.


The `toLowerCase` method returns the value of the string converted to lowercase. `toLowerCase` does not affect the value of the string itself.

#### Example: Using `toLowerCase`

The following example displays the lowercase string "`alphabet`":
    
	var upperText="ALPHABET";
	console.log(upperText.toLowerCase());
            
        
#### See Also
* [[String.toLocaleLowerCase `toLocaleLowerCase()`]]
* [[String.toUpperCase `toUpperCase()`]] 

**/

/**
	String.toUpperCase() -> String

The `toUpperCase` method returns the value of the string converted to uppercase. `toUpperCase` does not affect the value of the string itself.

#### Example: Using `toUpperCase`

The following example displays the string "`ALPHABET`":

    var lowerText="alphabet";
    console.log(lowerText.toUpperCase());

#### See Also
* [[String.toLocaleUpperCase `toLocaleUpperCase()`]] 
* [[String.toLowerCase `toLowerCase()`]] 

**/

/**
String.toLocaleUpperCase()  -> String

Returns the calling string value converted to upper case, according to any locale-specific case mappings.


The `toLocaleUpperCase` method returns the value of the string converted to upper case according to any locale-specific case mappings. `toLocaleUpperCase` does not affect the value of the string itself. In most cases, this will produce the same result as [[String.toUpperCase `toUpperCase()`]], but for some locales, such as Turkish, whose case mappings don't follow the default case mappings in Unicode, there may be a different result.

#### Example: Using `toLocaleUpperCase`

The following example displays the string "ALPHABET":
    
	var lowerText="alphabet";
	console.log(lowerText.toLocaleUpperCase());
            

**/

/**
String.toString() -> String

Returns a string representing the specified object.


The `String` object overrides the `toString` method of [[Object `Object`]]; it does not inherit [[Object.toString `Object.toString()`]]. For `String` objects, the `toString()` method returns a string representation of the object.

#### Example: Using `toString`

The following example displays the string value of a String object:

    var x = new String("Hello world");
    console.log(x.toString());      // Displays "Hello world"
    
#### See Also
* [[Object.toString `Object.toString()`]]

**/

/**
String.trim() -> String

This method returns the string stripped of whitespace from both ends. `trim` does not affect the value of the string itself.

#### Example: Using `trim`

The following example displays the lowercase string "foo":
    
	var orig = "   foo  ";
	console.log(orig.trim());
            

#### See Also
* [[String.trimLeft `trimLeft()`]]
* [[String.trimRight `trimRight()`]]

**/

/**
String.trimLeft() -> String

The `trimLeft` method returns the string stripped of whitespace from its left end. `trimLeft` does not affect the value of the string itself.

#### Example: Using `trimLeft`

The following example displays the lowercase string "foo ":

	var orig="   foo  ";
	console.log(orig.trimLeft()); // "foo  "
    
#### See Also
* [[String.trim `trim()`]]
* [[String.trimRight `trimRight()`]]

**/

/**
String.trimRight() -> String

The `trimRight` method returns the string stripped of whitespace from its right end. `trimRight` does not affect the value of the string itself.

#### Example: Using `trimRight`
The following example displays the lowercase string "  foo":

    var orig="   foo  ";
    console.log(orig.trimRight()); // "   foo"
    
#### See Also
* [[String.trim `trim()`]]
* [[String.trimLeft `trimLeftt()`]]

**/
