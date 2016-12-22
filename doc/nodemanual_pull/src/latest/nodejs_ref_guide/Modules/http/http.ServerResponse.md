

## class http.ServerResponse

This object is created internally by a HTTP server&mdash;not by the user. It is passed as the second parameter to the `'request'` event. It is a [[streams.WritableStream `Writable Stream`]].

 


## http.ServerResponse@close() -> Void

If emitted, it it indicates that the underlaying connection was terminated before `response.end()` was called or able to flush.




## http.ServerResponse.writeContinue() -> Void

Sends an `HTTP/1.1 100 Continue` message to the client, indicating that the request body should be sent. For more information, see the [checkContinue](http.Server.html#http.Server.event.checkContinue) event on `Server`.




## http.ServerResponse.writeHead(statusCode [, reasonPhrase] [, headers]) -> Void
- statusCode (Number):  The 3-digit HTTP status code, like `404`
- reasonPhrase (String): A human-readable string describing the status
- headers (Object): Any response headers

Sends a response header to the request.

This method must only be called once on a message and it must be called before `response.end()` is called.

If you call `response.write()` or `response.end()` before calling this, the implicit/mutable headers will be calculated and call this function for you.

#### Example 

    var body = 'hello world';
    response.writeHead(200, {
      'Content-Length': body.length,
      'Content-Type': 'text/plain' });

<Note>`Content-Length` is given in bytes, not characters. The above example works because the string `'hello world'` contains only single byte characters. If the body contains higher coded characters then `Buffer.byteLength()` should be used to determine the number of bytes in a given encoding. Node.js does not check whether `Content-Length` and the length of the body which has been transmitted are equal or not.</Note>


 


## http.ServerResponse.statusCode -> Number

When using implicit headers (not calling `response.writeHead()` explicitly), this property controls the status code that will be send to the client when the headers get flushed; for example: `response.statusCode = 404;`. 

After the response header is sent to the client, this property indicates the status code which was sent out.





## http.ServerResponse.setHeader(name, value) -> Void
- name (String): The name of the header to set
- value  (String): The value to set

Sets a single header value for implicit headers. If this header already exists in the to-be-sent headers, its value is replaced.  Use an array of strings here if you need to send multiple headers with the same name.

#### Examples

    response.setHeader("Content-Type", "text/html");

    response.setHeader("Set-Cookie", ["type=ninja", "language=javascript"]);

 


## http.ServerResponse.getHeader(name) -> String
- name (String): The name of the header to retrieve

Reads out a header that's already been queued but not sent to the client.  Note that the name is case-insensitive.  This can only be called before headers get implicitly flushed.

#### Example

    var stringContentType = response.getHeader('content-type');

 


## http.ServerResponse.removeHeader(name) -> Void
- name (String): The header to remove

Removes a header that's queued for implicit sending.
   
#### Example

		response.removeHeader("Content-Encoding");




## http.ServerResponse.write(chunk [, encoding='utf8']) -> Void
- chunk (String | buffer): A string or buffer to write
- encoding (String): The encoding to use (if `chunk` is a string)

If this method is called and `response.writeHead()` has not been called, it'll switch to implicit header mode and flush the implicit headers.

This sends a chunk of the response body. This method may be called multiple times to provide successive parts of the body.

<Note>This is the raw HTTP body and has nothing to do with higher-level multi-part body encodings that may be used.</Note>

The first time `response.write()` is called, it sends the buffered header information and the first body to the client. The second time `response.write()` is called, Node.js assumes you're going to be streaming data, and sends that separately. That is, the response is buffered up to the first chunk of body.


 


## http.ServerResponse.addTrailers(headers) -> Void
- headers (String): The trailing header to add

This method adds HTTP trailing headers (a header, but at the end of the message) to the response.

Trailers are only emitted if chunked encoding is used for the response; if it is not (_e.g._ if the request was `'HTTP/1.0'`), they are silently discarded.

#### Example

HTTP requires the `Trailer` header to be sent if you intend to emit trailers, with a list of the header fields in its value. For example:

    response.writeHead(200, { 'Content-Type': 'text/plain',
                              'Trailer': 'Content-MD5' });
    response.write(fileData);
    response.addTrailers({'Content-MD5': "7895bf4b8828b55ceaf47747b4bca667"});
    response.end();


 


## http.ServerResponse.end([data] [, encoding]) -> Void
- data (String): Some data to write before finishing
- encoding (String): The encoding for the data

This method signals to the server that all of the response headers and body has been sent; that server should consider this message complete. `response.end()` **must** be called on each response.

If `data` is specified, it is equivalent to calling `response.write(data, encoding)` followed by `response.end()`.

 
