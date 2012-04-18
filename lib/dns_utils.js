// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE

var ipaddr = require('dns_ipaddr');

var Socket = exports.Socket = function(local, remote) {
  this.remote = remote;
  this.local = local;
  if (this.local) {
    this.tcp = false;
  } else {
    this.tcp = true;
  }
};

Socket.prototype.send = function(buff) {
  if (this.local) {
    this.local.send(buff, 0, buff.length,
                    this.remote.port, this.remote.address);
  } else {
    this.remote.write(buff);
  }
};

var TCPMessage = exports.TCPMessage = function(socket, handleMessage) {
  var self = this, rest;

  this.socket = new Socket(null, socket);

  socket.on('data', function(data) {
    var len, tmp;
    if (!rest) {
      rest = data;
    } else {
      tmp = new Buffer(rest.length + data.length);
      rest.copy(tmp, 0);
      data.copy(tmp, rest.length);
      rest = tmp;
    }
    while (rest && rest.length > 2) {
      len = rest.readUInt16BE(0);
      if (rest.length >= len + 2) {
        handleMessage(rest.slice(2, len + 2), self.socket);
        rest = rest.slice(len + 2);
      } else {
        break;
      }
    }
  });
};

exports.reverseIP = function(ip) {
  var address, kind, reverseip, parts;
  address = ipaddr.parse(ip);
  kind = address.kind();

  switch (kind) {
    case 'ipv4':
      address = address.toByteArray();
      address.reverse();
      reverseip = address.join('.') + '.IN-ADDR.ARPA';
      break;
    case 'ipv6':
      parts = [];
      address.toNormalizedString().split(':').forEach(function(part) {
        var i, pad = 4 - part.length;
        for (i = 0; i < pad; i++) {
          part = '0' + part;
        }
        part.split('').forEach(function(p) {
          parts.push(p);
        });
      });
      parts.reverse();
      reverseip = parts.join('.') + '.IP6.ARPA';
      break;
  }

  return reverseip;
};
