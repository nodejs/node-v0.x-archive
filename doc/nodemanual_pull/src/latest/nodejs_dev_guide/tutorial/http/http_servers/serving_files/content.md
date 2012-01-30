# Serving Static Files

Of course, having a server that prints messages only you can see is pretty terrible. You're going to want your server to load files to your users, right?

Again, in Node.js, this is not that difficult to accomplish: you read the file, and then you redirect to that file. Here's a quick example that does just that:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/serving_files/serving.files.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

How could something so simple go so wrong? Well, to begin with, there's no handling of MIME types, there's no caching, there's no real validation (sending a `404` is fine, but it should really redirect to another known page with some sort of apology).

Fortunately, several people have already thought of this, and written a couple of libraries to handle file serving in an efficient (and safe!) manner. You might want to check out both [node-static](https://github.com/cloudhead/node-static) and [http-server](https://github.com/nodeapps/http-server).