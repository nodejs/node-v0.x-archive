function testBufferWithReturn(){
    var buffer = new Buffer(50);
    var offset = 0;

    console.time('buffer with return x 100K');

    for(var i = 0; i < 100000; i++){
        offset = 0;

        offset = buffer.writeUInt8(1, offset);

        offset = buffer.writeUInt16BE(2, offset);

        offset = buffer.writeUInt32BE(3, offset);

        offset = buffer.writeInt8(-1, offset);

        offset = buffer.writeInt16BE(-2, offset);

        offset = buffer.writeInt32BE(-3, offset);

        offset = buffer.writeFloatBE(1.234, offset);

        offset = buffer.writeDoubleBE(1.234, offset);
    }

    console.timeEnd('buffer with return x 100K');
}

console.time('buffer with return x 1 Million');

for(var x=0; x<10; x++){
    testBufferWithReturn();
}

console.timeEnd('buffer with return x 1 Million');
