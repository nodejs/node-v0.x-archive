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

#ifndef SSL_SESS_STORAGE_H_
#define SSL_SESS_STORAGE_H_

#include "node.h"

#include <openssl/ssl.h>
#include <stdint.h> // uint32_t

namespace node {
namespace crypto {

class SessionStorage {
 public:
  class KeyValue {
   public:
    KeyValue(unsigned char* key, int len, unsigned char* value, int value_len);

    ~KeyValue() {
      delete key_;
      delete value_;
    }

    inline bool Equals(unsigned char* key, int len);

   protected:
    unsigned char* key_;
    int len_;
    unsigned char* value_;
    int value_len_;
    uint64_t created_;

    friend class SessionStorage;
  };

  SessionStorage(SSL_CTX* ctx, int size, uint64_t timeout);

  int GetIndex(unsigned char* key, int len);
  void RemoveExpired();

  static SessionStorage* Init(SSL_CTX* ctx, int size, int64_t timeout);
  static inline uint32_t Hash(unsigned char* key, int len);
  static int New(SSL* ssl, SSL_SESSION* sess);
  static void Remove(SSL_CTX* ctx, SSL_SESSION* sess);
  static SSL_SESSION* Get(SSL* ssl, unsigned char* id, int len, int* copy);

 protected:
  SSL_CTX* ctx_;

  KeyValue** map_;
  uint32_t size_;
  uint32_t mask_;
  uint64_t expire_timeout_;

  // Max serialized session size
  static const int kMaxSessionSize = 1024 * 8;

  // Index in SSL_CTX where SessionStorage instance will be stored
  static int ssl_idx;
};

} // namespace crypto
} // namespace node

#endif // SSL_SESS_STORAGE_H_
