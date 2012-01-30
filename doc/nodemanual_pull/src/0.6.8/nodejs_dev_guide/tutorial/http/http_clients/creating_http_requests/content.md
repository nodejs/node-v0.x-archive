# Creating HTTP GET and POST Requests

For client-side HTTP functionality, you might frequently find yourself making GET and POST requests to a server out on in the vastness of the Internet. We're going to be using [the same `http` module](../nodejs_ref_guide/http.html) used for creating servers. However, there are several objects contained within this module that can also handle client requests and responses.

To demonstrate this, let's take some content from a random Twitter user by [following their API](https://dev.twitter.com/docs/api/1/get/statuses/public_timeline), executing a GET request, and printing that information to a file:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/http_get_and_post/make.get.request.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Super simple, right? To be honest, adding `method: 'GET'` is a bit superfluous, since by default, `http.request()` executes a GET request. 

In order to change the request to a POST, we'll have to explicitly set that property. For this example, we'll be using [http://www.posttestserver.com](http://www.posttestserver.com/), which is a free server that publicly handles any data sent its way. Here's the Node.js code:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/http_get_and_post/make.post.request.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

The [`http.request()` documentation](../nodejs_ref_guide/http.html#http.request) has a list of all the possible properties on `options`, including sending authentication and adding custom headers.