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

'use strict';

var Header = require('dns_message').Header,
    Question = require('dns_message').Question,
    OPT = require('dns_types').exported['OPT'],
    ResourceRecord = require('dns_resourcerecord'),
    consts = require('dns_consts'),
    util = require('util');

var Packet = exports.Packet = function(socket) {
  this._socket = socket;

  this.raw_ = undefined;

  this.label_index_ = {};

  this.header = new Header();

  Object.defineProperty(this, 'rcode', {
    get: function() {
      return this.header.rcode;
    },
    set: function(value) {
      this.header.rcode = value;
    },
    configurable: true
  });

  this.clearResources();
};

Packet.prototype.clearResources = function() {
  this.question = [];
  this.answer = [];
  this.authority = [];
  this.additional = [];
};

Packet.prototype.estimateSize = function() {
  var size = this.header.estimateSize();

  var estimate = function(rr) {
    size += rr.estimateSize();
  };

  this.question.forEach(estimate);
  this.answer.forEach(estimate);
  this.authority.forEach(estimate);
  this.additional.forEach(estimate);

  size += 4;
  return size;
};

Packet.prototype.send = function() {
  var buff = new Buffer(this.estimateSize());
  var len, pbuff;

  if (this._socket.tcp) {
    pbuff = buff.slice(2);
  } else {
    pbuff = buff;
  }

  len = this.pack(pbuff, 0);

  if (this._socket.tcp) {
    buff.writeUInt16BE(len, 0);
    len += 2;
  }

  this._socket.send(buff.slice(0, len));
};

Packet.prototype.pack = function(buff, pos) {
  var message, append, spos = pos, self = this;

  this.header.qdcount = this.question.length;
  this.header.ancount = this.answer.length;
  this.header.nscount = this.authority.length;
  this.header.arcount = this.additional.length;

  pos += this.header.pack(buff, pos);

  append = function(a) {
    a.parent = self;
    pos += a.pack(buff, pos);
  };

  this.question.forEach(append);
  this.answer.forEach(append);
  this.authority.forEach(append);
  this.additional.forEach(append);

  return pos - spos;
};

Packet.prototype.unpack = function(msg, promote) {
  var pos = 0, parse_section, read;

  msg = new Buffer(msg);
  this.raw_ = msg;

  this.header = new Header();
  read = this.header.unpack(msg, pos);
  pos += read;

  parse_section = function(count, Type, p) {
    var i, t, read, ret = [];

    for (i = 0; i < count; i++) {
      t = new Type();
      read = t.unpack(msg, pos);
      pos += read;

      if (p) {
        t = t.promote();
      }

      ret.push(t);
    }

    return ret;
  };

  this.question = parse_section(this.header.qdcount, Question);
  this.answer = parse_section(this.header.ancount, ResourceRecord, promote);
  this.authority = parse_section(this.header.nscount, ResourceRecord, promote);
  this.additional = parse_section(this.header.arcount, ResourceRecord, promote);
};

Packet.prototype.isEDNS = function() {
  return this.additional.length > 0 &&
         this.additional[0].type === consts.NAME_TO_QTYPE.OPT;
};

Packet.prototype.promote = function(autopromote) {
  var newInstance;

  if (!this.isEDNS()) {
    return this;
  }

  newInstance = new EDNSPacket(this._socket, this._rinfo);
  newInstance.unpack(this.raw_, autopromote);

  return newInstance;
};

Packet.prototype.compare = function(obj) {
  var same = true, self = this;

  same = this.header.compare(obj.header);

  var cmp = function(field, rr, idx) {
    if (same) {
      same = rr.compare(obj[field][idx]);
      if (!same) {
        console.log('mismatch', field);
      }
    }
  };

  this.question.forEach(function(rr, idx) { cmp('question', rr, idx); });
  this.answer.forEach(function(rr, idx) { cmp('answer', rr, idx); });
  this.authority.forEach(function(rr, idx) { cmp('authority', rr, idx); });
  this.additional.forEach(function(rr, idx) { cmp('additional', rr, idx); });

  return same;
};

Packet.prototype.toString = function() {
  var ret = [];

  ret.push(this.header.toString());
  ret.push('');

  var pushit = function(p) {
    ret.push(p.toString());
  };

  if (this.question.length) {
    ret.push(';; QUESTION SECTION:');
    this.question.forEach(function(q) {
      ret.push('; ' + q.toString());
    });
    ret.push('');
  }

  if (this.answer.length) {
    ret.push(';; ANSWER SECTION:');
    this.answer.forEach(pushit);
    ret.push('');
  }

  if (this.authority.length) {
    ret.push(';; AUTHORITY SECTION:');
    this.authority.forEach(pushit);
    ret.push('');
  }

  if (this.additional.length) {
    if (this.additional[0].type !== consts.NAME_TO_QTYPE.OPT) {
      ret.push(';; ADDITIONAL SECTION:');
      this.additional.forEach(pushit);
      ret.push('');
    }
  }

  ret.push(';; END');

  return ret.join('\n');
};

var EDNSPacket = exports.EDNSPacket = function(socket, rinfo) {
  Packet.call(this, socket, rinfo);

  Object.defineProperty(this, 'opt', {
    get: function() {
      var promoted;

      if (this.additional.length === 0) {
        this.additional.push(new OPT());
      }

      promoted = this.additional[0] instanceof OPT;

      if (!promoted) {
        this.additional[0] = this.additional[0].promote();
      }

      return this.additional[0];
    }
  });

  Object.defineProperty(this, 'rcode', {
    get: function() {
      return this.header.rcode + (this.opt.rcode << 4);
    },
    set: function(value) {
      this.opt.rcode = value >> 4;
      this.header.rcode = value - (this.opt.rcode << 4);
    },
    configurable: true
  });

  Object.defineProperty(this, 'version', {
    get: function() {
      return this.opt.version;
    },
    set: function(value) {
      this.opt.version = value;
    }
  });

  Object.defineProperty(this, 'udpSize', {
    get: function() {
      return this.opt.udpSize;
    },
    set: function(value) {
      this.opt.udpSize = value;
    }
  });

  Object.defineProperty(this, 'do', {
    get: function() {
      return this.opt.do;
    },
    set: function(value) {
      this.opt.do = value;
    }
  });

  this.version = 0;
  this.udpSize = 4096;
  this.do = 1;
};
util.inherits(EDNSPacket, Packet);
