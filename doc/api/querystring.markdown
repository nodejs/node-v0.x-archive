# Query String

    Stability: 3 - Stable

<!--name=querystring-->

This module provides utilities for dealing with query strings.
It provides the following methods:

## querystring.stringify(obj, [sep], [eq], [name])

Serialize an object to a query string.
Optionally override the default separator (`'&'`) and assignment (`'='`)
characters and optionally specify a name when obj is primitive.

Example:

    querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'], corge: '' })
    // returns
    'foo=bar&baz=qux&baz=quux&corge='

    querystring.stringify({foo: 'bar', baz: 'qux'}, ';', ':')
    // returns
    'foo:bar;baz:qux'

    querystring.stringify('bar', undefined, undefined, 'foo')
    // returns
    'foo=bar'

    querystring.stringify(['bar','baz'], undefined, undefined, 'foo')
    // returns
    'foo=bar&foo=baz'

## querystring.stringify(obj, [options])

Serialize an object to a query string.
Optionally override the default separator (`'&'`) and assignment (`'='`)
characters.

1. `options.sep` - override the separator character
1. `options.eq` - override the assignment character
1. `options.name` - set the optional name
1. `options.omitnull` - true if null/undefined values should be omitted.

Example:

    querystring.stringify({ foo: 'bar', baz: null}, {omitnull:false})
    // returns
    'foo=bar&baz='

    querystring.stringify({ foo: 'bar', baz: null}, {omitnull:true})
    // returns
    'foo=bar&baz'

    querystring.stringify({ foo: 'bar', baz: null}, {sep:'.'})
    // returns
    'foo=bar.baz='

## querystring.parse(str, [sep], [eq], [options])

Deserialize a query string to an object.
Optionally override the default separator (`'&'`) and assignment (`'='`)
characters.

Options object may contain `maxKeys` property (equal to 1000 by default), it'll
be used to limit processed keys. Set it to 0 to remove key count limitation.

Example:

    querystring.parse('foo=bar&baz=qux&baz=quux&corge')
    // returns
    { foo: 'bar', baz: ['qux', 'quux'], corge: '' }

## querystring.parse(str, [options])

Deserialize a query string to an object.
Optionally override the default separator (`'&'`) and assignment (`'='`)
characters.

1. `options.sep` = override the separator character
1. `options.eq` = override the assignment character
1. `options.omitnull` = true to treat missing assignments as undefined.
1. `options.maxKeys` = used to limit processed keys. Defaults to 1000. Set to 0 to remove key count limitation.

Example:

    querystring.parse('foo=bar&baz=qux&baz=quux&corge')
    // returns
    { foo: 'bar', baz: ['qux', 'quux'], corge: '' }

    querystring.parse('foo=bar&baz=qux&baz=quux&corge', {omitnull:true})
    // returns
    { foo: 'bar', baz: ['qux', 'quux'], corge: undefined }

## querystring.escape

The escape function used by `querystring.stringify`,
provided so that it could be overridden if necessary.

## querystring.unescape

The unescape function used by `querystring.parse`,
provided so that it could be overridden if necessary.
