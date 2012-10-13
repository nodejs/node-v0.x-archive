#include "lring_bio.h"
#include "lring.h"
#include <assert.h>
#include <string.h>

namespace node {

static int mem_write(BIO*, const char*, int);
static int mem_read(BIO*, char*, int);
static int mem_puts(BIO*, const char*);
static int mem_gets(BIO*, char*, int);
static long mem_ctrl(BIO*, int, long, void*);
static int mem_new(BIO*);
static int mem_free(BIO*);

#define BIO_TYPE_NO_EX_DATA 0x0800

static BIO_METHOD mem_method = {
  BIO_TYPE_MEM | BIO_TYPE_NO_EX_DATA,
  "Super lring buffer",
  mem_write,
  mem_read,
  mem_puts,
  mem_gets,
  mem_ctrl,
  mem_new,
  mem_free,
  NULL,
};


BIO_METHOD* BIO_lring() {
  return &mem_method;
}


static int mem_new(BIO* bio) {
  lring_t* ring = new lring_t();
  lring_init(ring);

  bio->ptr = reinterpret_cast<char*>(ring);

  // XXX Why am I doing it?!
  bio->shutdown = 1;
  bio->init = 1;
  bio->num = -1;

  return 1;
}


static int mem_free(BIO* bio) {
  if (bio == NULL) return 0;

  if (bio->shutdown) {
    if (bio->init && bio->ptr != NULL) {
      lring_t* ring = reinterpret_cast<lring_t*>(bio->ptr);
      lring_destroy(ring);
      delete ring;
      bio->ptr = NULL;
    }
  }

  return 1;
}


static int mem_read(BIO* bio, char* out, int len) {
  BIO_clear_retry_flags(bio);

  lring_t* r = reinterpret_cast<lring_t*>(bio->ptr);
  assert(r != NULL);

  if (lring_size(r) == 0) {
    BIO_set_retry_read(bio);
    return bio->num;
  }

  int bytes = static_cast<int>(lring_read(r, out, len));

  return bytes;
}


static int mem_write(BIO* bio, const char* data, int len) {
  lring_t* r = reinterpret_cast<lring_t*>(bio->ptr);

  BIO_clear_retry_flags(bio);

  assert(r != NULL);
  lring_write(r, data, len);

  return len;
}


static int mem_puts(BIO* bio, const char* str) {
  return mem_write(bio, str, static_cast<int>(strlen(str)) + 1);
}


static int mem_gets(BIO* bio, char* out, int size) {
  lring_t* r = reinterpret_cast<lring_t*>(bio->ptr);
  assert(r != NULL);

  int len = static_cast<int>(lring_peek(r, out, size));
  if (len == 0) return 0;

  int i;
  char* tmp = out;
  for (i = 0; i < len && *tmp != '\n'; i++, tmp++) {
    // Nop
  }

  // Include newline char
  if (*tmp == '\n' && i < size) i++;

  // Flush read data
  lring_read(r, NULL, i);

  // Terminate line
  if (size == i) i--;
  out[i] = 0;

  return i;
}


static long mem_ctrl(BIO* bio, int cmd, long num, void* ptr) {
  long ret = 1;

  lring_t* r = reinterpret_cast<lring_t*>(bio->ptr);
  assert(r != NULL);

  switch (cmd) {
   case BIO_CTRL_RESET:
    lring_read(r, NULL, lring_size(r));
    break;
   case BIO_CTRL_EOF:
    ret = lring_size(r) == 0;
    break;
   case BIO_C_SET_BUF_MEM_EOF_RETURN:
    bio->num = static_cast<int>(num);
    break;
   case BIO_CTRL_INFO:
    ret = static_cast<long>(lring_size(r));
    if (ptr != NULL)
      *reinterpret_cast<void**>(ptr) = NULL;
    break;
   case BIO_C_SET_BUF_MEM:
    mem_free(bio);
    bio->shutdown= static_cast<int>(num);
    bio->ptr = ptr;
    break;
   case BIO_C_GET_BUF_MEM_PTR:
    if (ptr != NULL)
      *reinterpret_cast<void**>(ptr) = r;
    break;
  case BIO_CTRL_GET_CLOSE:
    ret = static_cast<long>(bio->shutdown);
    break;
  case BIO_CTRL_SET_CLOSE:
    bio->shutdown = static_cast<int>(num);
    break;
  case BIO_CTRL_WPENDING:
    ret = 0L;
    break;
  case BIO_CTRL_PENDING:
    ret = static_cast<long>(lring_size(r));
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

} // namespace node
