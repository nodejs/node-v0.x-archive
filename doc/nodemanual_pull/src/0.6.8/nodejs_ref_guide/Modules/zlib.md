
## class zlib

This provides bindings to Gzip/Gunzip, Deflate/Inflate, and DeflateRaw/InflateRaw classes. Each class takes the same options, and is a readable/writable Stream.

You can access this module by adding `var zlib = require('zlib');` to your code.

All of the constants defined in `zlib.h` are also defined in this module.  They are described in more detail in the [zlib documentation](http://zlib.net/manual.html#Constants).

<a id="zlib.options"></a>
#### Options

Each class takes an optional options object.  All options are optional.  (The convenience methods use the default settings for all options.)

Note that some options are only relevant when compressing, and are ignored by the decompression classes.

The options are:

* chunkSize (default: 16*1024)
* windowBits
* level (compression only)
* memLevel (compression only)
* strategy (compression only)

See the description of `deflateInit2` and `inflateInit2` at <http://zlib.net/manual.html#Advanced> for more information on these.

#### Memory Usage Tuning

From `zlib/zconf.h`, modified to Node's usage:

The memory requirements for deflate are (in bytes):

    (1 << (windowBits+2)) +  (1 << (memLevel+9))

that is: 128K for `windowBits=15`  and  128K for `memLevel = 8`
(default values) plus a few kilobytes for small objects.

For example, if you want to reduce the default memory requirements from 256K to 128K, set the options to:

    { windowBits: 14, memLevel: 7 }

Of course, this will generally degrade compression (there's no free lunch).

The memory requirements for inflate are (in bytes)

    1 << windowBits

that is: 32K for `windowBits=15` (default value) plus a few kilobytes
for small objects.

This is in addition to a single internal output slab buffer of size `chunkSize`, which defaults to 16K.

The speed of zlib compression is affected most dramatically by the `level` setting.  A higher level will result in better compression, but takes longer to complete.  A lower level will result in less compression, but will be much faster.

In general, greater memory usage options will mean that node has to make fewer calls to zlib, since it'll be able to process more data in a single `write` operation.  This is another factor that affects the speed, at the cost of memory usage.

#### Examples

<Note>These examples are drastically simplified to show the basic concept. Zlib encoding can be expensive, and the results ought to be cached.  See [Memory Usage Tuning](#memory_Usage_Tuning) for more information on the speed/memory/compression tradeoffs involved in zlib usage.</Note>

Compressing or decompressing a file can be done by piping an `fs.ReadStream` into a zlib stream, then into an `fs.WriteStream`.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/zlib/zlib.ex.1.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

Compressing or decompressing data in one step can be done by using the convenience methods.

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/zlib/zlib.ex.2.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

To use this module in an HTTP client or server, use the [accept-encoding](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3) on requests, and the [content-encoding](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11) header on responses. Here's an example:

    // client request example
    var zlib = require('zlib');
    var http = require('http');
    var fs = require('fs');
    var request = http.get({ host: 'izs.me',
                             path: '/',
                             port: 80,
                             headers: { 'accept-encoding': 'gzip,deflate' } });
    request.on('response', function(response) {
      var output = fs.createWriteStream('izs.me_index.html');

      switch (response.headers['content-encoding']) {
        // or, just use zlib.createUnzip() to handle both cases
        case 'gzip':
          response.pipe(zlib.createGunzip()).pipe(output);
          break;
        case 'deflate':
          response.pipe(zlib.createInflate()).pipe(output);
          break;
        default:
          response.pipe(output);
          break;
      }
    });

    // server example
    // Running a gzip operation on every request is quite expensive.
    // It would be much more efficient to cache the compressed buffer.
    var zlib = require('zlib');
    var http = require('http');
    var fs = require('fs');
    http.createServer(function(request, response) {
      var raw = fs.createReadStream('index.html');
      var acceptEncoding = request.headers['accept-encoding'];
      if (!acceptEncoding) {
        acceptEncoding = '';
      }

      // Note: this is not a conformant accept-encoding parser.
      // See http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
      if (acceptEncoding.match(/\bdeflate\b/)) {
        response.writeHead(200, { 'content-encoding': 'deflate' });
        raw.pipe(zlib.createDeflate()).pipe(response);
      } else if (acceptEncoding.match(/\bgzip\b/)) {
        response.writeHead(200, { 'content-encoding': 'gzip' });
        raw.pipe(zlib.createGzip()).pipe(response);
      } else {
        response.writeHead(200, {});
        raw.pipe(response);
      }
    }).listen(1337);




## zlib.createGzip([options])
- options (Object): The standard [[zlib.options `options`]] object available to all the methods.

Returns a new Object for Gzip compression.
 



## zlib.createGunzip([options])
- options (Object): The standard [[zlib.options `options`]] object available to all the methods.

Returns a new object for Gunzip compression.





## zlib.createDeflate([options])
- options (Object): The standard [[zlib.options `options`]] object available to all the methods.

Returns a new object for compressing using deflate.

 



## zlib.createInflate([options])
- options (Object): The standard [[zlib.options `options`]] object available to all the methods.

Returns a new object to decompress a deflate stream.

 



## zlib.createDeflateRaw([options])
- options (Object): The standard [[zlib.options `options`]] object available to all the methods.

Returns a new object for compressing using deflate, without an appended zlib header.

 
 


## zlib.createInflateRaw([options])
- options (Object): The standard [[zlib.options `options`]] object available to all the methods.

Returns a new object to decompress a raw deflate stream (one without an appended zlib header).

 


## zlib.createUnzip([options])
- options (Object): The standard [[zlib.options `options`]] object available to all the methods.

Returns a new unzip to decompress either a Gzip- or Deflate-compressed stream by auto-detecting the header.

 



## zlib.deflate(buf, callback(error, result))
- buf (Buffer): The buffer to compress
- callback (Function): The function to execute once the method completes
- error (Error): The standard error object
- result (Object): The result of the method


Compresses a buffer using deflate.

 



## zlib.deflateRaw(buf, callback(error, result))
- buf (Buffer): The buffer to compress
- callback (Function): The function to execute once the method completes
- error (Error): The standard error object
- result (Object): The result of the method


Compresses a buffer using a raw deflate stream (one without an appended zlib header).

 



## zlib.gzip(buf, callback(error, result))
- buf (Buffer): The buffer to compress
- callback (Function): The function to execute once the method completes
- error (Error): The standard error object
- result (Object): The result of the method


Compresses a buffer using Gzip.

 



## zlib.gunzip(buf, callback(error, result))
- buf (Buffer): The buffer to compress
- callback (Function): The function to execute once the method completes
- error (Error): The standard error object
- result (Object): The result of the method


Decompress a buffer with Gunzip.

 



## zlib.inflate(buf, callback(error, result))
- buf (Buffer): The buffer to compress
- callback (Function): The function to execute once the method completes
- error (Error): The standard error object
- result (Object): The result of the method


Decompress a buffer with Inflate.

 



## zlib.inflateRaw(buf, callback(error, result))
- buf (Buffer): The buffer to compress
- callback (Function): The function to execute once the method completes
- error (Error): The standard error object
- result (Object): The result of the method


Decompress a raw buffer with a raw deflate stream (one without an appended zlib header)..

 



## zlib.unzip(buf, callback(error, result))
- buf (Buffer): The buffer to compress
- callback (Function): The function to execute once the method completes
- error (Error): The standard error object
- result (Object): The result of the method

Decompress a buffer with Unzip.



