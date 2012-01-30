
/** section: Javascript_Reference
class JSON

The JSON object contains methods for parsing JSON and converting values to JSON. It can't be called or constructed, and aside from its two method properties it has no interesting functionality of its own.

#### JSON Notation

[JSON](www.json.org) is a syntax for serializing objects, arrays, numbers, strings, booleans, and null.  It is based upon Javascript syntax but is distinct from it: some Javascript is not JSON, and some JSON is not Javascript.

The main differences between standard object and array literal notation and JSON notation are that all property names in a JSON object must be double-quoted strings and that trailing commas in objects and arrays are forbidden.  The main differences between standard number notation and JSON number notation are that in JSON leading zeroes are prohibited and the decimal point in a number must be followed by at least one digit.  The main differences between standard string notation and JSON string notation are that in JSON only a limited set of characters may be escaped in strings, certain control characters are prohibited in strings, the Unicode line separator (U+2028) and paragraph separator (U+2029) characters are permitted, and that strings must be double-quoted.  

The full JSON syntax is as follows:

	JSON = null
      or true or false
      or JSONNumber
      or JSONString
      or JSONObject
      or JSONArray

	JSONNumber = - PositiveNumber
            or PositiveNumber
	PositiveNumber = DecimalNumber
                or DecimalNumber . Digits
                or DecimalNumber . Digits ExponentPart
                or DecimalNumber ExponentPart
	DecimalNumber = 0
               or OneToNine Digits
	ExponentPart = e Exponent
              or E Exponent
	Exponent = Digits
          or + Digits
          or - Digits
	Digits = Digit
        or Digits Digit
	Digit = 0 through 9
	OneToNine = 1 through 9

	JSONString = ""
            or " StringCharacters "
	StringCharacters = StringCharacter
                  or StringCharacters StringCharacter
	StringCharacter = any character
                    except \" or \ or U+0000 through U+001F
                 or EscapeSequence
	EscapeSequence = \" or \/ or \\ or \b or \f or \n or \r or \t
                or \u HexDigit HexDigit HexDigit HexDigit
	HexDigit = 0 through 9
          or A through F
          or a through f

	JSONObject = { }
            or { Members }
	Members = JSONString : JSON
         or Members , JSONString : JSON

	JSONArray = [ ]
           or [ ArrayElements ]
	ArrayElements = JSON
               or ArrayElements , JSON

Insignificant whitespace may be present anywhere except within a JSONNumber (numbers must contain no whitespace) or JSONString (where it is interpreted as the corresponding character in the string, or would cause an error). The tab character (U+0009), carriage return (U+000D), line feed (U+000A), and space (U+0020) characters are the only valid whitespace characters.

**/

/**
JSON.parse(text[, reviver])
- text (String): The string to parse as JSON. See the JSON object for a description of JSON syntax.
- reviver (String): If a function, prescribes how the value originally produced by parsing is transformed, before being returned.

Parse a string as JSON, optionally transforming the value produced by parsing.
 
If a `reviver` is specified, the value computed by parsing is _transformed_ before being returned. Specifically, the computed value, and all its properties (beginning with the most nested properties and proceeding to the original value itself), are individually run through the reviver, which is called with the object containing the property being processed as `this` and with the property name as a string and the property value as arguments. If the reviver function returns `undefined`(or returns no value, e.g. if execution falls off the end of the function), the property is deleted from the object. Otherwise the property is redefined to be the return value.

The reviver is ultimately called with the empty string and the topmost value to permit transformation of the topmost value.  Be certain to handle this case properly, usually by returning the provided value, or `JSON.parse` will return `undefined`:

	var transformed =
	JSON.parse('{ "p ": 5}', function(k, v) { if (k ===  " ") return v; return v * 2\. });

	// transformed is { p: 1\. }

#### Example

	JSON.parse('{}'); // {}

	JSON.parse('true'); // true

	JSON.parse(' "foo "'); //  "foo "

	JSON.parse('[1\. 5\.  "false "]'); // [1\. 5\.  "false "]

	JSON.parse('null'); // null</pre>

**/

/**
JSON.stringify(value[, replacer [, space]])
- value (String): The value to convert to a JSON string.
- replacer (Function | Array): If a function, transforms values and properties encountered while stringifying; if an array, specifies the set of properties included in objects in the final string.
- space (String): Causes the resulting string to be pretty-printed.

Convert a value to JSON, optionally replacing values if a replacer function is specified, or optionally including only the specified properties if a replacer array is specified.

Properties of non-array objects are not guaranteed to be stringified in any particular order. Don't rely on ordering of properties within the same object within the stringification.

[[Boolean `Boolean`]], [[Number `Number`]], and [[String `String`]] objects are converted to the corresponding primitive values during stringification, in accord with the traditional conversion semantics.

If `undefined`, a function, or an XML value is encountered during conversion it is either omitted (when it is found in an object) or censored to `null` (when it is found in an array).
      

#### The `replacer` parameter

The replacer parameter can be either a function or an array. As a function, it takes two parameters, the key and the value being stringified. Initially it gets called with an empty key representing the object being stringified, and it then gets called for each property on the object or array being stringified. It should return the value that should be added to the JSON string, as follows:

* If you return a [[Number `Number`]], the string corresponding to that number is used as the value for the property when added to the JSON string.
* If you return a [[String `String`]], that string is used as the property's value when adding it to the JSON string.
* If you return a [[Boolean `Boolean]], `true` or `false` is used as the property's value, as appropriate, when adding it to the JSON string.
* If you return any other object, the object is recursively stringified into the JSON string, calling the replacer function on each property, unless the object is a function, in which case nothing is added to the JSON string.
* If you return `undefined`, the property is not included in the output JSON string. 

<Note>You can't use the replacer function to remove values from an array. If you return undefined or a function then null is used instead.</Note>

#### `space` argument

The space argument may be used to control spacing in the final string. If it is a number, successive levels in the stringification will each be indented by this many space characters (up to 10). If it is a string, successive levels will indented by this string (or the first ten characters of it).

	JSON.stringify({ a: 2 }, null,  "  ");   // '{\n  "a ": 2\n}'        

Using a tab character mimics standard pretty-print appearance:

	JSON.stringify({ uno: 1\. dos : 2 }, null, '\t')

	// returns the string:
	// '{            \
	//      "uno ": 1\. \
	//      "dos ": 2\. \
	// }'

#### toJSON behavior

If an object being stringified has a property named `toJSON` whose value is a function, then the `toJSON` method customizes JSON stringification behavior: instead of the object being serialized, the value returned by the `toJSON` method when called will be serialized. For example:

	var x = {
		foo: 'foo',
		toJSON: function () {
			return 'bar';
		}	
	};

	var json = JSON.stringify({x: x});

#### Example

	assert(JSON.stringify({}) === '{}');  
	assert(JSON.stringify(true) === 'true');  
	assert(JSON.stringify("foo") === '"foo"');  
	assert(JSON.stringify([1, "false", false]) === '[1,"false",false]');  
	assert(JSON.stringify({ x: 5 }) === '{"x":5}');  
	JSON.stringify({x: 5, y: 6}); // '{"x":5,"y":6}' or '{"y":6,"x":5}'  
        

	 function censor(key, value) {
	  if (typeof(value) == "string") {
	    return undefined;
	  }
	  return value;
	}

	var foo = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};
	var jsonString = JSON.stringify(foo, censor); // {"week":45,"month":7}

**/

