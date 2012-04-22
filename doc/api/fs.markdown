## fs

    Stability: 3 - Stable

In Node.js, file input and output is provided by simple wrappers around standard [POSIX functions](http://en.wikipedia.org/wiki/POSIX). All the read and write methods methods have asynchronous and synchronous forms. To use this module, include `require('fs')` in your code. 

The asynchronous form always take a completion callback as its last argument. The arguments passed to the completion callback depend on the method, but the first argument is always reserved for an exception. If the operation was completed successfully, then the first argument will be `null` or `undefined`.

When using the synchronous form, any exceptions are immediately thrown. You can use `try/catch` to handle exceptions, or allow them to bubble up. 

In busy processes, the programmer is **strongly encouraged** to use the asynchronous versions of these calls. The synchronous versions block the entire process until they complete—halting all connections. However, with the asynchronous methods, there is no guaranteed ordering.

Note: When processing files, relative paths to filename can be used; however, this path is relative to [[process.cwd `process.cwd()`]].

#### Example: An asynchronous file delete:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/fs/fs.ex.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: A synchronous file delete:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/fs/fs.ex.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

#### Example: Handling timing issues with callback

Here's an example of the **wrong** way to perform more than one asynchronous operation:

    fs.rename('/tmp/hello', '/tmp/world', function (err) {
      if (err) throw err;
      console.log('renamed complete');
    });
		// ERROR: THIS IS NOT CORRECT!
    fs.stat('/tmp/world', function (err, stats) {
      if (err) throw err;
      console.log('stats: ' + JSON.stringify(stats));
    });

In the example above, it could be that `fs.stat` is executed before `fs.rename`. The correct way to do this is to chain the callbacks, like this:

    fs.rename('/tmp/hello', '/tmp/world', function (err) {
      if (err) throw err;
      fs.stat('/tmp/world', function (err, stats) {
        if (err) throw err;
        console.log('stats: ' + JSON.stringify(stats));
      });
    });


### fs.rename(path1, path2 [, callback])
- path1 {String}  The original filename and path
- path2 {String}  The new filename and path
- callback {Function}    An optional callback to execute once the function completes
- err {Error} The possible exception

An asynchronous [rename(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/rename.2.html) operation. Turns `path1` into `path2`.



 


### fs.renameSync(path1, path2)
- path1 {String}  The original filename and path
- path2 {String}  The new filename and path

A synchronous [rename(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/rename.2.html) operation. Turns `path1` into `path2`.

 

### fs.truncate(fd, len [, callback(err)])
- fd {Number}  The file descriptor
- len {Number}  The final file length
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [ftruncate(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/truncate.2.html). It truncates a file to the specified length.

 



### fs.truncateSync(fd, len)
- fd {Number}  The file descriptor
- len {Number}  The final file length 

A synchronous [ftruncate(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/truncate.2.html). It truncates a file to the specified length.

 



### fs.chown(path, uid, gid [, callback(err)])
- path {String}  The path to the file
- uid {Number}  The new owner id
- gid {Number}  The new group id
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [chown(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/chown.2.html). This changes the ownership of the file specified by `path`, which is de-referenced if it is a symbolic link.

 



### fs.chownSync(path, uid, gid)
- path {String}  The path to the file
- uid {Number}  The new owner id
- gid {Number}  The new group id

A synchronous [chown(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/chown.2.html). This changes the ownership of the file specified by `path`, which is dereferenced if it is a symbolic link

 


### fs.fchown(fd, uid, gid, [callback(err)])
- path {String}  The path to the file
- uid {Number}  The new owner id
- gid {Number}  The new group id
- callback {Function}  An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [fchown(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/fchown.2.html). This changes the ownership of the file referred to by the open file descriptor fd.

 


### fs.fchownSync(fd, uid, gid)
- path {String}  The path to the file
- uid {Number}  The new owner id
- gid {Number}  The new group id

A synchronous [fchown(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/fchown.2.html). This changes the ownership of the file referred to by the open file descriptor fd.

 



### fs.lchown(path, uid, gid, [callback(err)])
- path {String}  The path to the file
- uid {Number}  The new owner id
- gid {Number}  The new group id
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [lchown(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/lchown.2.html). This is like [[fs.chown `chown()`]], but doesn't dereference symbolic links.

 



### fs.lchownSync(path, uid, gid)
- path {String}  The path to the file
- uid {Number}  The new owner id
- gid {Number}  The new group id

Synchronous [lchown(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/lchown.2.html). This is like [[fs.chownSync `chownSync()`]], but doesn't dereference symbolic links

 



### fs.chmod(path, mode, [callback(err)])
- path {String}  The path to the file
- mode {Number}  The new permissions
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [chmod(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/chmod.2.html). This changes the permissions of the file specified whose, which is dereferenced if it is a symbolic link.

 



### fs.chmodSync(path, mode)
- path {String}  The path to the file
- mode {Number}  The new permissions

A synchronous [chmod(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/chmod.2.html). This changes the permissions of the file specified whose, which is dereferenced if it is a symbolic link.

 



### fs.fchmod(fd, mode, [callback(err)])
- fd {Number}  The file descriptor
- mode {Number}  The new permissions
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [fchmod(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/fchmod.2.html). This changes the permissions of the file referred to by the open file descriptor.

 



### fs.fchmodSync(fd, mode)
- fd {Number}  The file descriptor
- mode {Number}  The new permissions

A synchronous [fchmod(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/fchmod.2.html). This changes the permissions of the file referred to by the open file descriptor.

 



### fs.lchmod(path, mode, [callback()])
- path {String}  The path to the file
- mode {Number}  The new permissions
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [lchmod(2)](http://www.daemon-systems.org/man/lchmod.2.html). This is like [[fs.chmod `chmod()`]] except in the case where the named file is a symbolic link, in which case `lchmod()` sets the permission bits of the link, while `chmod()` sets the bits of the file the link references.

 



### fs.lchmodSync(path, mode)
- path {String}  The path to the file
- mode {Number}  The new permissions

A synchronous [lchmod(2)](http://www.daemon-systems.org/man/lchmod.2.html). This is like [[fs.chmodSync `chmodSync()`]]except in the case where the named file is a symbolic link, in which case `lchmod()` sets the permission bits of the link, while `chmod()` sets the bits of the file the link references.

 



### fs.stat(path, [callback(err, stats)]), fs.Stats
- path {String}  The path to the file
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception
- stats {fs.Stats}   An [[fs.Stats `fs.Stats`] object.

An asynchronous [stat(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/stat.2.html). 

 



### fs.lstat(path, [callback(err, stats)]), fs.Stats
- path {String}  The path to the file
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception
- stats {fs.Stats}   An [[fs.Stats `fs.Stats`] object.

An asynchronous [lstat(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/stat.2.html). 


 



### fs.fstat(fd, [callback(err, stats)]), fs.Stats
- fd {Number}  The file descriptor
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception
- stats {fs.Stats}   An [[fs.Stats `fs.Stats`]] object.

An asynchronous [fstat(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/stat.2.html). 

 



### fs.statSync(path), fs.Stats
- path {String}  The path to the file

A synchronous [stat(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/stat.2.html).

 



### fs.lstatSync(path), fs.Stats
- path {String}  The path to the file

A synchronous [lstat(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/stat.2.html).

 



### fs.fstatSync(fd), fs.Stats
- fd {Number}  The file descriptor

A synchronous [fstat(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/stat.2.html). 

 



### fs.link(srcpath, dstpath, [callback(err)])
- srcpath {String}  The original path of a file
- dstpath {String}  The new file link path
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [link(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/link.2.html).

 



### fs.linkSync(srcpath, dstpath)
- srcpath {String}  The original path of a file
- dstpath {String}  The new file link path

A synchronous [link(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/link.2.html).

 



### fs.symlink(linkdata, path, [type='file'], [callback(err)])
- linkdata {String}  The original path of a file
- path {String}  The new file link path
- type {String}  This can be either `'dir'` or `'file'`.  It is only used on Windows ( andignored on other platforms)
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [symlink(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/symlink.2.html).

 



### fs.symlinkSync(linkdata, path, [type='file'])
- linkdata {String}  The original path of a file
- path {String}  The new file link path
- type {String}  This can be either `'dir'` or `'file'`.  It is only used on Windows ( andignored on other platforms)

A synchronous [symlink(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/symlink.2.html).

 



### fs.readlink(path, [callback(err, linkString)])
- path {String}  The original path of a link
- callback {Function}   An optional callback to execute once the function completes
- err {Error}  The possible exception
- linkString {String} T he symlink's string value
 
An asynchronous [readlink(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/readlink.2.html).

 



### fs.readlinkSync(path), String
- path {String}  The original path of a link

A synchronous [readlink(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/readlink.2.html).

#### Returns

The symbolic link's string value.

 



### fs.realpath(path, [callback(err, resolvedPath)])
- path {String}  A path to a file
- callback {Function}   An optional callback to execute once the function completes
- err {Error}  The possible exception
- resolvedPath {String} The resolved path string

An asynchronous [realpath(3)](http://www.kernel.org/doc/man-pages/online/pages/man3/realpath.3.html). You can use [[process.cwd `process.cwd()`]] to resolve relative paths.


 



### fs.realpathSync(path), String
- path {String}  A path to a file

A synchronous [realpath(3)](http://www.kernel.org/doc/man-pages/online/pages/man3/realpath.3.html).

#### Returns

The resolved path.

 



### fs.unlink(path, [callback(err)])
- srcpath {String}  The path to a file
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [unlink(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/unlink.2.html).

 



### fs.unlinkSync(path)
- srcpath {String}  The path to a file

A synchronous [unlink(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/unlink.2.html).

 



### fs.rmdir(path [, callback(err)])
- path {String}  The path to a directory
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [rmdir(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/rmdir.2.html).

 



### fs.rmdirSync(path)
- path {String}  The path to a directory

A synchronous [rmdir(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/rmdir.2.html).
 


### fs.mkdir(path [, mode=777] [, callback(err)])
- path {String}  The path to the new directory
- mode {Number}  An optional permission to set
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception

An asynchronous [mkdir(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/mkdir.2.html). 

 



### fs.mkdirSync(path [, mode=777])
- path {String}  The path to the new directory
- mode {Number}  An optional permission to set

A synchronous [mkdir(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/mkdir.2.html).

 



### fs.readdir(path, [callback(err, files)])
- path {String}  The path to the directory
- callback {Function}   An optional callback to execute once the function completes
- err {Error}  The possible exception
- files {Array}  An array of the names of the files in the directory (excluding `'.'` and `'..'`)

An asynchronous [readdir(3)](http://www.kernel.org/doc/man-pages/online/pages/man3/readdir.3.html).  It reads the contents of a directory.

 



### fs.readdirSync(path)
- path {String}  The path to the directory


A synchronous [readdir(3)](http://www.kernel.org/doc/man-pages/online/pages/man3/readdir.3.html). Returns an array of filenames, excluding `'.'` and `'..'`.

 



### fs.close(fd, [callback(err)])
- fd {Number}  The file descriptor
- callback {Function}    An optional callback to execute once the function completes
- err {Error}  The possible exception
 

An asynchronous file close; for more information, see [close(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/close.2.html).

 



### fs.closeSync(fd)
- fd {Number}  The file descriptor

A synchronous file close; for more information, see [close(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/close.2.html).

 



### fs.open(path, flags [, mode=666] [, callback(err, fd)])
- path {String}  The path to the file
- flags {String}  A string indicating how to open the file
- mode {Number}   The optional permissions to give the file if it's created
- callback {Function}  An optional callback to execute once the function completes
- err {Error}  The possible exception
- fd {Number}  An open file descriptor

An asynchronous file open; for more information, see [open(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/open.2.html). 

`flags` can be one of the following:

* `'r'`: Opens the file for reading. An exception occurs if the file does not exist.

* `'r+'`: Opens the file for reading and writing. An exception occurs if the file does not exist.

* `'w'`: Opens the file for writing. The file is created (if it does not exist) or truncated (if it exists).

* `'w+'`: Opens the file for reading and writing. The file is created (if it doesn't exist) or truncated (if it exists).

* `'a'`: Opens the file for appending. The file is created if it doesn't exist.

* `'a+'`: Opens the file for reading and appending. The file is created if it doesn't exist.

 



### fs.openSync(path, flags, [mode=666]), Number
- path {String}  The path to the file
- flags {String}  A string indicating how to open the file
- mode {Number}   The optional permissions to give the file if it's created

A synchronous file open; for more information, see [open(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/open.2.html).

`flags` can be one of the following:

* `'r'`: Opens the file for reading. An exception occurs if the file does not exist.

* `'r+'`: Opens the file for reading and writing. An exception occurs if the file does not exist.

* `'w'`: Opens the file for writing. The file is created (if it does not exist) or truncated (if it exists).

* `'w+'`: Opens the file for reading and writing. The file is created (if it doesn't exist) or truncated (if it exists).

* `'a'`: Opens the file for appending. The file is created if it doesn't exist.

* `'a+'`: Opens the file for reading and appending. The file is created if it doesn't exist.

#### Returns

An open file descriptor.

 



### fs.utimes(path, atime, mtime, [callback()])
- path {String}  The path to the file
- atime {Number}  The new access time
- mtime {Number}  The new modification time
- callback {Function}  An optional callback to execute once the function completes

An asynchronous [utime(2)](http://kernel.org/doc/man-pages/online/pages/man2/utime.2.html). Changes the timestamps of the file referenced by the supplied path.

 



### fs.utimesSync(path, atime, mtime)
- path {String}  The path to the file
- atime {Number}  The new access time
- mtime {Number}  The new modification time

A synchronous [utime(2)](http://kernel.org/doc/man-pages/online/pages/man2/utime.2.html). Change the timestamps of the file referenced by the supplied path.

 



### fs.futimes(fd, atime, mtime, [callback()])
- fd {Number}  The file descriptor
- atime {Number}  The new access time
- mtime {Number}  The new modification time
- callback {Function}   An optional callback to execute once the function completes

An asynchronous [futimes(3)](http://www.kernel.org/doc/man-pages/online/pages/man3/lutimes.3.html). Change the file timestamps of a file referenced by the supplied file descriptor.

 



### fs.futimesSync(fd, atime, mtime)
- fd {Number}  The file descriptor
- atime {Number}  The new access time
- mtime {Number}  The new modification time


A synchronous [futimes(3)](http://www.kernel.org/doc/man-pages/online/pages/man3/lutimes.3.html). Change the file timestamps of a file referenced by the supplied file descriptor.

 



### fs.fsync(fd, [callback(err)])
- fd {Number}  The file descriptor
- callback {Function}  An optional callback to execute once the function completes


An asynchronous [fsync(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/fsync.2.html).

 



### fs.fsyncSync(fd)
- fd {Number}  The file descriptor


A synchronous [fsync(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/fsync.2.html).
 
 



### fs.write(fd, buffer, offset, length, position, [callback(err, written, buffer)])
- fd {Number}  The file descriptor
- buffer {Buffer}  The buffer to write
- offset {Number}  Indicates where in the buffer to start at
- length {Number}  Indicates how much of the buffer to use
- position {Number}  The offset from the beginning of the file where this data should be written
- callback {Function}   An optional callback to execute once the function completes
- err {Error}  The possible exception
- written {Number} Specifies how many bytes were written from `buffer`
- buffer {Buffer}  The remaining contents of the buffer 

Writes `buffer` to the file specified by `fd`. Note that it's unsafe to use `fs.write` multiple times on the same file without waiting for the callback. For this scenario, [[fs.createWriteStream `fs.createWriteStream()`]] is strongly recommended.

For more information, see [pwrite(2)](http://www.kernel.org/doc/man-pages/online/pages/man2/pwrite.2.html).

 

### fs.writeSync(fd, buffer, offset, length, position), Number
### fs.writeSync(fd, str, position, [encoding='utf8']), Number
- fd {Number}  The file descriptor
- buffer {Buffer}  The buffer to write
- offset {Number}  Indicates where in the buffer to start at
- length {Number}  Indicates how much of the buffer to use
- position {Number}  The offset from the beginning of the file where this data should be written
- str {String}  The string to write
- encoding {Number}  The encoding to use during the write

A synchronous version of the buffer-based [[fs.write `fs.write()`]].

#### Returns

Returns the number of bytes written.

 
 



### fs.read(fd, buffer, offset, length, position, [callback()])
- fd {Number}  The file descriptor to read from
- buffer {Buffer}  The buffer to write to
- offset {Number}  Indicates where in the buffer to start writing at
- length {Number}  Indicates the number of bytes to read
- position {Number}  The offset from the beginning of the file where the reading should begin
- callback {Function}  An optional callback to execute once the function completes
- err {Error}  The possible exception
- bytesRead {Number}  Specifies how many bytes were read from `buffer`
- buffer {Buffer}  The rest of the buffer

Read data from the file specified by `fd` and writes it to `buffer`. If `position` is `null`, data will be read from the current file position.

 



### fs.readSync(fd, buffer, offset, length, position), Number
### fs.readSync(fd, length, position, encoding), Number
- fd {Number}  The file descriptor to read from
- buffer {Buffer}  The buffer to write to
- offset {Number}  Indicates where in the buffer to start writing at
- length {Number}  Indicates the number of bytes to read
- position {Number}  The offset from the beginning of the file where the reading should begin
- encoding {String}  The encoding to use 

The synchronous version of buffer-based [[fs.read `fs.read()`]]. Reads data from the file specified by `fd` and writes it to `buffer`. If `position` is `null`, data will be read from the current file position.


#### Returns

The number of bytes read.

 



### fs.readFile(filename, [encoding], [callback(err, data)])
- filename {String}  The name of the file to read
- encoding {String}  The encoding to use
- callback {Function}   An optional callback to execute once the function completes
- err {Error}  The possible exception
- data {Buffer}  The contents of the file


Asynchronously reads the entire contents of a file. If no encoding is specified, then the raw buffer is returned.

#### Example

    fs.readFile('/etc/passwd', function (err, data) {
      if (err) throw err;
      console.log(data);
    });

 



### fs.readFileSync(filename, [encoding]), String | Buffer
- filename {String}  The name of the file to read
- encoding {String}  The encoding to use
 

Synchronous version of [[fs.readFile `fs.readFile()`]]. Returns the contents of the `filename`.

#### Returns

The contents of the `filename`. If `encoding` is specified, then this function returns a string. Otherwise it returns a [[Buffer buffer]].
 



### fs.writeFile(filename, data, [encoding='utf8'], [callback()])
- filename {String}  The name of the file to write to
- data {String | Buffer}  The data to write (this can be a string or a buffer)
- encoding {String}  The encoding to use (this is ignored if `data` is a buffer)
- callback {Function}   An optional callback to execute once the function completes

Asynchronously writes data to a file, replacing the file if it already exists.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/fs/fs.writefile.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



### fs.writeFileSync(filename, data, [encoding='utf8'])
- filename {String}  The name of the file to write to
- data {String | Buffer}  The data to write (this can be a string or a buffer)
- encoding {String}  The encoding to use (this is ignored if `data` is a buffer)


The synchronous version of [[fs.writeFile `fs.writeFile()`]].

 



### fs.watchFile(filename, [options={ persistent: true, interval: 0 }], listener(curr, prev))
- filename {String}  The name of the file to watch
- options {Object}   Any optional arguments indicating how often to watch
- listener {Function}   The callback to execute each time the file is accessed
- curr {fs.Stats}  The current `stats` object
- prev {fs.Stats}  The previous `stats` object

Watches for changes on `filename`. 

    Stability: 2 - Unstable.  Use fs.watch instead, if available.

`options`, if provided, should be an object containing two boolean members: `persistent` and `interval`:
* `persistent` indicates whether the process should continue to run as long as files are being watched
* `interval` indicates how often the target should be polled, in milliseconds.

On Linux systems with [inotify](http://en.wikipedia.org/wiki/Inotify), `interval` is ignored.

#### Example

    fs.watchFile('message.text', function (curr, prev) {
      console.log('the current modification time is: ' + curr.mtime);
      console.log('the previous modification time was: ' + prev.mtime);
    });


 



### fs.unwatchFile(filename)
- filename {String}  The filename to watch

Stops watching for changes on `filename`.

    Stability: 2 - Unstable.  Use fs.watch instead, if available. 



### fs.watch(filename[, options = {persistent: true}], listener(event, filename)), fs.FSWatcher
- filename {String}  The filename (or directory) to watch
- options {Object}  An optional arguments indicating how to watch the files
- listener {Function}   The callback to execute each time the file is accessed
- event {String}  Either `'rename'` or '`change'`
- filename {String}  The name of the file which triggered the event

Watch for changes on `filename`.

    Stability: 2 - Unstable.  Use fs.watch instead, if available.

`options`, if provided, should be an object containing a boolean member `persistent`, which indicates whether the process should continue to run as long as files are being watched.

Warning: Providing the `filename` argument in the callback is not supported on every platform (currently it's only supported on Linux and Windows).  Even on supported platforms, `filename` is **not** always guaranteed to be provided. Therefore, don't assume that `filename` argument is always provided in the callback, and have some fallback logic if it is `null`, like in the provided example.

#### Example

    fs.watch('somedir', function (event, filename) {
        console.log('event is: ' + event);
        if (filename) {
            console.log('filename provided: ' + filename);
        } else {
        console.log('filename not provided');
        }
    });

 


### fs.createReadStream(path, [options]), fs.ReadStream
- path {String}  The path to read from
- options {Object}  Any optional arguments indicating how to read the stream


Returns a new [[fs.ReadStream `fs.ReadStream`]] object.

`options` is an object with the following defaults:

    { 
      flags: 'r',
      encoding: null,
      fd: null,
      mode: 0666,
      bufferSize: 64 * 1024
    }

`options` can include `start` and `end` values to read a range of bytes from the file instead of the entire file.  Both `start` and `end` are inclusive and start at 0.

#### Example

Here's an example to read the last 10 bytes of a file which is 100 bytes long:

    fs.createReadStream('sample.txt', {start: 90, end: 99});


 


### fs.createWriteStream(path, [options]), fs.WriteStream
- path {String}  The path to read from
- options {Object}   Any optional arguments indicating how to write the stream

Returns a new [[streams.WritableStream WriteStream]] object.

`options` is an object with the following defaults:

    { flags: 'w',
      encoding: null,
      mode: 0666 }

`options` may also include a `start` option to allow writing data at some position past the beginning of the file.  

Modifying a file rather than replacing it may require a `flags` mode of `r+` rather than the default mode `w`.



## fs.Stats

Objects returned from [[fs.stat `fs.stat()`]], [[fs.lstat `fs.lstat()`]], and [[fs.fstat `fs.fstat()`]] (and their synchronous counterparts) are of this type. The object contains the following methods:

For a regular file, `util.inspect(fs.Stats)` returns an object similar to [the structure returned by the Unix stat command](http://www.kernel.org/doc/man-pages/online/pages/man2/stat.2.html):

    { dev: 2114,
      ino: 48064969,
      mode: 33188,
      nlink: 1,
      uid: 85,
      gid: 100,
      rdev: 0,
      size: 527,
      blksize: 4096,
      blocks: 8,
      atime: Mon, 10 Oct 2011 23:24:11 GMT,
      mtime: Mon, 10 Oct 2011 23:24:11 GMT,
      ctime: Mon, 10 Oct 2011 23:24:11 GMT }


Please note that `atime`, `mtime`, and `ctime` are instances of the [[Date]] object, and to compare the values of these objects you should use appropriate methods. For most general uses, `Date.getTime()` returns the number of milliseconds elapsed since _1 January 1970 00:00:00 UTC_, and this integer should be sufficient for any comparison. However, there are additional methods which can be used for displaying fuzzy information.



### fs.Stats.isFile(), Boolean

Indicates if the object is a file.

 


### fs.Stats.isDirectory(), Boolean

Indicates if the object is a directory.


### fs.Stats.isBlockDevice(), Boolean

Indicates if the object is a [block device](http://en.wikipedia.org/wiki/Device_file#Block_devices).


### fs.Stats.isCharacterDevice(), Boolean

Indicates if the object is a [character device](http://en.wikipedia.org/wiki/Device_file#Character_devices).


### fs.Stats.isSymbolicLink(), Boolean

Indicates if the object is a symbolic link; this is only valid with `fs.lstat()` and `fs.lstatSynch()`.


### fs.Stats.isFIFO(), Boolean

Indicates if the object is a [named pipe](http://en.wikipedia.org/wiki/Named_pipe).


### fs.Stats.isSocket(), Boolean

Indicates if the object is a [socket file](http://en.wikipedia.org/wiki/Unix_file_types#Socket).



## fs.WriteStream

This is a [[streams.WritableStream WriteStream]], created from the function [[fs.createWriteStream `fs.createWriteStream()`]].

 


### fs.WriteStream@open(fd)
- fd {Number}   The file descriptor used by the `WriteStream`

Emitted when a file is opened for writing.

 



### fs.WriteStream.bytesWritten, Number

The number of bytes written so far. This doesn't include data that is still queued for writing.

## fs.ReadStream

This is a [[streams.ReadableStream streams.ReadableStream]], created from the function [[fs.createReadStream `fs.createReadStream()`]].

 


### fs.ReadStream@open(fd)
- fd {Number}   The file descriptor used by the `ReadStream`

Emitted when a file is opened.

 



## fs.FSWatcher

Objects returned from [[fs.watch `fs.watch()`]] are of this type. You can monitor any changes that occur on a watched file by listening for the events in this object.


  


### fs.FSWatcher.close()

Stop watching for changes on the given `FSWatcher`.
 



### fs.FSWatcher@change(event, filename)
- event {String}  The event that occured, either `'rename'` or '`change'`
- filename {String}  The name of the file which triggered the event

Emitted when something changes in a watched directory or file. See more details in [[fs.watch `fs.watch()`]].

 



### fs.FSWatcher@error(exception)
- exception {Error}  The exception that was caught

Emitted when an error occurs.

 
