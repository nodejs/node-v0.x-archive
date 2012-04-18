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

var util = require('util'),
    consts = require('dns_consts'),
    Message = require('dns_message').Message,
    fields = require('dns_fields');

var resourceFields = [
  fields.Label('name'),
  fields.Struct('type', 'H'),
  fields.Struct('class', 'H'),
  fields.Struct('ttl', 'I'),
  fields.BufferField('rdata', 'H')
];

var ResourceRecord = function(vals) {
  this._fields = resourceFields;
  Message.call(this);
  this.class = 1;
  this.initialize(vals);
};
util.inherits(ResourceRecord, Message);

ResourceRecord.prototype.initialize = function(vals) {
  var k;

  if (vals) {
    for (k in vals) {
      if (vals.hasOwnProperty(k)) {
        this[k] = vals[k];
      }
    }
  }
};

ResourceRecord.prototype.estimateSize = function() {
  var base, rdata;
  base = this.estimateSizeFields(this._fields.slice(0, 3));
  rdata = this.estimateSizeFields(this._rdata_fields);
  return base + rdata;
};

ResourceRecord.prototype.pack = function(buff, pos) {
  /* XXX
   * this presumes that the accessor takes care of packing
   * could have interesting side effects if you're trying to
   * reuse full packets
   */
  var bdata, len, spos = pos;
  if (!this.rdata) {
    bdata = new Buffer(this.estimateSizeFields(this._rdata_fields) + 4);
    len = this.packFields(this._rdata_fields, bdata, 0);
    this.rdata = bdata.slice(0, len);
  }
  pos += Message.prototype.pack.call(this, buff, pos);
  return pos - spos;
};

ResourceRecord.prototype.unpackRData = function() {
  this.unpackFields(this._rdata_fields,
                    this.raw_,
                    this._fields[4].position);
};

ResourceRecord.prototype.toString = function () {
  var ret = [this.name,
         this.ttl,
         consts.QCLASS_TO_NAME[this.class],
         consts.QTYPE_TO_NAME[this.type]];
  if (this._rdata_fields) {
    ret.push(this.fieldsToString(this._rdata_fields));
  }
  return ret.join('\t');
};

module.exports = ResourceRecord;
