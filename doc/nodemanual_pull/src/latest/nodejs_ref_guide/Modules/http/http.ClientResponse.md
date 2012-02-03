
## class http.ClientResponse

This object is created when making a request with [[http.request `http.request()`]]. It is passed to the `'response'` event of the request object.

The response implements the [[streams.readablestream `Readable Stream`]] interface.



## http.ClientResponse@data(chunk)
- chunk (Buffer): The data received

Emitted when a piece of the message body is received.




## http.ClientResponse@end()
- chunk (Buffer): The data received

Emitted exactly once for each message. After it's emitted, no other events are emitted on the response.




## http.ClientResponse@close()
- err (Error): The error object

Indicates that the underlaying connection was terminated before the `end` event was emitted.

For more information, see [http.ServerRequest]'s `'close'` event.



## http.ClientResponse.statusCode -> Number

The 3-digit HTTP response status code, like `200`, `404`, e.t.c.




## http.ClientResponse.httpVersion -> String

The HTTP version of the connected-to server. Usually either `'1.1'` or `'1.0'`. `response.httpVersionMajor` is the first integer and `response.httpVersionMinor` is the second.




## http.ClientResponse.header -> Object

The response headers object.



## http.ClientResponse.trailers -> Object

The response trailers object. Only populated after the `end` event.




## http.ClientResponse.setEncoding([encoding=null]) -> Void
- encoding (String): The encoding to use. Defaults to `null`, which means that the `'data'` event will emit a `Buffer` object.

Set the encoding for the response body, either `'utf8'`, `'ascii'`, or `'base64'`.
 



## http.ClientResponse.pause() -> Void

Pauses the response from emitting events.  Useful to throttle back a download.



## http.ClientResponse.resume() -> Void

Resumes a paused response.
