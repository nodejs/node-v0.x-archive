# Deciphering Query Strings

Often times when working with GET and POST requests, you'll need to manipulate the query string parameters in a URL to gain access or accomplish something you desire&mdash;or even just parsing what a web server is telling you.

In Node.js, both the creation and parsing of query strings are interpreted as JSON objects that you can easily manipulate. To show this off, let's first make  to aid in the accessing of URL query string parameters is built into the standard library. The `url.parse()` method takes care of most of the heavy lifting.  Here is an example script using this handy function and an explanation on how it works:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/http_query_strings/querystring.example.1.js?linestart=3&lineend=0&showlines=false&skipc9=true' defer='defer'></script> 

You can see that the `post_data` object has all the query string "stuff" that we want to send to the server.

What if we receive a bunch of query string nonsense from a server? Grabbing that information is just as easy:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/http_query_strings/querystring.example.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script> 