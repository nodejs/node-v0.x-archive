// Copyright Joyent, Inc. and other Node contributors.

// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/*
 * This test ensures that even when required with different file paths that
 * all resolve to the same path, a given module is loaded only once.
 */
var assert = require('assert');

// Track how many times the module is loaded
if (global.nbTimesLoaded === undefined) {
    global.nbTimesLoaded = 1;
} else {
    global.nbTimesLoaded += 1;
}

var path = require('path');

/*
 * Build a path such as /path/to/module/../module/module.js and load
 * the module again.
 */
var moduleFilename = path.basename(__filename);
var moduleDir = path.dirname(__filename);
var moduleDirComponents = moduleDir.split(path.sep);
var moduleParentDirName = moduleDirComponents[moduleDirComponents.length - 1];
var complexFilename = path.join(moduleDir, '..',
                                moduleParentDirName,
                                moduleFilename);
require(complexFilename);

/*
 * Load the module again, this time with the same filename.
 */
require(__filename);

/*
 * Load the module again after applying join, which normalizes the filename.
 * On windows, it changes the drive letter to lower case and thus changes the
 * filename passed to it.
 */
require(path.join(__filename));

assert(global.nbTimesLoaded === 1);