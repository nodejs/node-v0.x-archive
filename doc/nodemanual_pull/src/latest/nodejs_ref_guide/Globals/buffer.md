
### section: buffer_Module
## class Buffer

A `Buffer` is similar to an array of integers, but corresponds to a raw memory allocation outside the V8 heap.  While pure Javascript is Unicode friendly, it is not nice to binary data.  When dealing with TCP streams or the file system, it's necessary to handle octet streams. Node.js has several strategies for manipulating, creating, and consuming these octet streams (and raw data) within the `Buffer` object. 

Note that:
- A `Buffer` can't be resized
- The `Buffer` object is global (meaning, you don't need to `require()` anything)

Converting between Buffers and Javascript string objects requires an explicit encoding defined. Those string encodings are:

* `'ascii'`: for 7-bit ASCII data only. This encoding method is very fast, and strips the high bit if set.  Note that this encoding converts a `null` character (`'\0'` or `'\u0000'`) into `0x20` (character code of a space). If you want to convert a `null` character into `0x00`, you should use the `'utf8'` encoding.

* `'utf8'`: multi-byte encoded Unicode characters.  Many web pages and other document formats use UTF-8. 

* `'ucs2'`: 2-bytes, little endian encoded Unicode characters. It can encode only BMP (Basic Multilingual Plane&mdash;from U+0000 to U+FFFF).

* `'base64'`: Base64 string encoding

* `'binary'`: A way of encoding raw binary data into strings by using only the first 8 bits of each character. This encoding method is deprecated and should be avoided in favor of `Buffer` objects where possible. This encoding is going to be removed in future versions of Node.js.

* `'hex'`: Encodes each byte as two hexidecimal characters.

In most cases, the default of `'utf8'` is used.


For more information, see [this article on manipulating buffers](../nodejs_dev_guide/manipulating_buffers.html).



## new Buffer(array)
new Buffer(size)
new Buffer(str, encoding='utf8')

Allocates a new buffer object.

You can use either:

- an `array` of octects
- allocating with a specific `size`
- from a `string` with the specified `encoding`
 
#### Example

    var bBuffer = new Buffer("This is a Buffer.", "utf8");

 



## Buffer.byteLength(string, encoding='utf8') -> Number
- string (String): The string to check
- encoding (String): The encoding that the string is in

Gives the actual byte length of a string.  This is not the same as `String.length` since that returns the number of _characters_ in a string.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.byteLength.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
 
#### Returns

Returns the byte length of a buffer
 


## Buffer.copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length) -> Void
- targetBuffer (Buffer): The buffer to copy into
- targetStart (Number): The offset to start at for the buffer you're copying into
- sourceStart (Number): The offset to start at for the buffer you're copying from
- sourceEnd (Number): The number of bytes to read from the originating buffer. Defaults to the length of the buffer

Performs a copy between buffers. The source and target regions can overlap.

#### Example: Building two buffers

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.copy.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>

 



## Buffer.fill(value, offset=0, end=buffer.length) -> Void
- value (Object): The value to use to fill the buffer
- offset (Number): The position in the buffer to start filling at
- end (Number): The position in the buffer to stop filling at

Fills the buffer with the specified value. If the offset and end are not given, this fills the entire buffer.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.fill.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
    
 



## Buffer.isBuffer(obj) -> Boolean
- obj (Object): The object to check

Returns `true` if `obj` is a `Buffer`.



 



## Buffer.readDoubleBE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads a 64-bit double from the buffer at the specified offset in big endian notation.
 
#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readDoubleBELE.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
 
 



## Buffer.readDoubleLE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.


Reads a 64 bit double from the buffer at the specified offset in little endian notation.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readDoubleBELE.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
 
 



## Buffer.readFloatBE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.


Reads a 32 bit float from the buffer at the specified offset in big endian notation.
 
#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readFloatBELE.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>    
 
 



## Buffer.readFloatLE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads a 32 bit float from the buffer at the specified offset in little endian notation.


#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readFloatBELE.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>      
 




## Buffer.readInt8(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads a signed 8 bit integer from the buffer at the specified offset.
 
This function also works as [[buffer.readUInt8 `buffer.readUInt8()`]], except buffer contents are treated as two's complement signed values. 


 



## Buffer.readInt16BE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads a signed 16 bit integer from the buffer at the specified offset in big endian notation.

This function also works as [[buffer.readUInt16BE `buffer.readUInt16BE()`]], except buffer contents are treated as a two's complement signed values.



 



## Buffer.readInt16LE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads a signed 16 bit integer from the buffer at the specified offset in little endian notation.

This function also works as [[buffer.readUInt16LE `buffer.readUInt16LE()`]], except buffer contents are treated as a two'scomplement signed values.



 



## Buffer.readInt32BE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads a signed 32 bit integer from the buffer at the specified offset in big endian notation.

This function works like [[buffer.readUInt32BE `buffer.readUInt32BE()`]], except buffer contents are treated as a two's complement signed values.


 



## Buffer.readInt32LE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.


Reads a signed 32 bit integer from the buffer at the specified offset in little endian notation.

This function works like [[buffer.readUInt32LE `buffer.readUInt32LE()`]], except buffer contents are treated as a two's complement signed values.


 



## Buffer.readUInt8(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.


Reads an unsigned 8 bit integer from the buffer at the specified offset.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readUInt8.js?linestart=3&lineend=0&showlines=false' defer='defer'></script> 

 



## Buffer.readUInt16BE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads an unsigned 16 bit integer from the buffer at the specified offset in the big endian format.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readUInt16BELE.js?linestart=3&lineend=0&showlines=false' defer='defer'></script> 

 



## Buffer.readUInt16LE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads an unsigned 16 bit integer from the buffer at the specified offset in the little endian format.
 
#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readUInt16BELE.js?linestart=3&lineend=0&showlines=false' defer='defer'></script> 

 



## Buffer.readUInt32BE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads an unsigned 32 bit integer from the buffer at the specified offset in the big endian format.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readUInt32BELE.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
   
 



## Buffer.readUInt32LE(offset, noAssert=false) -> String
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Reads an unsigned 32 bit integer from the buffer at the specified offset in the little endian format.


#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readUInt32BELE.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>   
    
 



## Buffer.slice(start, end=buffer.length) -> Buffer
- start (Number): The offset in the buffer to start from
- end (Number): The position of the last byte to slice. Defaults to the length of the buffer

Returns a new buffer that references the same memory as the old, but offset and cropped by the `start` and `end` indexes.

<Note>Modifying the new buffer slice modifies memory in the original buffer!</Note>

#### Example

Building a `Buffer` with the ASCII alphabet, taking a slice, then modifying one byte from the original `Buffer`:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.readUInt32BELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>   
    
 


### related to: buffer.write
## Buffer.toString(encoding="utf8", start=0, end=buffer.length) -> String
- encoding (String): The encoding to use; defaults to `utf8`
- start (Number): The starting byte offset; defaults to `0`
- end (Number): The number of bytes to write; defaults to the length of the buffer

Decodes and returns a string from buffer data encoded with `encoding` beginning at `start` and ending at `end`.


 



## Buffer.write(string, offset=0, length = startPos, encoding="utf8") -> Number
- string (String): The string to write
- offset (Number): The starting byte offset
- length (Number): The number of bytes to write; defaults to the length of the buffer minus any offset (`buffer.length` - `buffer.offset`)
- encoding (String): The encoding to use; defaults to `utf8`

Writes a `string` to the buffer at `offset` using the given encoding. `length` is the number of bytes to write. If `buffer` does not contain enough space to fit the entire string, it instead writes a partial amount of the string. The method doesn't write partial characters.


#### Example

Writing a utf8 string into a buffer, then printing it:

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.write.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>

#### Returns

Returns number of octets written.
 



## Buffer.writeDoubleBE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the big endian format. Note that `value` must be a valid 64 bit double.
 
#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeDoubleBELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>

 



## Buffer.writeDoubleLE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the little endian format. Note that `value` must be a valid 64 bit double.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeDoubleBELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>

 



## Buffer.writeFloatBE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the big endian format. Note that `value` must be a valid 32 bit float.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeFloatBELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>
   
 



## Buffer.writeFloatLE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the little endian format. Note that `value` must be a valid 32 bit float.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeFloatBELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>

 



## Buffer.writeInt8(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset. Note that `value` must be a valid signed 8 bit integer.

Works as `buffer.writeUInt8()`, except value is written out as a two's complement signed integer into `buffer`.



 



## Buffer.writeInt16BE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the big endian format. Note that `value` must be a valid signed 16 bit integer.

This function also works as `buffer.writeUInt16*()`, except value is written out as a two's complement signed integer into `buffer`.


 



## Buffer.writeInt16LE(value, offset, noAssert=alse) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the little endian format. Note that `value` must be a valid signed 16 bit integer.
 
This function also works as `buffer.writeUInt16*()`, except value is written out as a two's complement signed integer into `buffer`.


 



## Buffer.writeInt32BE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the big endian format. Note that `value` must be a valid signed 32 bit integer.

This function also works as `buffer.writeUInt32*`, except value is written out as a two's complement signed integer into `buffer`.


 



## Buffer.writeInt32LE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the little endian format. Note that `value` must be a valid signed 32 bit integer.

This function also works as `buffer.writeUInt32*`, except value is written out as a two's complement signed integer into `buffer`.


 



## Buffer.writeUInt8(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset. Note that `value` must be a valid unsigned 8 bit integer.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeUInt8.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>

 



## Buffer.writeUInt16BE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the big endian format. Note that `value` must be a valid unsigned 16 bit integer.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeUInt16BELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>

 



## Buffer.writeUInt16LE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean):  If `true`, skips the validation of the offset 

Writes `value` to the buffer at the specified offset in the little endian format. Note that `value` must be a valid unsigned 16 bit integer.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeUInt16BELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>


 



## Buffer.writeUInt32BE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean): If `true`, skips the validation of the offset. This means that `offset` may be beyond the end of the buffer, and is typically not recommended.

Writes `value` to the buffer at the specified offset in the big endian format. Note that `value` must be a valid unsigned 32 bit integer.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeUInt32BELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>


 



## Buffer.writeUInt32LE(value, offset, noAssert=false) -> Void
- value (String): The content to write
- offset (Number): The starting position
- noAssert (Boolean):  If `true`, skips the validation of the offset 

Writes `value` to the buffer at the specified offset in the little endian format. Note that `value` must be a valid unsigned 32 bit integer.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.writeUInt32BELE.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>
 

 



## Buffer.index -> Number

Gets and sets the octet at `index` in an array format. The values refer to individual bytes, so the legal range is between `0x00` and `0xFF` hex or `0` and `255`.

#### Example: Copy an ASCII string into a buffer, one byte at a time

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.index.js?linestart=4&lineend=0&showlines=false' defer='defer'></script>




## Buffer._charsWritten -> Number

The number of characters written by [[buffer.write `buffer.write()`]]. This value is overwritten each time `buffer.write()` is called.
 


## Buffer.length -> Number


The size of the buffer in bytes.  Note that this is not necessarily the size of the contents. `length` refers to the amount of memory allocated for the buffer object.  It does not change when the contents of the buffer are changed.

#### Example

<script src='http://snippets.c9.io/github.com/c9/nodemanual.org-examples/nodejs_ref_guide/buffer/buffer.length.js?linestart=3&lineend=0&showlines=false' defer='defer'></script>
     
    
 



## Buffer.INSPECT_MAX_BYTES = "50"


The number of bytes returned when `buffer.inspect()` is called. This can be overridden by user modules.



