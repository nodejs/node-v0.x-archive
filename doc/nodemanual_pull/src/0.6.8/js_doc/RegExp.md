
/** section: Javascript_Reference
class RegExp

This object provides a concise and flexible means for "matching" (specifying and recognizing) strings of text, such as particular characters, words, or patterns of characters. 


#### Special characters in regular expressions

 <table class="fullwidth-table"> <tbody> <tr> <td class="header">Character</td> <td class="header">Meaning</td> </tr> <tr> <td>\</td> <td> <p>For characters that are usually treated literally, indicates that the next character is special and not to be interpreted literally.</p> <p>For example, /b/ matches the character 'b'. By placing a backslash in front of b, that is by using /\b/, the character becomes special to mean match a word boundary.</p> <p><em>or</em></p> <p>For characters that are usually treated specially, indicates that the next character is not special and should be interpreted literally.</p> <p>For example, * is a special character that means 0 or more occurrences of the preceding character should be matched; for example, /a*/ means match 0 or more "a"s. To match * literally, precede it with a backslash; for example, /a\*/ matches 'a*'.</p> </td> </tr> <tr> <td>^</td> <td> <p>Matches beginning of input. If the multiline flag is set to true, also matches immediately after a line break character.</p> <p>For example, /^A/ does not match the 'A' in "an A", but does match the first 'A' in "An A."</p> </td> </tr> <tr> <td>$</td> <td> <p>Matches end of input. If the multiline flag is set to true, also matches immediately before a line break character.</p> <p>For example, /t$/ does not match the 't' in "eater", but does match it in "eat".</p> </td> </tr> <tr> <td>*</td> <td> <p>Matches the preceding item 0 or more times.</p> <p>For example, /bo*/ matches 'boooo' in "A ghost booooed" and 'b' in "A bird warbled", but nothing in "A goat grunted".</p> </td> </tr> <tr> <td>+</td> <td> <p>Matches the preceding item 1 or more times. Equivalent to {1,}.</p> <p>For example, /a+/ matches the 'a' in "candy" and all the a's in "caaaaaaandy".</p> </td> </tr> <tr> <td>?</td> <td> <p>Matches the preceding item 0 or 1 time.</p> <p>For example, /e?le?/ matches the 'el' in "angel" and the 'le' in "angle."</p> <p>If used immediately after any of the quantifiers *, +, ?, or {}, makes the quantifier non-greedy (matching the minimum number of times), as opposed to the default, which is greedy (matching the maximum number of times).</p> <p>Also used in lookahead assertions, described under (?=), (?!), and (?:) in this table.</p> </td> </tr> <tr> <td>.</td> <td> <p>(The decimal point) matches any single character except the newline characters: \n \r \u2028 or \u2029. ([\s\S] can be used to match any character including newlines.)</p> <p>For example, /.n/ matches 'an' and 'on' in "nay, an apple is on the tree", but not 'nay'.</p> </td> </tr> <tr> <td>(<em>x</em>)</td> <td> <p>Matches <em>x</em> and remembers the match. These are called capturing parentheses.</p> <p>For example, /(foo)/ matches and remembers 'foo' in "foo bar." The matched substring can be recalled from the resulting array's elements [1], ..., [n] or from the predefined RegExp object's properties $1, ..., $9.</p> </td> </tr> <tr> <td>(?:<em>x</em>)</td> <td> <p>Matches <em>x</em> but does not remember the match. These are called non-capturing parentheses. The matched substring can not be recalled from the resulting array's elements [1], ..., [n] or from the predefined RegExp object's properties $1, ..., $9.</p> </td> </tr> <tr> <td><em>x</em>(?=<em>y</em>)</td> <td> <p>Matches <em>x</em> only if <em>x</em> is followed by <em>y</em>. For example, /Jack(?=Sprat)/ matches 'Jack' only if it is followed by 'Sprat'. /Jack(?=Sprat|Frost)/ matches 'Jack' only if it is followed by 'Sprat' or 'Frost'. However, neither 'Sprat' nor 'Frost' is part of the match results.</p> </td> </tr> <tr> <td><em>x</em>(?!<em>y</em>)</td> <td> <p>Matches <em>x</em> only if <em>x</em> is not followed by <em>y</em>. For example, /\d+(?!\.)/ matches a number only if it is not followed by a decimal point.</p> <p>/\d+(?!\.)/.exec("3.141") matches 141 but not 3.141.</p> </td> </tr> <tr> <td><em>x</em>|<em>y</em></td> <td> <p>Matches either <em>x</em> or <em>y</em>.</p> <p>For example, /green|red/ matches 'green' in "green apple" and 'red' in "red apple."</p> </td> </tr> <tr> <td>{<em>n</em>}</td> <td> <p>Where <em>n</em> is a positive integer. Matches exactly <em>n</em> occurrences of the preceding item.</p> <p>For example, /a{2}/ doesn't match the 'a' in "candy," but it matches all of the a's in "caandy," and the first two a's in "caaandy."</p> </td> </tr> <tr> <td>{<em>n</em>,}</td> <td> <p>Where <em>n</em> is a positive integer. Matches at least <em>n</em> occurrences of the preceding item.</p> <p>For example, /a{2,}/ doesn't match the 'a' in "candy", but matches all of the a's in "caandy" and in "caaaaaaandy."</p> </td> </tr> <tr> <td>{<em>n</em>,<em>m</em>}</td> <td> <p>Where <em>n</em> and <em>m</em> are positive integers. Matches at least <em>n</em> and at most <em>m</em> occurrences of the preceding item.</p> <p>For example, /a{1,3}/ matches nothing in "cndy", the 'a' in "candy," the first two a's in "caandy," and the first three a's in "caaaaaaandy". Notice that when matching "caaaaaaandy", the match is "aaa", even though the original string had more a's in it.</p> </td> </tr> <tr> <td>[xyz]</td> <td> <p>A character set. Matches any one of the enclosed characters. You can specify a range of characters by using a hyphen.</p> <p>For example, [abcd] is the same as [a-d]. They match the 'b' in "brisket" and the 'c' in "chop".</p> </td> </tr> <tr> <td>[^xyz]</td> <td> <p>A negated or complemented character set. That is, it matches anything that is not enclosed in the brackets. You can specify a range of characters by using a hyphen.</p> <p>For example, [^abc] is the same as [^a-c]. They initially match 'r' in "brisket" and 'h' in "chop."</p> </td> </tr> <tr> <td>[\b]</td> <td> <p>Matches a backspace. (Not to be confused with \b.)</p> </td> </tr> <tr> <td>\b</td> <td> <p>Matches a word boundary, such as a space. (Not to be confused with [\b].)</p> <p>For example, /\bn\w/ matches the 'no' in "noonday"; /\wy\b/ matches the 'ly' in "possibly yesterday."</p> </td> </tr> <tr> <td>\B</td> <td> <p>Matches a non-word boundary.</p> <p>For example, /\w\Bn/ matches 'on' in "noonday", and /y\B\w/ matches 'ye' in "possibly yesterday."</p> </td> </tr> <tr> <td>\c<em>X</em></td> <td> <p>Where <em>X</em> is a letter from A - Z. Matches a control character in a string.</p> <p>For example, /\cM/ matches control-M in a string.</p> </td> </tr> <tr> <td>\d</td> <td> <p>Matches a digit character in the basic Latin alphabet. Equivalent to [0-9].</p> <p><strong>Note</strong>: In Firefox 2 and earlier, matches a digit character from any alphabet. (
<a rel="external" href="https://bugzilla.mozilla.org/show_bug.cgi?id=378738" class="external" title="VERIFIED FIXED - \d pattern matches characters other than the decimal digits 0-9 (ecma_3/RegExp/15.10.2.12.js)">
bug 378738</a>
)</p> <p>For example, /\d/ or /[0-9]/ matches '2' in "B2 is the suite number."</p> </td> </tr> <tr> <td>\D</td> <td> <p>Matches any character that is not a digit in the basic Latin alphabet. Equivalent to [^0-9].</p> <p><strong>Note</strong>: In Firefox 2 and earlier, excludes digit characters from all alphabets. (
<a rel="external" href="https://bugzilla.mozilla.org/show_bug.cgi?id=378738" class="external" title="VERIFIED FIXED - \d pattern matches characters other than the decimal digits 0-9 (ecma_3/RegExp/15.10.2.12.js)">
bug 378738</a>
)</p> <p>For example, /\D/ or /[^0-9]/ matches 'B' in "B2 is the suite number."</p> </td> </tr> <tr> <td>\f</td> <td> <p>Matches a form-feed.</p> </td> </tr> <tr> <td>\n</td> <td> <p>Matches a linefeed.</p> </td> </tr> <tr> <td>\r</td> <td> <p>Matches a carriage return.</p> </td> </tr> <tr> <td>\s</td> <td> <p>Matches a single white space character, including space, tab, form feed, line feed and other unicode spaces. This is equivalent to `[\t\n\v\f\r \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]`.
</p> <p>For example, /\s\w*/ matches ' bar' in "foo bar."</p> </td> </tr> <tr> <td>\S</td> <td> <p>Matches a single character other than white space. This is equivalent to `[^\t\n\v\f\r \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]`.</p> <p>For example, /\S\w*/ matches 'foo' in "foo bar."</p> </td> </tr> <tr> <td>\t</td> <td> <p>Matches a tab.</p> </td> </tr> <tr> <td>\v</td> <td> <p>Matches a vertical tab.</p> </td> </tr> <tr> <td>\w</td> <td> <p>Matches any alphanumeric character from the basic Latin alphabet, including the underscore. Equivalent to [A-Za-z0-9_].</p> <p>For example, /\w/ matches 'a' in "apple," '5' in "$5.28," and '3' in "3D."</p> </td> </tr> <tr> <td>\W</td> <td> <p>Matches any character that is not a word character from the basic Latin alphabet. Equivalent to [^A-Za-z0-9_].</p> <p>For example, /\W/ or /[^A-Za-z0-9_]/ matches '%' in "50%."</p> </td> </tr> <tr> <td>\<em>n</em></td> <td> <p>Where <em>n</em> is a positive integer. A back reference to the last substring matching the n parenthetical in the regular expression (counting left parentheses).</p> <p>For example, /apple(,)\sorange\1/ matches 'apple, orange,' in "apple, orange, cherry, peach." A more complete example follows this table.</p> </td> </tr> <tr> <td>\0</td> <td> <p>Matches a NUL character. Don't follow this with another digit.</p> </td> </tr> <tr> <td>\x<em>hh</em></td> <td> <p>Matches the character with the code <em>hh</em> (two hexadecimal digits)</p> </td> </tr> <tr> <td>\u<em>hhhh</em></td> <td> <p>Matches the character with the Unicode value <em>hhhh</em> (four hexadecimal digits).</p> </td> </tr> </tbody>
</table>


The literal notation provides compilation of the regular expression when the expression is evaluated. Use literal notation when the regular expression will remain constant. For example, if you use literal notation to construct a regular expression used in a loop, the regular expression won't be recompiled on each iteration.

The constructor of the regular expression object, for example, new RegExp("ab+c"), provides runtime compilation of the regular expression. Use the constructor function when you know the regular expression pattern will be changing, or you don't know the pattern and are getting it from another source, such as user input.

#### Example: Using a regular expression to change data format

The following script uses the [replace](https://developer.mozilla.org/en/Javascript/Reference/Global_Objects/String/replace "en/Javascript/Reference/Global_Objects/String/replace") method inherited by the [String](https://developer.mozilla.org/en/Javascript/Reference/Global_Objects/String "en/Javascript/Reference/Global_Objects/String") instance to match a name in the format _first last_ and output it in the format _last_, _first_. In the replacement text, the script uses `$1\. and `$2\. to indicate the results of the corresponding matching parentheses in the regular expression pattern.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/RegExp/regexp.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
  
#### Example: Using a regular expression with the "sticky" flag

This example demonstrates how one could use the sticky flag on regular expressions to match individual lines of multiline input.
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/RegExp/regexp.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
            
One can test at run-time whether the sticky flag is supported, using `try{...} catch{...}`. For this, either an `eval(...)` expression or the `RegExp(regex-string,flags-string)` syntax must be used (since the `/regex/flags` notation is processed at compile-time, so throws an exception before the `catch` block is encountered). For example:
    
    var supports_sticky;
    try { RegExp('','y'); supports_sticky = true; }
    catch(e) { supports_sticky = false; }
    console.log(supports_sticky);
             

#### See also

* [Regular Expressions](https://developer.mozilla.org/en/Javascript/Guide/Regular_Expressions) chapter in the [Javascript Guide](https://developer.mozilla.org/en/Javascript/Guide)

</ul>


**/


/**
	new RegExp(pattern [, flags])
- pattern (String): The text of the regular expression.
- flags (String):  Any additional parameters to use in the regular expression

Creates a regular expression object for matching text with a pattern.

Regular expressions can also be constructed with the following notation: `/pattern/flags`.

 If specified, `flags` can have any combination of the following values:
* `g`: global match 
* `i`: ignore case
* `m`: Treat beginning and end characters (^ and $) as working over multiple lines (i.e., match the beginning or end of each line (delimited by \n or \r), not only the very beginning or end of the whole input string)
* `y`: sticky; matches only from the index indicated by the lastIndex property of this regular expression in the target string (and does not attempt to match from any later indexes). This allows the match-only-at-start capabilities of the character "^" to effectively be used at any location in a string by changing the value of the lastIndex property.


When using the constructor function, the normal string escape rules (preceding special characters with \ when included in a string) are necessary. For example, the following are equivalent:

		var re = new RegExp("\\w+");  
		var re = /\w+/;  

Notice that the parameters to the literal format don't use quotation marks to indicate strings, while the parameters to the constructor function do use quotation marks. So the following expressions create the same regular expression:

	/ab+c/i;  
	new RegExp("ab+c", "i"); 

**/

/** read-only
RegExp.global -> Boolean

`global` is a property of an individual regular expression object.

The value of `global` is true if the "`g`" flag was used; otherwise, `false`. The "`g`" flag indicates that the regular expression should be tested against all possible matches in a string.

You can't change this property directly.

**/

/** read-only
RegExp.ignoreCase -> Boolean

`ignoreCase` is a property of an individual regular expression object.

The value of `ignoreCase` is true if the "`i`" flag was used; otherwise, false. The "`i`" flag indicates that case should be ignored while attempting a match in a string.

You can't change this property directly.

**/

/** read-only
RegExp.multiline -> Boolean

`multiline` is a property of an individual regular expression object.

The value of `multiline` is true if the "`m`" flag was used; otherwise, false. The "`m`" flag indicates that a multiline input string should be treated as multiple lines. For example, if "`m`" is used, "`^`" and "`$`" change from matching at only the start or end of the entire string to the start or end of any line within the string.

You can't change this property directly.

**/

/**
RegExp.lastIndex -> Number

A read/write integer property that specifies the index at which to start the next match.

This property is set only if the regular expression used the "`g`" flag to indicate a global search. The following rules apply:

* If `lastIndex` is greater than the length of the string, `regexp.test` and `regexp.exec` fail, and `lastIndex` is set to 0.
* If `lastIndex` is equal to the length of the string and if the regular expression matches the empty string, then the regular expression matches input starting at `lastIndex`.
* If `lastIndex` is equal to the length of the string and if the regular expression does not match the empty string, then the regular expression mismatches input, and `lastIndex` is reset to 0.
* Otherwise, `lastIndex` is set to the next position following the most recent match.

For example, consider the following sequence of statements:

* `re = /(hi)?/g`: Matches the empty string.
* `re("hi")`: Returns `["hi", "hi"]` with `lastIndex` equal to 2
* `re("hi")`: Returns `[""]`, an empty array whose zeroth element is the match string. In this case, the empty string because `lastIndex` was 2 (and still is 2) and "`hi`" has length 2.

**/

/** read-only
RegExp.source -> String

`source` is a property of an individual regular expression object.

This property contains the text of the pattern, excluding the forward slashes.

You can't change this property directly.

**/

/**
RegExp.test([str])  -> Boolean
- str (String): The string against which to match the regular expression.

 Executes the search for a match between a regular expression and a specified string. Returns `true` or `false`.

When you want to know whether a pattern is found in a string use the `test` method (similar to the [[String.search `String.search()`]]; for more information (but slower execution) use the [[RegExp.exec `exec()`]] method (similar to the [[String.match `String.match()`]] method). As with `exec()` (or in combination with it), `test` called multiple times on the same global regular expression instance will advance past the previous match.


#### Example: Using `test()`

The following example prints a message which depends on the success of the test:
    
<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/RegExp/regexp.test.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>  

**/

/**
RegExp.exec(str) -> Array | null
- str (String): The string against which to match the regular expression.

Executes a search for a match in a specified string. Returns a result array, or `null`.


If the match succeeds, the `exec()` method returns an array and updates properties of the regular expression object. The returned array has the matched text as the first item, and then one item for each capturing parenthesis that matched containing the text that was captured. If the match fails, the `exec` method returns `null`.

If you are executing a match simply to find true or false, use the [[RegExp.test `test()`]] method or the [[String.search `String.search()`]] method.

#### Example

Consider the following example:

	// Match one d followed by one or more b's followed by one d
	// Remember matched b's and the following d
	// Ignore case

	var re = /d(b+)(d)/ig;

	var result = re.exec("cdbBdbsbz");

        

The following table shows the results for this script:

<table class = \"fullwidth-table\"> <tbody> <tr> <td class = \"header\">Object</td> <td class = \"header\">Property/Index</td> <td class = \"header\">Description</td> <td class = \"header\">Example</td> </tr> <tr> <td rowspan = \"5\"><code>result</code></td> <td><code>&nbsp;</code></td> <td>The content of <code>myArray</code>.</td> <td><code>[&quot;dbBd&quot;, &quot;bB&quot;, &quot;d&quot;]</code></td> </tr> <tr> <td><code>index</code></td> <td>The 0-based index of the match in the string.</td> <td><code>1</code></td> </tr> <tr> <td><code>input</code></td> <td>The original string.</td> <td><code>cdbBdbsbz</code></td> </tr> <tr> <td><code>[0]</code></td> <td>The last matched characters</td> <td><code>dbBd</code></td> </tr> <tr> <td><code>[1], ...[<em>n</em>]</code></td> <td>The parenthesized substring matches, if any. The number of possible parenthesized substrings is unlimited.</td> <td><code>[1] = bB<br/> [2] = d</code></td> </tr> <tr> <td rowspan = \"5\"><code>re</code></td> <td><code>lastIndex</code></td> <td>The index at which to start the next match.</td> <td><code>5</code></td> </tr> <tr> <td><code>ignoreCase</code></td> <td>Indicates if the &quot;<code>i</code>&quot; flag was used to ignore case.</td> <td><code>true</code></td> </tr> <tr> <td><code>global</code></td> <td>Indicates if the &quot;<code>g</code>&quot; flag was used for a global match.</td> <td><code>true</code></td> </tr> <tr> <td><code>multiline</code></td> <td>Indicates if the &quot;<code>m</code>&quot; flag was used to search in strings across multiple line.</td> <td><code>false</code></td> </tr> <tr> <td><code>source</code></td> <td>The text of the pattern.</td> <td><code>d(b+)(d)</code></td> </tr> </tbody></table>

#### Example: Exec with the "global" flag

If your regular expression uses the "`g`" flag, you can use the `exec` method multiple times to find successive matches in the same string. When you do so, the search starts at the substring of `str` specified by the regular expression's `lastIndex` property ([[RegExp.test `test()`]] will also advance the `lastIndex` property). For example, assume you have this script:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/RegExp/regexp.exec.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
        

This script displays the following text:

	Found abb. Next match starts at 3
	Found ab. Next match starts at 9

You can also use `exec()` without creating a RegExp object:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/js_doc/RegExp/regexp.exec.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

This will display an alert containing 'hello world!'.

**/

/**
RegExp.toString() -> String

The `RegExp` object overrides the `toString` method of the `[Object]` object; it does not inherit [[Object.toString `Object.toString()`]]. For `RegExp` objects, the `toString` method returns a string representation of the regular expression.


#### Example: Using toString
 The following example displays the string value of a RegExp object:
    
	var myExp = new RegExp("a+b+c");
	console.log(myExp.toString()); // displays "/a+b+c/"
    

**/

