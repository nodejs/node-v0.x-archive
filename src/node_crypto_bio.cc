// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

#include "node_crypto_bio.h"
#include "openssl/bio.h"
#include <string.h>

namespace node {

BIO_METHOD NodeBIO::method_ = {
  BIO_TYPE_MEM,
  "node.js SSL buffer",
  NodeBIO::Write,
  NodeBIO::Read,
  NodeBIO::Puts,
  NodeBIO::Gets,
  NodeBIO::Ctrl,
  NodeBIO::New,
  NodeBIO::Free,
  NULL
};


int NodeBIO::New(BIO* bio) {
  NodeBIO* nbio = new NodeBIO();

  bio->ptr = reinterpret_cast<char*>(nbio);

  // XXX Why am I doing it?!
  bio->shutdown = 1;
  bio->init = 1;
  bio->num = -1;

  return 1;
}


int NodeBIO::Free(BIO* bio) {
  if (bio == NULL) return 0;

  if (bio->shutdown) {
    if (bio->init && bio->ptr != NULL) {
      delete FromBIO(bio);
      bio->ptr = NULL;
    }
  }

  return 1;
}


int NodeBIO::Read(BIO* bio, char* out, int len) {
  int bytes;
  BIO_clear_retry_flags(bio);

  bytes = FromBIO(bio)->Read(out, len);

  if (bytes == 0) {
    bytes = bio->num;
    if (bytes != 0) {
      BIO_set_retry_read(bio);
    }
  }

  return bytes;
}


int NodeBIO::Write(BIO* bio, const char* data, int len) {
  BIO_clear_retry_flags(bio);

  FromBIO(bio)->Write(data, len);

  return len;
}


int NodeBIO::Puts(BIO* bio, const char* str) {
  return Write(bio, str, strlen(str) + 1);
}


int NodeBIO::Gets(BIO* bio, char* out, int size) {
  NodeBIO* nbio;

  nbio = FromBIO(bio);
  assert(nbio != NULL);

  int len = FromBIO(bio)->Peek(out, size);
  if (len == 0)
    return 0;

  int i = 0;
  char* tmp = out;
  while (i < len && *tmp != '\n') {
    i++;
    tmp++;
  }

  // Include newline char
  if (*tmp == '\n' && i < size) i++;

  // Flush read data
  FromBIO(bio)->Read(NULL, i);

  // Terminate line
  if (size == i) i--;
  out[i] = 0;

  return i;
}


long NodeBIO::Ctrl(BIO* bio, int cmd, long num, void* ptr) {
  NodeBIO* nbio;
  long ret;

  nbio = FromBIO(bio);
  ret = 1;

  switch (cmd) {
   case BIO_CTRL_RESET:
    nbio->Reset();
    break;
   case BIO_CTRL_EOF:
    ret = nbio->Length() == 0;
    break;
   case BIO_C_SET_BUF_MEM_EOF_RETURN:
    bio->num = num;
    break;
   case BIO_CTRL_INFO:
    ret = nbio->Length();
    if (ptr != NULL)
      *reinterpret_cast<void**>(ptr) = NULL;
    break;
   case BIO_C_SET_BUF_MEM:
    Free(bio);
    bio->shutdown = num;
    bio->ptr = ptr;
    break;
   case BIO_C_GET_BUF_MEM_PTR:
    if (ptr != NULL)
      *reinterpret_cast<NodeBIO**>(ptr) = nbio;
    break;
   case BIO_CTRL_GET_CLOSE:
    ret = bio->shutdown;
    break;
   case BIO_CTRL_SET_CLOSE:
    bio->shutdown = num;
    break;
   case BIO_CTRL_WPENDING:
    ret = 0;
    break;
   case BIO_CTRL_PENDING:
    ret = nbio->Length();
    break;
   case BIO_CTRL_DUP:
   case BIO_CTRL_FLUSH:
    ret = 1;
    break;
   case BIO_CTRL_PUSH:
   case BIO_CTRL_POP:
   default:
    ret = 0;
    break;
  }
  return ret;
}


size_t NodeBIO::Read(char* out, size_t len) {
  size_t bytes_read = 0;
  size_t expected = Length() > len ? len : Length();

  while (bytes_read < expected) {
    assert(read_head_->read_pos < read_head_->write_pos);
    size_t avail = read_head_->write_pos - read_head_->read_pos;
    if (avail > len)
      avail = len;

    // Copy data
    memcpy(out, read_head_->data + read_head_->read_pos, avail);
    read_head_->read_pos += avail;

    // Move pointers
    bytes_read += avail;
    out += avail;
    len -= avail;

    // Move to next buffer
    if (read_head_->read_pos == kBufferLength) {
      read_head_->read_pos = 0;
      read_head_->write_pos = 0;
      read_head_ = read_head_->next;
    }
  }
  assert(expected == bytes_read);
  length_ -= bytes_read;

  return bytes_read;
}


size_t NodeBIO::Peek(char* out, size_t size) {
  size_t bytes_read = 0;
  size_t expected = Length() > size ? size : Length();
  Buffer* current = read_head_;

  while (bytes_read < expected) {
    assert(current->read_pos < current->write_pos);
    size_t avail = current->write_pos - current->read_pos;

    // Copy data
    memcpy(out, current->data + current->read_pos, avail);

    // Move pointers
    bytes_read += avail;
    out += avail;

    // Move to next buffer
    if (current->read_pos + avail == kBufferLength)
      current = current->next;
  }
  assert(expected == bytes_read);

  return bytes_read;
}


void NodeBIO::Write(const char* data, size_t len) {
  while (len > 0) {
    size_t to_write = len;
    size_t avail = kBufferLength - write_head_->write_pos;

    if (to_write > avail)
      to_write = avail;

    // Copy data
    memcpy(write_head_->data + write_head_->write_pos, data, to_write);
    write_head_->write_pos += to_write;
    assert(write_head_->write_pos <= kBufferLength);

    // Move pointers
    len -= to_write;
    data += to_write;
    length_ += to_write;

    // Still have some bytes left:
    //  1. Go to next buffer
    //  2. Allocate new if next is already full or is partially read
    //     (is read head)
    if (len > 0) {
      if (write_head_->next->write_pos == kBufferLength ||
          write_head_->next->read_pos != 0) {
        Buffer* next = new Buffer();
        next->next = write_head_->next;
        write_head_->next = next;
      }
      write_head_ = write_head_->next;
    }
  }
  assert(len == 0);
}


void NodeBIO::Reset() {
  while (read_head_->read_pos != read_head_->write_pos) {
    assert(read_head_->write_pos - read_head_->read_pos > 0);

    length_ -= read_head_->write_pos - read_head_->read_pos;
    read_head_->write_pos = 0;
    read_head_->read_pos = 0;

    read_head_ = read_head_->next;
  }
  assert(length_ == 0);
}


NodeBIO::~NodeBIO() {
  Buffer* i = head_.next;
  while (i != &head_) {
    Buffer* next = i->next;
    delete i;
    i = next;
  }

  read_head_ = NULL;
  write_head_ = NULL;
}

} // namespace node
