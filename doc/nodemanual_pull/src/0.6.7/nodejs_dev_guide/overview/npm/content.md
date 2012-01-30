# The Node Package Manager

"Modules" in Node.js are similar to libs in C or JAR files in Java. A module can be a single file (or a collection of files) that you include in your code for additional methods and functionality. Node.js is partially compatible with [the CommonJS securable module system](http://wiki.commonjs.org/wiki/Modules/1.1), so there's an entire set of specifications on how to create new modules. We won't get into that here.

Instead, here's how you can include a module into your project: 

	var fooModule = require('foo');
	
	fooModule.someNewFunction();
	
That's it! You call the global `require()` function, and assign it to a variable. That variable then contains the exported members of the `foo` module. This paradigm is essential to developing in Node.js, since all the core libraries are considered modules, and must be assigned in this way.

You can also specify a certain directory to look for a module:

	var farAway = require(../../../bar);

Technically, you don't even need to specify the `..` directory change. Node.js always looks in the curent directory for a module. If it doesn't find it, it walks up the directory, checking each parent, looking for either a file matching your module's name (`bar.js`), or, a folder called `node_modules` that contains your file. If it can't find a file matching your module name by the time it hits the root directory (`'/'`), Node.js throws an exception.

Now, the fun part: there's an entire ecosystem of passionate third-party and open source developers creating their own modules for Node.js. The Node Package Manager, or `npm`, is designed to be both a source of finding modules to install, and a way to manage module dependencies within your own projects.

Right after installing Node.js, you'll almost certainly want to install the [`npm`](http://npmjs.org/) command-line tool for managing packages. Once you've done that, you can start browsing the [npm registry](http://search.npmjs.org/) to find and install new packages.

#### Local and global installs 

There's a distinction worth pointing out when you first begin installing packages. By default, `npm` installs any modules you need in the current directory it's called at. Thus, if you're working on a project call `theLatestAndGreatest`, and you want to install [express](http://expressjs.com/), the package is only relative to your project. If you decide to work on a new project in a different directory called `thisIsIt`, you'll need to reinstall express again via npm.

To work around this, you could try installing Node.js packages globally. You can do this by specifying the `-g` switch on the command prompt. This installs the module in a special location that varies depending on your operating system. Any project you start can then safely `require()` modules.