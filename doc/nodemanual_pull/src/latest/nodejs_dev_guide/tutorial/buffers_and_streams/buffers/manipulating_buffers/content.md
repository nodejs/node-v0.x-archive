# Manipulating Buffers

Javascript, as a language refined to exist on the browser, has many excellent ways to deal with strings. However, Node.js applications must also interact with various streams, either with the file system or TCP, as well as handling many other forms of binary data. That's where buffers come in. When you end up writing a bunch of information through a socket, it's more efficient to have that data in binary format.

A buffer is a tricky thing to define. It's basically an array of bytes, an entity composed of raw data. The array isn't resizable, and in fact, you shouldn't really use any array classes. Most methods dealing with files or server responses in Node.js are actually buffers. 

<Note>For more detailed information, see [the Node.js API Reference documentation on buffers](../nodejs_ref_guide/buffer.html).</Note>

Unless you specify otherwise, most data handled in Node.js is stored as a buffer as well. You can get around this often by specifying an optional encoding, such as `'utf8'` or `'ascii'`.