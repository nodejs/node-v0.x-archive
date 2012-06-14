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

#include "node.h"
#include "ssl_sess_storage.h"

#include <string.h> // memset

#define UNWRAP_STORAGE(ctx)\
    SessionStorage* storage = reinterpret_cast<SessionStorage*>(\
        SSL_CTX_get_ex_data(ctx, ssl_idx));

namespace node {
namespace crypto {


int SessionStorage::ssl_idx = -1;


SessionStorage* SessionStorage::Init(SSL_CTX* ctx, int size, int64_t timeout) {
  SSL_CTX_set_session_cache_mode(ctx,
                                 SSL_SESS_CACHE_SERVER |
                                 SSL_SESS_CACHE_NO_INTERNAL |
                                 SSL_SESS_CACHE_NO_AUTO_CLEAR);
  SSL_CTX_sess_set_new_cb(ctx, SessionStorage::New);
  SSL_CTX_sess_set_get_cb(ctx, SessionStorage::Get);
  SSL_CTX_sess_set_remove_cb(ctx, SessionStorage::Remove);

  // Register storage's index
  if (ssl_idx == -1) {
    // TODO: Destroy SessionStorage somehow
    ssl_idx = SSL_CTX_get_ex_new_index(0, NULL, NULL, NULL, NULL);
    assert(ssl_idx != -1);
  }

  // Create new storage and put it inside SSL_CTX
  SessionStorage* storage = new SessionStorage(ctx, size, timeout);
  SSL_CTX_set_ex_data(ctx, ssl_idx, storage);

  return storage;
}


SessionStorage::SessionStorage(SSL_CTX* ctx, int size, uint64_t timeout)
    : ctx_(ctx),
      map_(new KeyValue*[size]),
      size_(size),
      mask_(size - 1),
      expire_timeout_(timeout) {
  // Nullify map
  memset(map_, 0, sizeof(map_[0]) * size_);
}


SessionStorage::KeyValue::KeyValue(unsigned char* key,
                                   int len,
                                   unsigned char* value,
                                   int value_len)
    : len_(len),
      value_(value),
      value_len_(value_len),
      created_(uv_hrtime()) {
  key_ = new unsigned char[len];
  memcpy(key_, key, len);
}


inline bool SessionStorage::KeyValue::Equals(unsigned char* key, int len) {
  if (len != len_) return false;
  return memcmp(key, key_, len) == 0;
}


// Jenkins hash function
inline uint32_t SessionStorage::Hash(unsigned char* key, int len) {
  uint32_t hash = 0;

  for (int i = 0; i < len; i++) {
    hash += key[i];
    hash += (hash << 10);
    hash ^= (hash >> 6);
  }

  hash += (hash << 3);
  hash ^= (hash >> 11);
  hash += (hash >> 6);

  return hash;
}


uint32_t SessionStorage::GetIndex(unsigned char* key, int len) {
  uint32_t start = Hash(key, len) & mask_;
  uint32_t index;
  int tries = 0;

  uint64_t expire_edge = uv_hrtime() - expire_timeout_;

  // Find closest cell with the same key value
  for (index = start; tries < 10; tries++, index = (index + 1) & mask_) {
    if (map_[index] == NULL) return index;

    // Remove expired items
    if (map_[index]->created_ < expire_edge) {
      delete map_[index];
      map_[index] = NULL;
      continue;
    }
    if (map_[index]->Equals(key, len)) return index;
  }

  // Cleanup all neighboors
  // TODO: Use some sort of MRU algorithm here
  for (index = start; tries < 10; tries++, index = (index + 1) & mask_) {
    delete map_[index];
    map_[index] = NULL;
  }

  return start;
}


void SessionStorage::RemoveExpired() {
  uint64_t expire_edge = uv_hrtime() - expire_timeout_;
  for (uint32_t i = 0; i < size_; i++) {
    if (map_[i] == NULL) continue;
    if (map_[i]->created_ < expire_edge) {
      delete map_[i];
      map_[i] = NULL;
    }
  }
}


int SessionStorage::New(SSL* ssl, SSL_SESSION* sess) {
  UNWRAP_STORAGE(ssl->ctx)

  // Check if session is small enough to be stored
  int size = i2d_SSL_SESSION(sess, NULL);
  if (size > kMaxSessionSize) return 0;

  // Serialize session
  unsigned char* serialized = new unsigned char[size];
  unsigned char* pserialized = serialized;
  memset(serialized, 0, size);
  i2d_SSL_SESSION(sess, &pserialized);

  // Put it into hashmap
  int index = storage->GetIndex(sess->session_id, sess->session_id_length);
  storage->map_[index] = new KeyValue(sess->session_id,
                                      sess->session_id_length,
                                      serialized,
                                      size);

  return 0;
}


void SessionStorage::Remove(SSL_CTX* ctx, SSL_SESSION* sess) {
  UNWRAP_STORAGE(ctx)

  int index = storage->GetIndex(sess->session_id, sess->session_id_length);

  delete storage->map_[index];
  storage->map_[index] = NULL;
}


SSL_SESSION* SessionStorage::Get(SSL* ssl,
                                 unsigned char* id,
                                 int len,
                                 int* copy) {
  UNWRAP_STORAGE(ssl->ctx)

  // Do not use ref-counting for this session
  *copy = NULL;

  int index = storage->GetIndex(id, len);

  KeyValue* kv = storage->map_[index];
  if (kv == NULL) return NULL;

  const unsigned char* buf = kv->value_;
  SSL_SESSION* sess = d2i_SSL_SESSION(NULL, &buf, kv->value_len_);

  return sess;
}


} // namespace crypto
} // namespace node
