Node.js
=======

Evented I/O for V8 JavaScript
-----------------------------


Installation
------------

### Uninstall

    cd ~/Sources/node       # or wherever you store the source code
    git stash               # or git commit if you have uncommitted changes
    git checkout `node -v`  # checkout the version of node currently installed
    make uninstall
    git checkout master
    git stash pop           # get back changes if you stashed them

### Clean

    make clean

### Install

    git clone git://github.com/ry/node.git; cd node
    git tag -l           # list past versions
    git checkout v0.2.3  # or whichever version you'd like to install
    ./configure
    make
    make install  # permission errors? if you have a single-user macheine, do:
    sudo chown -R $USER /usr/local  # see github.com/isaacs/npm for more info
    make install  # then, try again
    git checkout master

### Test

    make test

### Documentation

    make doc        # to build
    man doc/node.1  # to read

### Upgrade

Just uninstall & reinstall per the instructions above.


Mailing List
------------

For help and discussion subscribe to the mailing list by visiting
<http://groups.google.com/group/nodejs> or by sending an email to
<nodejs+subscribe@googlegroups.com>.


Meta
----

* Home: <http://nodejs.org/>
* Repo: <http://github.com/ry/node>
* Code: `git clone git://github.com/ry/node.git`


This project uses [Semantic Versioning][sv].

[sv]: http://semver.org/
