### section: Global_Objects
## Global_Objects

These objects are available to all modules. Some of these objects aren't actually in the global scope, but in the module scope; they'll be noted as such below.

<dl> 
<dt>`__dirname`</dt>
<dd>The name of the directory that the currently executing script resides in. `__dirname` isn't actually on the global scope, but is local to each module.</dd>
<dd>For example, if you're running `node example.js` from `/Users/mjr`:
    
<pre class="prettyprint">
    console.log(__dirname);
    // prints /Users/mjr
</pre>
</dd>

<dt>`__filename`</dt>
<dd>The filename of the code being executed.  This is the resolved absolute path of this code file.  For a main program this is not necessarily the same filename used in the command line.  The value inside a module is the path to that module file.</dd>
<dd>`__filename` isn't actually on the global scope, but is local to each module.</dd>
<dd>For example, if you're running `node example.js` from `/Users/mjr`:
   
<pre class="prettyprint"> 
    console.log(__filename);
    // prints /Users/mjr/example.js
</pre>
</dd>

<dt>Buffer</dt>
<dd>Used to handle binary data. See the [buffers](buffer.html) section for more information.</dd>

<dt>`console`</dt>
<dd>Used to print to stdout and stderr. See the [stdio](console.html) section for more information.</dd>

<dt>`exports`</dt>
<dd>An object which is shared between all instances of the current module and made accessible through `require()`.</dd>
<dd>`exports` is the same as the `module.exports` object. See `src/node.js` for more information.</dd>
<dd>`exports` isn't actually on the global scope, but is local to each module.</dd>

<dt>`global`</dt>
<dd>The global namespace object.</dd>
<dd>In browsers, the top-level scope is the global scope. That means that in browsers if you're in the global scope `var something` will define a global variable. In Node.js this is different. The top-level scope is not the global scope; `var something` inside a Node.js module is local only to that module.</dd>

<dt>`module`</dt>
<dd>A reference to the current module. In particular `module.exports` is the same as the `exports` object. See `src/node.js` for more information.</dd>
<dd>`module` isn't actually on the global scope, but is local to each module.</dd>

<dt>`process`</dt>
<dd>The process object. See the [process object](process.html) section for more information.</dd>

<dt>`require()`</dt>
<dd>This is necessary to require modules. See the [Modules](modules.html) section for more information.</dd>
<dd>`require` isn't actually on the global scope, but is local to each module.</dd>

<dt>`require.cache`</dt>
<dd>Modules are cached in this object when they are required. By deleting a key value from this object, the next `require` will reload the module.</dd>

<dt>`require.resolve()`</dt>
<dd>Use the internal `require()` machinery to look up the location of a module, but rather than loading the module, just return the resolved filename.</dd>

<dt>`setTimeout(cb, ms)`<br/>
`clearTimeout(t)`<br/>
`setInterval(cb, ms)`<br/>
`clearInterval(t)`</dt>
<dd>These timer functions are all global variables. See the [timer](timer.html) section for more information.</dd>

