#ifndef _INCLUDE_LRING_H_
#define _INCLUDE_LRING_H_

#include <sys/types.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct lring_s lring_t;
typedef struct lring_page_s lring_page_t;

struct lring_page_s {
  lring_page_t* next;
  volatile ssize_t roffset;
  volatile ssize_t woffset;
  char data[10 * 1024];
};

struct lring_s {
  lring_page_t head;
  lring_page_t* rhead;
  lring_page_t* whead;
  volatile ssize_t total;
};

/* Initialize ring */
void lring_init(lring_t* ring);

/* Deinitialize ring (won't free memory) */
void lring_destroy(lring_t* ring);

/* Returns current size of the ring */
ssize_t lring_size(lring_t* ring);

/* Put data into ring */
void lring_write(lring_t* ring, const char* data, ssize_t size);

/*
 * Read at maximum `size` data from the ring,
 * returns actual amount of data that was read.
 * (NOTE: if `data` is NULL, lring_read will just flush that data).
 */
ssize_t lring_read(lring_t* ring, char* data, ssize_t size);

/*
 * Read data from ring without dequeuing it
 * (Works exactly like `lring_read`)
 */
ssize_t lring_peek(lring_t* ring, char* data, ssize_t size);

#ifdef __cplusplus
}
#endif
#endif /* _INCLUDE_LRING_H_ */
