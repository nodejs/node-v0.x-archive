# Implementing Logging Messages

Logging isn't just something for beavers&mdash;it's also a function used by many processes, ranging from server tracking to debugging your own apps.

In Node.js, these logs are printed directly to your console. In fact, there's [a very useful global object _called_ `console`](../nodejs_ref_guide/console.html) that contains many methods, both blocking and non-blocking.

The most basic (and therefore, frequent) way to log your messages is to use the `console.log()` method:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/implementing_logging/implementing_logging.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Obviously, you can litter your code with a hundred of these, but you might be better off using a more legitimate debugging mechanism.