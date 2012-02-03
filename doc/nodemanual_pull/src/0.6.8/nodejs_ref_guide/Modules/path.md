
## class path

This module contains utilities for handling and transforming file paths. Add `require('path')` to your code to use this module.

Almost all these methods perform only string transformations. **The file system is not consulted to check whether paths are valid.** `path.exists` and `path.existsSync` are the exceptions, and should logically be found in the fs module as they do access the file system.


#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>




## path.normalize(p) -> String
- p (String):  The path to normalize

Normalize a string path, taking care of `'..'` and `'.'` parts.

When multiple slashes are found, they're replaced by a single one; when the path contains a trailing slash, it is preserved. On Windows backslashes are used. 

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.normalize.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





## path.join(path1, path2 [, paths...]) -> String
- path1 (String): The first path to join
- path2 (String): The second path to join
- paths (String): Additional paths to join

Join all arguments together and normalize the resulting path. Non-string arguments are ignored.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.join.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





## path.resolve([from ...], to)  -> String
- from (String): Paths to prepend (and append) to `to`
- to (String):  The path to resolve

Resolves `to` to an absolute path.

If `to` isn't already absolute, the `from` arguments are prepended in right to left order, until an absolute path is found. If, after using all the `from` paths still no absolute path is found, the current working directory is used as well. The resulting path is normalized, and trailing slashes are removed unless the path gets resolved to the root directory. Non-string arguments are ignored.

Another way to think of it is as a sequence of `cd` commands in a shell. The following call:

    path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')

is similar to:

    cd foo/bar
    cd /tmp/file/
    cd ..
    cd a/../subfile
    pwd

The difference is that the different paths don't need to exist and may also be files.

#### Examples

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.resolve.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





## path.relative(from, to) -> String
- from (String):  The starting path
- to (String):  To final path

Solve the relative path from `from` to `to`.

At times, you have two absolute paths, and you need to derive the relative path from one to the other. This is actually the reverse transform of [[path.resolve `path.resolve()`]], which means you'll see that:
   
   path.resolve(from, path.relative(from, to)) == path.resolve(to)

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.relative.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





## path.dirname(p) -> String
- p (String):  A path

Return the directory name of a path.  Similar to the Unix [`dirname`](http://www.kernel.org/doc/man-pages/online/pages/man3/basename.3.html) command.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.dirname.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





## path.basename(p, [ext]) -> String
- p (String):  A path
- ext (String): If provided, the extension to omit

Return the last portion of a path.  Similar to the Unix [`basename`](http://www.kernel.org/doc/man-pages/online/pages/man3/basename.3.html) command.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.basename.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





## path.extname(p) -> String
- p (String):  A path

Return the extension of the path, from the last '.' to end of string in the last portion of the path.  If there is no '.' in the last portion of the path or the first character of it is '.', then the method returns an empty string.  

#### Examples

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.extname.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





## path.exists(p [, callback(exists)]) -> String
- p (String):  A path to check
- callback (Function): A callback to execute once the method completes
- exists (Boolean):  This is `true` if the path actually exists

Tests whether or not the given path exists by checking with the file system.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/path/path.exists.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>





##  path.existsSync(p) -> Boolean
- p (String):  A path to check

The synchronous version of `path.exists`. Tests whether or not the given path exists by checking with the file system

#### Returns
`true` if the path exists, `false` otherwise.


