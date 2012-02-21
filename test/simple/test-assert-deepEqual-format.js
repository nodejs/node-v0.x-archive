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

var common = require('../common');
var assert = require('assert');

// if you pass a message, don't change it
try {
  assert.deepEqual({
    'same' : 'thing',
    'diff' : 'thing'
  },{
    'same' : 'thing',
    'diff' : 'gniht'
  },'my message');
} catch (e) {
  assert.equal(e.message,
    'my message');
}

// basic test of object differance
try {
  assert.deepEqual({
    'same' : 'thing',
    'diff' : 'thing'
  },{
    'same' : 'thing',
    'diff' : 'gniht'
  });
} catch (e) {
  assert.equal(e.message,
    'deepEqual: {\n' +
    ' same: "thing" == "thing"\n' +
    ' diff: "thing" == "gniht"\n' +
    '}');
}

// basic test of array differance
try {
  assert.deepEqual(['same', 'diff'], ['same','rent']);
} catch (e) {
  assert.equal(e.message,
    'deepEqual: [\n' +
    ' 0: "same" == "same"\n' +
    ' 1: "diff" == "rent"\n' +
    ']');
}

// actual has an extra key
try {
  assert.deepEqual({
    'same' : 'thing',
    'diff' : 'thing'
  },{
    'same' : 'thing'
  });
} catch (e) {
  assert.equal(e.message,
    'deepEqual: {\n' +
    ' same: "thing" == "thing"\n' +
    ' diff: "thing" == key-undefined\n' +
    '}');
}

// actual missing a key
try {
  assert.deepEqual({
    'same' : 'thing'
  },{
    'same' : 'thing',
    'diff' : 'thing'
  });
} catch (e) {
  assert.equal(e.message,
    'deepEqual: {\n' +
    ' same: "thing" == "thing"\n' +
    ' diff: key-undefined == "thing"\n' +
    '}');
}

// actual has an extra value
try {
  assert.deepEqual(['same', 'diff'], ['same']);
} catch (e) {
  assert.equal(e.message,
    'deepEqual: [\n' +
    ' 0: "same" == "same"\n' +
    ' 1: "diff" == key-undefined\n' +
    ']');
}

// actual missing a value
try {
  assert.deepEqual(['same'], ['same','rent']);
} catch (e) {
  assert.equal(e.message,
    'deepEqual: [\n' +
    ' 0: "same" == "same"\n' +
    ' 1: key-undefined == "rent"\n' +
    ']');
}

// potentially annoying values to format
try {
  assert.deepEqual({
    'a' : null,
    'b' : false,
    'c' : null,
    'd' : '',
    'e' : 0
  },{
    'a' : '',
    'b' : 0
  });
} catch (e) {
  assert.equal(e.message,
'deepEqual: {\n'+
' a: null == ""\n'+
' b: false == 0\n'+
' c: null == key-undefined\n'+
' d: "" == key-undefined\n'+
' e: 0 == key-undefined\n'+
'}');
}

// a wide variaty of anoying things are different
try {
  assert.deepEqual(
    [
      {
        'some' : 'key',
        'other' : 'value',
        'miss' : 'ing'
      },
      {
        'more' : 'complex',
        'anoying' : null,
        5 : 10
      },
      ['object', 'where', false],
      {
        'things' : {
          'are' : 'other'
        }
      }
  ],
  [
      {
        'some' : 'key',
        'other' : 'value2'
      },
      {
        'more' : 'complex',
        'anoying' : '',
        5 : 10
      },
      ['object', 'where', 0],
      {
        'things' : {
          'are' : 'other',
          'miss' : 'ing'
        }
      }
  ]);
} catch (e) {
  assert.equal(e.message,
'deepEqual: [\n'+
' 0: {\n'+
'   some: "key" == "key"\n'+
'   other: "value" == "value2"\n'+
'   miss: "ing" == key-undefined\n'+
' }\n'+
' 1: {\n'+
'   5: 10 == 10\n'+
'   more: "complex" == "complex"\n'+
'   anoying: null == ""\n'+
' }\n'+
' 2: [\n'+
'   0: "object" == "object"\n'+
'   1: "where" == "where"\n'+
'   2: false == 0\n'+
' ]\n'+
' 3: {\n'+
'   things: {\n'+
'     are: "other" == "other"\n'+
'     miss: key-undefined == "ing"\n'+
'   }\n'+
' }\n'+
']');
}

// diffrent objects should not update the message
// i.e. if there is not a lot of benifit to a new format, don't do it.
try {
  assert.deepEqual({'same': 'asdf', 'diff': 'value'}, ['same']);
} catch (e) {
  assert.equal(e.message, '');
}

// nessted different objects should fall back to
// truncate(JSON.stringify(a, replacer), 128)
try {
  assert.deepEqual(
    [
      {
        'some' : 'key',
        'other' : 'value',
        'miss' : 'ing'
      }
  ],
  [
      ['object', 'where', 0]
  ]);
} catch (e) {
  assert.equal(e.message,
'deepEqual: [\n'+
' 0: {"some":"key","other":"value","miss":"ing"} == ["object","where",0]\n'+
']');
}

