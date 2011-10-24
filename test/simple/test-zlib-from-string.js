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

// test compressing and uncompressing a string with zlib

var common = require('../common.js');
var assert = require('assert');
var zlib = require('zlib');

var inputString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi faucibus, purus at gravida dictum, libero arcu convallis lacus, in commodo libero metus eu nisi. Nullam commodo, neque nec porta placerat, nisi est fermentum augue, vitae gravida tellus sapien sit amet tellus. Aenean non diam orci. Proin quis elit turpis. Suspendisse non diam ipsum. Suspendisse nec ullamcorper odio. Vestibulum arcu mi, sodales non suscipit id, ultrices ut massa. Sed ac sem sit amet arcu malesuada fermentum. Nunc sed. ';
var expectedBase64Deflate = 'eJxdUU2OmzEIvco7wKfvDrNvq0ojdU9sEiHZxgGT8xdnJqnUjRfweH/+ocYdMj06qjY1uCxQ53Wg6HAui1cYqMoULzJu4CbrxE+1i+BKUeQSfmCGhYMWbkYPqYQqZUU/0OTCpiArsRkf1Jo4GpV9JSNnvWvVFy6Vk4cDQ1xO/IrWqL9ABwbfg/MtmGqLMJOIjdLtxoN94crWeaQ2KG7BBx6yiN++FreWCk5TeLzTfo9PfPBgGhg6MkEqq5W08ds0rd4jne/4yEqyjhOf4ZNHFXf+d/Js879dGn4mKWqTDVpFT/xJu9le21Z3PV0OuFZq7E82j2x8ppzUI8+XSclNLHRyp1TgCirw/MF3ji+iTRGUad9l7CrHxtYTfwELb7aP';
var expectedBase64Gzip = 'H4sIAAAAAAAAA11RTY6bMQi9yjvAp+8Os2+rSiN1T2wSIdnGAZPzF2cmqdSNF/B4f/6hxh0yPTqqNjW4LFDndaDocC6LVxioyhQvMm7gJuvET7WL4EpR5BJ+YIaFgxZuRg+phCplRT/Q5MKmICuxGR/UmjgalX0lI2e9a9UXLpWThwNDXE78itaov0AHBt+D8y2Yaoswk4iN0u3Gg33hytZ5pDYobsEHHrKI374Wt5YKTlN4vNN+j0988GAaGDoyQSqrlbTx2zSt3iOd7/jISrKOE5/hk0cVd/538mzzv10afiYpapMNWkVP/Em72V7bVnc9XQ64VmrsTzaPbHymnNQjz5dJyU0sdHKnVOAKKvD8wXeOL6JNEZRp32XsKsfG1hN/AYS4bez1AQAA';

zlib.deflate(inputString, function(err, buffer) {
    assert.equal(buffer.toString('base64'), expectedBase64Deflate, 'deflate encoded string should match');
});

zlib.gzip(inputString, function(err, buffer) {
    assert.equal(buffer.toString('base64'), expectedBase64Gzip, 'deflate encoded string should match');
});

var buffer = new Buffer(expectedBase64Deflate, 'base64');
zlib.unzip(buffer, function(err, str) {
    assert.equal(str, inputString, 'decoded inflated string should match');
});

buffer = new Buffer(expectedBase64Gzip, 'base64');
zlib.unzip(buffer, function(err, str) {
    assert.equal(str, inputString, 'decoded gunzipped string should match');
});