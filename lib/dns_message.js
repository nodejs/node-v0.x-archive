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

var assert = require('assert'),
    consts = require('dns_consts'),
    fields = require('dns_fields'),
    util = require('util');

var Message = exports.Message = function() {
  this.initializeFields(this._fields);
  if (this._sub_fields) {
    this.initializeFields(this._sub_fields);
  }
};

Message.prototype.initializeFields = function(fields) {
  var self = this;
  fields.forEach(function(field) {
    self[field.name] = field.default;
  });
};

Message.prototype.unpack = function(buff, pos) {
  var ret;

  this.record_position_ = pos;
  this.raw_ = buff;

  ret = this.unpackFields(this._fields, buff, pos);

  if (this._sub_fields) {
    this.unpackFields(this._sub_fields, buff, pos);
  }

  return ret;
};

Message.prototype.unpackFields = function(fields, buff, pos) {
  var self = this, start = pos;

  fields.forEach(function(field) {
    var value;
    if (field.get) {
      value = field.get(self);
    } else {
      var ret, start;

      start = pos;

      try {
        ret = field.unpack(buff, pos);
      } catch (e) {
        var err = new Error('Failed to unpack: ' + field.name + ' -- ' + e +
                            ' [bufflen: ' + buff.length + ', pos: ' + pos +
                            ']');
        err.inner = e;
        err.raw = buff;
        err.pos = pos;
        throw err;
      }

      pos += ret.read;
      value = ret.value;

      if (ret.field_position) {
        field.position = ret.field_position;
      } else {
        field.position = start;
      }
    }
    self[field.name] = value || field.default;
  });

  return pos - start;
};

Message.prototype.pack = function(buff, pos) {
  if (this._sub_fields) {
    this.packFields(this._sub_fields, buff, pos);
  }
  return this.packFields(this._fields, buff, pos);
};

Message.prototype.packFields = function(fields, buff, pos) {
  var spos = pos, self = this;

  fields.forEach(function(field) {
    var value = self[field.name];

    if (field.set) {
      field.set(self, value);
    } else {
      try {
        pos += field.pack.call(self, value, buff, pos);
      } catch (e) {
        var err = new Error('Failed to pack: ' + field.name + ' -- ' + e +
                            ' [bufflen: ' + buff.length + ', pos: ' + pos +
                            ']');
        err.inner = e;
        err.raw = buff;
        err.pos = pos;
        throw err;
      }
    }
  });

  return pos - spos;
};

Message.prototype.estimateSize = function() {
  return this.estimateSizeFields(this._fields);
};

Message.prototype.estimateSizeFields = function(fields) {
  var size = 0, self = this;
  fields.forEach(function(field) {
    var value = self[field.name];
    if (!field.size.call) {
      size += field.size;
    } else {
      size += field.size(value);
    }
  });
  return size;
};

Message.prototype.compare = function(obj) {
  var base, sub = true, rdata = true;

  base = this.compareFields(this._fields, obj);

  if (this._sub_fields)
    sub = this.compareFields(this._sub_fields, obj);

  if (this._rdata_fields)
    rdata = this.compareFields(this._rdata_fields, obj);

  return base && sub && rdata;
};

Message.prototype.compareFields = function(fields, obj) {
  var same = true, self = this;
  fields.forEach(function(field) {
    if (same) {
      try {
        assert.deepEqual(self[field.name], obj[field.name]);
      } catch (e) {
        same = false;
      }
    }
  });
  return same;
};

Message.prototype.fieldsToString = function(fields) {
  var ret = [], self = this;
  fields.forEach(function(field) {
    ret.push(self[field.name]);
  });
  return ret.join('\t');
};

Message.prototype.toString = function() {
  var ret = this.fieldsToString(this._fields);

  if (this._sub_fields) {
    ret += '\t' + this.fieldsToString(this._sub_fields);
  }

  return ret;
};

var questionFields = [
  fields.Label('name'),
  fields.Struct('type', 'H'),
  fields.Struct('class', 'H')
];

var Question = exports.Question = function() {
  this._fields = questionFields;
  Message.call(this);
  this.class = 1;
};
util.inherits(Question, Message);

Question.prototype.toString = function() {
  return [this.name,
          consts.QCLASS_TO_NAME[this.class],
          consts.QTYPE_TO_NAME[this.type]].join('\t');
};

var headerFields = [
  fields.Struct('id', 'H'),
  fields.Struct('bitfields', 'H'),
  fields.Struct('qdcount', 'H'),
  fields.Struct('ancount', 'H'),
  fields.Struct('nscount', 'H'),
  fields.Struct('arcount', 'H')
];

var bitFields = [
  fields.SubField('qr', 'bitfields', 15, 0x8000),
  fields.SubField('opcode', 'bitfields', 11, 0x7800),
  fields.SubField('aa', 'bitfields', 10, 0x400),
  fields.SubField('tc', 'bitfields', 9, 0x200),
  fields.SubField('rd', 'bitfields', 8, 0x100),
  fields.SubField('ra', 'bitfields', 7, 0x80),
  fields.SubField('res1', 'bitfields', 6, 0x40),
  fields.SubField('res2', 'bitfields', 5, 0x20),
  fields.SubField('res3', 'bitfields', 4, 0x10),
  fields.SubField('rcode', 'bitfields', 0, 0xf)
];

var Header = exports.Header = function() {
  this._fields = headerFields;
  this._sub_fields = bitFields;
  Message.call(this);
};
util.inherits(Header, Message);

Header.prototype.toString = function() {
  var ret = [], tmp, flags = [];
  tmp = ';; ->>HEADER<<- opcode: ';
  switch (this.opcode) {
    case 0:
      tmp += 'QUERY';
      break;
    case 1:
      tmp += 'IQUERY';
      break;
    case 2:
      tmp += 'STATUS';
      break;
    default:
      tmp += 'UNKNOWN';
      break;
  }
  tmp += ', status: ' + consts.RCODE_TO_NAME[this.rcode];
  tmp += ', id: ' + this.id;
  ret.push(tmp);

  tmp = ';; flags: ';

  if (this.qr)
    flags.push('qr');
  if (this.rd)
    flags.push('rd');
  if (this.aa)
    flags.push('aa');
  if (this.tc)
    flags.push('tc');
  if (this.ra)
    flags.push('ra');

  tmp += flags.join(' ') + ';';

  tmp += ' QUESTON: ' + this.qdcount;
  tmp += ', ANSWER: ' + this.ancount;
  tmp += ', AUTHORITY: ' + this.nscount;
  tmp += ', ADDITIONAL: ' + this.arcount;

  ret.push(tmp);
  return ret.join('\n');
};
