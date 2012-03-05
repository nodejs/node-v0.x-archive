var assert = require('assert');

var dgram = require('dgram');

var socket = dgram.createSocket('udp4');

socket.on('listening', function () {
  socket.close();
});


assert.doesNotThrow( 
  function(){
    socket.bind();
  },
  Error,
  'Unexpected Exception');
