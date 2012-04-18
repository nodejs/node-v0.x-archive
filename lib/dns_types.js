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

var ResourceRecord = require('dns_resourcerecord'),
    Message = require('dns_message').Message,
    util = require('util'),
    fields = require('dns_fields'),
    consts = require('dns_consts');

var RDataType = function(vals, type) {
  ResourceRecord.call(this, vals);
  this.type = type;
};
util.inherits(RDataType, ResourceRecord);

var TypeMap = function() {
  this.exported = {};
  this.map = {};
};

TypeMap.prototype.registerType = function(name, fields) {
  var newType = function(vals) {
    this._rdata_fields = fields;
    RDataType.call(this, vals, consts.NAME_TO_QTYPE[name]);
  };
  util.inherits(newType, RDataType);
  this.map[consts.NAME_TO_QTYPE[name]] = newType;
  this.exported[name] = newType;
};

TypeMap.prototype.fromQtype = function(qtype) {
  return this.map[qtype];
};

var types = new TypeMap();
module.exports = types;

types.registerType('SOA',
                   [
                     fields.Label('primary'),
                     fields.Label('admin'),
                     fields.Struct('serial', 'I'),
                     fields.Struct('refresh', 'i'),
                     fields.Struct('retry', 'i'),
                     fields.Struct('expiration', 'i'),
                     fields.Struct('minimum', 'i')
                   ]);

types.registerType('A', [fields.IPAddress('address', 4)]);
types.registerType('AAAA', [fields.IPAddress('address', 6)]);

types.registerType('MX',
                   [
                     fields.Struct('priority', 'H'),
                     fields.Label('exchange')
                   ]);

types.registerType('TXT', [fields.CharString('data')]);

types.registerType('SRV',
                   [
                     fields.Struct('priority', 'H'),
                     fields.Struct('weight', 'H'),
                     fields.Struct('port', 'H'),
                     fields.Label('target')
                   ]);

types.registerType('NS', [fields.Label('data')]);
types.registerType('CNAME', [fields.Label('data')]);
types.registerType('PTR', [fields.Label('data')]);

var ednsFields = [
  fields.Label('name'),
  fields.Struct('type', 'H'),
  fields.Struct('udpSize', 'H'),
  fields.Struct('rcode', 'B'),
  fields.Struct('version', 'B'),
  fields.Struct('bitfields', 'H'),
  fields.BufferField('rdata', 'H')
];

var bitFields = [fields.SubField('do', 'bitfields', 15, 0x8000)];

var OptField = function() {
  this._fields = [
    fields.Struct('code', 'H'),
    fields.BufferField('data', 'H')
  ];
  Message.call(this);
};
util.inherits(OptField, Message);

var OPT = function(vals) {
  this._fields = ednsFields;
  this._sub_fields = bitFields;
  Message.call(this);

  this.type = consts.NAME_TO_QTYPE.OPT;
  this.options = [];

  this.initialize(vals);
};
util.inherits(OPT, Message);

types.map[consts.NAME_TO_QTYPE.OPT] = OPT;
types.exported['OPT'] = OPT;

OPT.prototype.initialize = ResourceRecord.prototype.initialize;

OPT.prototype.pack = function(buff, pos) {
  var spos = pos;

  this.options.forEach(function(field) {
    pos += field.pack(buff, pos);
  });

  this.rdata = buff.slice(spos, pos);

  return Message.prototype.pack.call(this, buff, pos);
};

OPT.prototype.unpackRData = function() {
  var field, offset, rdata_pos;

  offset = 0;
  rdata_pos = this._fields[4].position;

  while (offset !== this.rdata.length) {
    field = new OptField();
    offset += field.unpack(this.raw_, rdata_pos + offset);
    this.options.push(field);
  }
};

OPT.prototype.estimateSize = function() {
  return this.estimateSizeFields(this._fields.slice(0, 6)) +
         this.estimateSizeFields(this.options) + 1;
};

OPT.prototype.toString = function() {
  return Message.prototype.toString.call(this) +
         '\t' + this.fieldsToString(this.options);
};

ResourceRecord.prototype.promote = function() {
  var Type = types.fromQtype(this.type), new_type;

  if (!Type) {
    console.log("couldn't promote type:", this.type);
    return this;
  }

  new_type = new Type();
  new_type.unpack(this.raw_, this.record_position_);
  new_type.unpackRData();

  return new_type;
};
