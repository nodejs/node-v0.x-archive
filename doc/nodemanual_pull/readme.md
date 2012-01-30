# Introduction

This is both the source documentation and build system for the [Node Manual](http://www.nodemanual.org). It consists of:

* Source files for the Node.js Reference Guide, Node.js tutorials, and Node.js Javascript Reference Guide (located in _src/_)
* A build system to generate this content (located at _build.js_)
* Resources such as CSS, Javascript, and images, for the final output (located at _resources/_)

The build system relies on two repos as submodules (both located under (_build/_):

* The [doc-build](https://github.com/c9/doc-build) system converts Markdown to HTML, and is used for the Node Manual documentation
* C9's fork of [ndoc](https://github.com/c9/ndoc), which takes Javascript source files and generates HTML documentation from the comments (also styled in Markdown)

Remember! After you clone this repo, call 

    git submodule init
    git submodule update
    npm install

It's worth noting that there is a [git commit hook](http://book.git-scm.com/5_git_hooks.html) running on the NodeManual server. Any pushes or merges into the master branch of this repo automatically rebuilds all versions of the documentation on the website.

# Running a Build

To run the build, open your command prompt and type:

    node build.js
    
This first launches doc-build, which reads _nodejs\_dev\_guide/_ and begins to assemble the subdirectory markdown files. These markdown files are modified, and placed into a `tmp` directory. From there, they are converted into HTML files, and placed into _out/_.

After that, ndoc runs across the files in _src/js\_doc_ and _src/nodejs\_ref\_guide_, and proceeds to convert them into HTML files also placed into the _out/_ directory. 

By default, this system builds every version of documentation listed under _src/nodejs_ref_guide_. You could also pass in one more argument to specify the Node.js source version. This can be one of the following values:

* The word "latest," which automatically builds the latest version.
* A string like `x.y.z`, where x, y, and z are all numerals, to build a specific version. For example, to build the 0.6.7 branch, type:

    node build.js 0.6.7

# Contributing

We'll very gladly take any pull requests for new documentation! This source material is intended to be open and sharable to all. 

# Copyright

Major content providers include:

* [Cloud9 IDE](http://www.c9.io)
* [Joyent](http://www.joyent.com/) (Node.js Reference)
* [Mozilla Foundation](http://www.mozilla.org/) (Javascript Reference)
* [Debuggable](http://www.debuggable.com/)


# License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/3.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/Text" property="dct:title" rel="dct:type">Node Manual</span> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/">Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License</a>.
