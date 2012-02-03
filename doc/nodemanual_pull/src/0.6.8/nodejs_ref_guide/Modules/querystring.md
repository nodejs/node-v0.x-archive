
## class querystring

This module provides utilities for dealing with query strings in URLs. To include this module, add `require('querystring')` to your code.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/querystring/querystring.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## querystring.escape() -> String

The escape function used by `querystring.stringify()`, provided so that it can be overridden, if necessary.

 



## querystring.parse(str [, sep='&'] [, eq='=']) -> Object
- str (String): The query string to parse
- sep (String): The separator character
- eq (String): The equivalency character

Deserialize a query string to an object and returns it. You can choose to override the default separator and assignment characters.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/querystring/querystring.parse.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
  
 



## querystring.stringify(obj [, sep='&'] [, eq='=']) -> String
- obj (Object):  The JSON object to serialize
- sep (String): The separator character
- eq (String): The equivalency character

Serialize an object to a query string and returns it. You can choose to override the default separator and assignment characters.

#### Examples

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/querystring/querystring.stringify.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
 



## querystring.unescape()  -> String

The `unescape()` function, used by `querystring.parse()`, is provided so that it can be overridden if necessary.




