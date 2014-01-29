// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


/**
 * @module path
 * @stability 3
 * @description
 * This module contains utilities for handling and transforming file
 * paths. Almost all these methods perform only string transformations.
 * The file system is not consulted to check whether paths are valid.
 */

var isWindows = process.platform === 'win32';
var util = require('util');


// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}


if (isWindows) {
  // Regex to split a windows path into three parts: [*, device, slash,
  // tail] windows-only
  var splitDeviceRe =
      /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

  // Regex to split the tail part of the above into [*, dir, basename, ext]
  var splitTailRe =
      /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

  // Function to split a filename into [root, dir, basename, ext]
  // windows version
  var splitPath = function(filename) {
    // Separate device+slash from tail
    var result = splitDeviceRe.exec(filename),
        device = (result[1] || '') + (result[2] || ''),
        tail = result[3] || '';
    // Split the tail into dir, basename and extension
    var result2 = splitTailRe.exec(tail),
        dir = result2[1],
        basename = result2[2],
        ext = result2[3];
    return [device, dir, basename, ext];
  };

  var normalizeUNCRoot = function(device) {
    return '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\');
  };

  /**
   * Resolves `to` to an absolute path.

   * If `to` isn't already absolute `from` arguments are prepended in right to left
   * order, until an absolute path is found. If after using all `from` paths still
   * no absolute path is found, the current working directory is used as well. The
   * resulting path is normalized, and trailing slashes are removed unless the path
   * gets resolved to the root directory. Non-string arguments are ignored.
   *
   * Another way to think of it is as a sequence of `cd` commands in a shell.
   *
   *     path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')
   *
   * Is similar to:
   *
   *     cd foo/bar
   *     cd /tmp/file/
   *     cd ..
   *     cd a/../subfile
   *     pwd
   *
   * The difference is that the different paths don't need to exist and may also be
   * files.
   *
   * Examples:
   *
   *     path.resolve('/foo/bar', './baz')
   *     // returns
   *     '/foo/bar/baz'
   *
   *     path.resolve('/foo/bar', '/tmp/file/')
   *     // returns
   *     '/tmp/file'
   *
   *     path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')
   *     // if currently in /home/myself/node, it returns
   *     '/home/myself/node/wwwroot/static_files/gif/image.gif'
   *
   * @param {...string} [from] from
   * @param {string} to to
   * @returns {string} absoute path
   */
  // path.resolve([from ...], to)
  // windows version
  exports.resolve = function() {
    var resolvedDevice = '',
        resolvedTail = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1; i--) {
      var path;
      if (i >= 0) {
        path = arguments[i];
      } else if (!resolvedDevice) {
        path = process.cwd();
      } else {
        // Windows has the concept of drive-specific current working
        // directories. If we've resolved a drive letter but not yet an
        // absolute path, get cwd for that drive. We're sure the device is not
        // an unc path at this points, because unc paths are always absolute.
        path = process.env['=' + resolvedDevice];
        // Verify that a drive-local cwd was found and that it actually points
        // to our drive. If not, default to the drive's root.
        if (!path || path.substr(0, 3).toLowerCase() !==
            resolvedDevice.toLowerCase() + '\\') {
          path = resolvedDevice + '\\';
        }
      }

      // Skip empty and invalid entries
      if (!util.isString(path)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }

      var result = splitDeviceRe.exec(path),
          device = result[1] || '',
          isUnc = device && device.charAt(1) !== ':',
          isAbsolute = exports.isAbsolute(path),
          tail = result[3];

      if (device &&
          resolvedDevice &&
          device.toLowerCase() !== resolvedDevice.toLowerCase()) {
        // This path points to another device so it is not applicable
        continue;
      }

      if (!resolvedDevice) {
        resolvedDevice = device;
      }
      if (!resolvedAbsolute) {
        resolvedTail = tail + '\\' + resolvedTail;
        resolvedAbsolute = isAbsolute;
      }

      if (resolvedDevice && resolvedAbsolute) {
        break;
      }
    }

    // Convert slashes to backslashes when `resolvedDevice` points to an UNC
    // root. Also squash multiple slashes into a single one where appropriate.
    if (isUnc) {
      resolvedDevice = normalizeUNCRoot(resolvedDevice);
    }

    // At this point the path should be resolved to a full absolute path,
    // but handle relative paths to be safe (might happen when process.cwd()
    // fails)

    // Normalize the tail path

    function f(p) {
      return !!p;
    }

    resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/).filter(f),
                                  !resolvedAbsolute).join('\\');

    return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) ||
           '.';
  };

  /**
   * Normalize a string path, taking care of `'..'` and `'.'` parts.
   *
   * When multiple slashes are found, they're replaced by a single one;
   * when the path contains a trailing slash, it is preserved.
   * On Windows backslashes are used.
   *
   * Example:
   *
   *     path.normalize('/foo/bar//baz/asdf/quux/..')
   *     // returns
   *     '/foo/bar/baz/asdf'
   *
   * @param  {string} path path
   * @return {string} normalized path
   */
  // windows version
  exports.normalize = function(path) {
    var result = splitDeviceRe.exec(path),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':',
        isAbsolute = exports.isAbsolute(path),
        tail = result[3],
        trailingSlash = /[\\\/]$/.test(tail);

    // If device is a drive letter, we'll normalize to lower case.
    if (device && device.charAt(1) === ':') {
      device = device[0].toLowerCase() + device.substr(1);
    }

    // Normalize the tail path
    tail = normalizeArray(tail.split(/[\\\/]+/).filter(function(p) {
      return !!p;
    }), !isAbsolute).join('\\');

    if (!tail && !isAbsolute) {
      tail = '.';
    }
    if (tail && trailingSlash) {
      tail += '\\';
    }

    // Convert slashes to backslashes when `device` points to an UNC root.
    // Also squash multiple slashes into a single one where appropriate.
    if (isUnc) {
      device = normalizeUNCRoot(device);
    }

    return device + (isAbsolute ? '\\' : '') + tail;
  };

  /**
   * Determines whether `path` is an absolute path. An absolute path will always
   * resolve to the same location, regardless of the working directory.
   *
   * Posix examples:
   *
   *     path.isAbsolute('/foo/bar') // true
   *     path.isAbsolute('/baz/..')  // true
   *     path.isAbsolute('qux/')     // false
   *     path.isAbsolute('.')        // false
   *
   * Windows examples:
   *
   *     path.isAbsolute('//server')  // true
   *     path.isAbsolute('C:/foo/..') // true
   *     path.isAbsolute('bar\\baz')   // false
   *     path.isAbsolute('.')         // false
   *
   * @param  {string}  path path
   * @return {Boolean}      whether path is an absolute path
   */
  // windows version
  exports.isAbsolute = function(path) {
    var result = splitDeviceRe.exec(path),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':';
    // UNC paths are always absolute
    return !!result[2] || isUnc;
  };

  /**
   * Join all arguments together and normalize the resulting path.
   *
   * Arguments must be strings.  In v0.8, non-string arguments were
   * silently ignored.  In v0.10 and up, an exception is thrown.
   *
   * Example:
   *
   *     path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')
   *     // returns
   *     '/foo/bar/baz/asdf'
   *
   *     path.join('foo', {}, 'bar')
   *     // throws exception
   *     TypeError: Arguments to path.join must be strings
   *
   * @param  {...string} [path]
   * @return {string} joined path
   */
  // windows version
  exports.join = function() {
    function f(p) {
      if (!util.isString(p)) {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }

    var paths = Array.prototype.filter.call(arguments, f);
    var joined = paths.join('\\');

    // Make sure that the joined path doesn't start with two slashes, because
    // normalize() will mistake it for an UNC path then.
    //
    // This step is skipped when it is very clear that the user actually
    // intended to point at an UNC path. This is assumed when the first
    // non-empty string arguments starts with exactly two slashes followed by
    // at least one more non-slash character.
    //
    // Note that for normalize() to treat a path as an UNC path it needs to
    // have at least 2 components, so we don't filter for that here.
    // This means that the user can use join to construct UNC paths from
    // a server name and a share name; for example:
    //   path.join('//server', 'share') -> '\\\\server\\share\')
    if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
      joined = joined.replace(/^[\\\/]{2,}/, '\\');
    }

    return exports.normalize(joined);
  };

  /**
   * Solve the relative path from `from` to `to`.
   * At times we have two absolute paths, and we need to derive the relative
   * path from one to the other.  This is actually the reverse transform of
   * `path.resolve`, which means we see that:
   *
   *     path.resolve(from, path.relative(from, to)) == path.resolve(to)
   *
   * Examples:
   *
   *     path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb')
   *     // returns
   *     '..\\..\\impl\\bbb'
   *
   *     path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
   *     // returns
   *     '../../impl/bbb'

   * @param  {string} from from
   * @param  {string} to   to
   * @return {string}      relative path from `from` to `to`
   */
  // windows version
  exports.relative = function(from, to) {
    from = exports.resolve(from);
    to = exports.resolve(to);

    // windows is not case sensitive
    var lowerFrom = from.toLowerCase();
    var lowerTo = to.toLowerCase();

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var toParts = trim(to.split('\\'));

    var lowerFromParts = trim(lowerFrom.split('\\'));
    var lowerToParts = trim(lowerTo.split('\\'));

    var length = Math.min(lowerFromParts.length, lowerToParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (lowerFromParts[i] !== lowerToParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    if (samePartsLength == 0) {
      return to;
    }

    var outputParts = [];
    for (var i = samePartsLength; i < lowerFromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('\\');
  };

  /**
   * The platform-specific file separator. `'\\'` or `'/'`.
   *
   * An example on *nix:
   *
   *     'foo/bar/baz'.split(path.sep)
   *     // returns
   *     ['foo', 'bar', 'baz']
   *
   * An example on Windows:
   *
   *     'foo\\bar\\baz'.split(path.sep)
   *     // returns
   *     ['foo', 'bar', 'baz']
   *
   * @type {String}
   */
  exports.sep = '\\';

  /**
   * The platform-specific path delimiter, `;` or `':'`.
   *
   * An example on *nix:
   *
   *     console.log(process.env.PATH)
   *     // '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'
   *
   *     process.env.PATH.split(path.delimiter)
   *     // returns
   *     ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
   *
   * An example on Windows:
   *
   *     console.log(process.env.PATH)
   *     // 'C:\Windows\system32;C:\Windows;C:\Program Files\nodejs\'
   *
   *     process.env.PATH.split(path.delimiter)
   *     // returns
   *     ['C:\Windows\system32', 'C:\Windows', 'C:\Program Files\nodejs\']
   *
   * @type {String}
   */
  exports.delimiter = ';';

} else /* posix */ {

  // Split a filename into [root, dir, basename, ext], unix version
  // 'root' is just a slash, or nothing.
  var splitPathRe =
      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  var splitPath = function(filename) {
    return splitPathRe.exec(filename).slice(1);
  };

  // path.resolve([from ...], to)
  // posix version
  exports.resolve = function() {
    var resolvedPath = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? arguments[i] : process.cwd();

      // Skip empty and invalid entries
      if (!util.isString(path)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
      return !!p;
    }), !resolvedAbsolute).join('/');

    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  };

  // path.normalize(path)
  // posix version
  exports.normalize = function(path) {
    var isAbsolute = exports.isAbsolute(path),
        trailingSlash = path[path.length - 1] === '/',
        segments = path.split('/'),
        nonEmptySegments = [];

    // Normalize the path
    for (var i = 0; i < segments.length; i++) {
      if (segments[i]) {
        nonEmptySegments.push(segments[i]);
      }
    }
    path = normalizeArray(nonEmptySegments, !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  };

  // posix version
  exports.isAbsolute = function(path) {
    return path.charAt(0) === '/';
  };

  // posix version
  exports.join = function() {
    var path = '';
    for (var i = 0; i < arguments.length; i++) {
      var segment = arguments[i];
      if (!util.isString(segment)) {
        throw new TypeError('Arguments to path.join must be strings');
      }
      if (segment) {
        if (!path) {
          path += segment;
        } else {
          path += '/' + segment;
        }
      }
    }
    return exports.normalize(path);
  };


  // path.relative(from, to)
  // posix version
  exports.relative = function(from, to) {
    from = exports.resolve(from).substr(1);
    to = exports.resolve(to).substr(1);

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('/');
  };

  exports.sep = '/';
  exports.delimiter = ':';
}

/**
 * Return the directory name of a path.  Similar to the Unix `dirname` command.
 *
 * Example:
 *
 *     path.dirname('/foo/bar/baz/asdf/quux')
 *     // returns
 *     '/foo/bar/baz/asdf'
 *
 * @param  {string} path path
 * @return {string}      directory name of path
 */
exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


/**
 * Return the last portion of a path.  Similar to the Unix `basename` command.
 *
 * Example:
 *
 *     path.basename('/foo/bar/baz/asdf/quux.html')
 *     // returns
 *     'quux.html'
 *
 *     path.basename('/foo/bar/baz/asdf/quux.html', '.html')
 *     // returns
 *     'quux'
 *
 * @param  {string} path path
 * @param  {string} ext  extension
 * @return {string}      last portion of path
 */
exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


/**
 * Return the extension of the path, from the last '.' to end of string
 * in the last portion of the path.  If there is no '.' in the last portion
 * of the path or the first character of it is '.', then it returns
 * an empty string.  Examples:
 *
 *     path.extname('index.html')
 *     // returns
 *     '.html'
 *
 *     path.extname('index.')
 *     // returns
 *     '.'
 *
 *     path.extname('index')
 *     // returns
 *     ''
 *
 * @param  {string} path path
 * @return {string}      extension
 */
exports.extname = function(path) {
  return splitPath(path)[3];
};


exports.exists = util.deprecate(function(path, callback) {
  require('fs').exists(path, callback);
}, 'path.exists is now called `fs.exists`.');


exports.existsSync = util.deprecate(function(path) {
  return require('fs').existsSync(path);
}, 'path.existsSync is now called `fs.existsSync`.');


if (isWindows) {
  exports._makeLong = function(path) {
    // Note: this will *probably* throw somewhere.
    if (!util.isString(path))
      return path;

    if (!path) {
      return '';
    }

    var resolvedPath = exports.resolve(path);

    if (/^[a-zA-Z]\:\\/.test(resolvedPath)) {
      // path is local filesystem path, which needs to be converted
      // to long UNC path.
      return '\\\\?\\' + resolvedPath;
    } else if (/^\\\\[^?.]/.test(resolvedPath)) {
      // path is network UNC path, which needs to be converted
      // to long UNC path.
      return '\\\\?\\UNC\\' + resolvedPath.substring(2);
    }

    return path;
  };
} else {
  exports._makeLong = function(path) {
    return path;
  };
}
