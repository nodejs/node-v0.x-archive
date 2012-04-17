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

var ipaddr = require('dns_ipaddr');

var Struct = exports.Struct = function(field_name, format) {
  var size, write, read;

  switch (format) {
    case 'B':
      write = 'writeUInt8';
      read = 'readUInt8';
      size = 1;
      break;
    case 'H':
      write = 'writeUInt16BE';
      read = 'readUInt16BE';
      size = 2;
      break;
    case 'I':
      write = 'writeUInt32BE';
      read = 'readUInt32BE';
      size = 4;
      break;
    case 'i':
      write = 'writeInt32BE';
      read = 'readInt32BE';
      size = 4;
      break;
  };

  var field = {
    name: field_name,
    default: 0,
    pack: function(value, buf,  pos) {
      buf[write](value, pos);
      return size;
    },
    unpack: function(buff, pos) {
      var value = buff[read](pos);
      return {
        read: size,
        value: value,
      };
    },
    size: size
  };

  return field;
};

var SubField = exports.SubField = function(field_name, parent, shift, mask) {
  var field = {
    name: field_name,
    default: 0,
    get: function(self) {
      var v = self[parent];
      return (v & mask) >> shift;
    },
    set: function(self, value) {
      var cval = self[parent] - (self[parent] & mask);
      cval += (value << shift) & mask;
      self[parent] = cval;
    }
  };
  return field;
};

var Label = exports.Label = function(field_name) {
  var field = {
    name: field_name,
    default: '',
    pack: function(value, buf, pos) {
      return name_pack(value, buf, pos, this.parent.label_index_);
    },
    unpack: name_unpack,
    size: function(value) {
      return value.length;
    }
  };

  return field;
};

var IPAddress = exports.IPAddress = function(field_name, byte_length) {
  var size;

  switch (byte_length) {
    case 4:
      size = 4;
      break;
    case 6:
      size = 16;
      break;
  };

  var field = {
    name: field_name,
    size: size,
    pack: function(value, buf, pos) {
      var i, bytes, ret;
      bytes = ipaddr.parse(value).toByteArray();

      bytes.forEach(function(b, i) {
        buf.writeUInt8(b, i + pos);
      });

      return bytes.length;
    },
    unpack: function(buff, pos) {
      var i, Kind, read = 0, bytes = [];

      switch (byte_length) {
        case 4:
          Kind = ipaddr.IPv4;
          for (i = 0; i < byte_length; i++) {
            bytes.push(buff.readUInt8(pos));
            read += 1;
            pos += 1;
          }
          break;
        case 6:
          Kind = ipaddr.IPv6;
          for (i = 0; i < 8; i++) {
            bytes.push(buff.readUInt16BE(pos));
            read += 2;
            pos += 2;
          }
          break;
      }

      return {
        read: read,
        value: new Kind(bytes).toString(),
      };
    }
  };

  return field;
};

var BufferField = exports.BufferField = function(field_name, format) {
  var field = {
    name: field_name,
    pack: function(value, buf, pos) {
      var len = 2;
      buf.writeUInt16BE(value.length, pos);
      value.copy(buf, pos + len, 0, value.length);
      return len + value.length;
    },
    unpack: function(buff, pos) {
      var value_len, value, size, field_pos, start = pos;

      value_len = buff.readUInt16BE(pos);
      size = 2;

      pos += size;
      field_pos = pos;

      value = buff.slice(pos, pos + value_len);
      pos += value_len;

      return {
        read: pos - start,
        value: value,
        field_position: field_pos,
      };
    },
    size: function(value) {
      return value.length;
    }
  };

  return field;
};

var CharString = exports.CharString = function(field_name) {
  var field = {
    name: field_name,
    value: '',
    get: function(self) {
      return self.rdata.toString('ascii', 1, self.rdata.readUInt8(0) + 1);
    },
    set: function(self, value) {
      var v = new Buffer(value.length + 1);
      v.writeUInt8(value.length, 0);
      v.write(value, 1);
      self.rdata = v;
    },
    size: function(value) {
      return value.length;
    }
  };

  return field;
};

var LABEL_POINTER = 0xC0;

var isPointer = function(len) {
  return (len & LABEL_POINTER) === LABEL_POINTER;
};

var name_unpack = function(buff, pos) {
  var hit_label,
      read_size,
      end,
      increaseRead,
      increasePosition,
      readLen,
      parts,
      len;

  parts = [];
  read_size = 0;
  hit_label = false;

  increaseRead = function(length) {
    if (length === undefined) {
      length = 1;
    }

    if (!hit_label) {
      read_size += length;
    }
  };

  increasePosition = function(length) {
    if (length === undefined) {
      length = 1;
    }
    increaseRead(length);
    pos += length;
  };

  readLen = function() {
    len = buff.readUInt8(pos);
    increasePosition();
  };

  readLen();

  while (len !== 0) {
    if (isPointer(len)) {
      len -= LABEL_POINTER;
      len = len << 8;
      pos = len + buff.readUInt8(pos);
      increaseRead();
      hit_label = true;
    } else {
      end = pos + len;
      parts.push(buff.toString('ascii', pos, end));
      increasePosition(len);
    }

    readLen();
  }

  return {
    read: read_size,
    value: parts.join('.')
  };
};

function splitMax(str, sep, max) {
  var tmp = str.split(sep, max),
      txt = tmp.join(sep),
      rest = str.replace(txt, '').replace(sep, '');
  tmp.push(rest)
  return tmp
}

var name_pack = function(str, buff, buf_pos, index) {
  var written = 0,
      found_ptr = false,
      written_parts = [],
      parts, name, left;

  var compress = function(s) {
    if (!s) { return false; }

    var offset = index[s];
    if (offset) {
      offset = (LABEL_POINTER << 8) + offset;
      buff.writeUInt16BE(offset, buf_pos + written);
      written += 2;
      return true;
    }
    return false;
  };

  var splitStr = function(s) {
    if (s && s.length) {
      parts = splitMax(s, '.', 1);
      name = parts[0];
      if (parts.length > 1) {
        left = parts[1];
      } else {
        left = undefined;
      }
    } else {
      parts = [];
      name = undefined;
      left = undefined;
    }
  };

  found_ptr = compress(str);
  splitStr(str);

  while (!found_ptr && parts.length > 0) {
    written_parts.push({
      value: name,
      offset: written + buf_pos,
    });

    buff.writeUInt8(name.length, written + buf_pos);
    written += 1;
    buff.write(name, written + buf_pos, name.length);
    written += name.length;

    found_ptr = compress(left);
    splitStr(left);
  }

  if (!found_ptr) {
    buff.writeUInt8(0, written + buf_pos);
    written += 1;
  }

  if (written_parts.length) {
    var i = written_parts.length;
    while (i > 0) {
      var key = written_parts.slice(i-1);
      var names = [];
      key.forEach(function(k) { names.push(k.value); });
      index[names.join('.')] = key[0].offset;
      i -= 1;
    }
  }

  return written;
};
