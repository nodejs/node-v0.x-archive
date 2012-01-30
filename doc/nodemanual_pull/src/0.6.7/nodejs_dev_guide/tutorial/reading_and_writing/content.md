# Reading and Writing Files

Everybody should be able to read, and Node.js is no different. File I/O is very interesting with Node.js, because it's one of the few modules with both asynchronous and synchronous operations for the same functions.

But wait! Doesn't everyone (including this manual) say, "**Don't use the synchronous functions!**" Not quite&mdash;everyone simply _advises against it_ (including this manual). There are _some_ legitimate cases for reading a file in a blocking manner; for example, if you need to parse some configuration data or a password before continuing with the rest of your code. This happens on a case-by-case basis, so there's no rule that dictates when you should and shouldn't be blocking.

You can refer to the file system methods in full by reading [the Node.js API Reference documentation on the `fs` module](../nodejs_ref_guide/fs.html).

#### Reading a file

Here's a quick example that you've probably seen before: asynchronously reading a file, and printing its contents to the console:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/fs/fs.read.file.1.js?linestart=0&lineend=0&showlines=false' defer='defer'></script>

Now, what happens if you try to read a file that doesn't exist (or that, for some reason, you don't have access to)? Let's find out:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/fs/fs.read.file.2.js?linestart=0&lineend=0&showlines=false' defer='defer'></script>

You should get some output that's vastly different:

    { stack: [Getter/Setter],
      arguments: undefined,
      type: undefined,
      message: 'ENOENT, No such file or directory \'/doesnt/exist\'',
      errno: 2,
      code: 'ENOENT',
      path: '/doesnt/exist' }

This output is a printout of [the global `Error` object](../js_doc/Error.html). Although it's a bit cryptic, it provides a general outline of how and why your code execution failed.

#### Writing to a file

Similarly, writing to a file is pretty easy to grok:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/fs/fs.write.file.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Now, try and run this code sample:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/fs/fs.read.write.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

It might cause a crash. That's ok. Or, in fact, it might not. Can you see what's wrong?

Since the writing of the file is happening asynchronously, Node.js continues it's merry way, getting ready to read the file. And there's the rub: the file you're trying to read _might not exist yet_. 

How can you get around this? Well, you _could_ perform the same task synchronusly:

	var fs = require('fs');

	var goodWords = "Yet today I consider myself the luckiest man on the face of this earth.";

	fs.writeFileSync('lou.txt', someText);

	fs.readFile('lou.txt', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  
	  console.log(data);
	});

But that's silly. Why not make it _all_ asynchronous?

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_dev_guide/fs/fs.read.write.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

When the reading ends, the writing begins. Another, more advanced alternative, is to take a look at [streams](understanding_streams.html).