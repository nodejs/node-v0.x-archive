#include "lring.h"
#include "atomic.h"
#include "pa_memorybarrier.h"
#include <sys/types.h> /* ssize_t, size_t */
#include <stdlib.h> /* malloc, free */
#include <string.h> /* memcpy */
#include <assert.h>

void lring_init_page(lring_page_t* page) {
  page->next = page;
  page->roffset = 0;
  page->woffset = 0;
}

void lring_init(lring_t* ring) {
  ring->total = 0;
  ring->rhead = &ring->head;
  ring->whead = &ring->head;

  lring_init_page(&ring->head);
}


void lring_destroy(lring_t* ring) {
  ring->rhead = NULL;
  ring->whead = NULL;
  ring->total = 0;

  /* Destroy all pages */
  while (ring->head.next != &ring->head) {
    lring_page_t* next = ring->head.next;
    ring->head.next = next->next;
    free(next);
  }
}


ssize_t lring_size(lring_t* ring) {
  ssize_t total;

  total = ring->total;

  /* Sometimes total could be less than zero */
  if (total >= 0) return total;
  return 0;
}


void lring_write(lring_t* ring, const char* data, ssize_t size) {
  ssize_t left;
  ssize_t offset;
  ssize_t woffset;
  ssize_t available;
  ssize_t bytes;
  lring_page_t* p;

  left = size;
  offset = 0;
  p = ring->whead;

  while (left > 0) {
    available = sizeof(p->data) - p->woffset;
    bytes = available > left ? left : available;

    assert((size_t)(p->woffset + bytes) <= sizeof(p->data));
    memcpy(p->data + p->woffset, data + offset, bytes);

    offset += bytes;
    left -= bytes;

    woffset = p->woffset + bytes;
    p->woffset = woffset;

    if (woffset == sizeof(p->data)) {
      lring_page_t* next = p->next;

      if (ring->rhead != next &&
          next->roffset == sizeof(next->data) &&
          next->woffset == sizeof(next->data)) {
        /* Fully written and read buffer is the same thing as empty */
        next->roffset = 0;
        next->woffset = 0;
      } else if (next->woffset != 0) {
        /* Tail is full now - get a new one */
        next = malloc(sizeof(lring_page_t));
        if (next == NULL) abort();
        lring_init_page(next);
        next->next = p->next;

        /* Insert buffer into ring */
        *((volatile lring_page_t**) &p->next) = next;
      }
      p = next;

      /* Move write head */
      ring->whead = p;

      assert(ring->whead->woffset == 0);
      assert(ring->whead->roffset == 0);
    }

    PaUtil_WriteMemoryBarrier();
    ATOMIC_ADD(ring->total, bytes);
  }
  assert(size == offset);
}


ssize_t lring_read(lring_t* ring, char* data, ssize_t size) {
  ssize_t left;
  ssize_t offset;
  ssize_t roffset;
  ssize_t avail;
  ssize_t bytes;
  lring_page_t* p;

  left = size;
  offset = 0;
  p = ring->rhead;

  while (ring->total > 0 && left > 0) {
    PaUtil_ReadMemoryBarrier();

    avail = p->woffset - p->roffset;
    bytes = avail > left ? left : avail;

    /* Copy only if there's place to save data */
    if (data != NULL && bytes != 0) {
      assert(avail >= bytes);
      memcpy(data + offset, p->data + p->roffset, bytes);
    }

    left -= bytes;
    offset += bytes;

    roffset = p->roffset + bytes;
    p->roffset = roffset;
    ATOMIC_SUB(ring->total, bytes);

    assert(roffset >= 0);

    if (roffset == sizeof(p->data)) {
      /* Move rhead if we can't read there anymore */
      p = p->next;
      ring->rhead = p;
    }
  }

  return offset;
}


ssize_t lring_peek(lring_t* ring, char* data, ssize_t size) {
  ssize_t left;
  ssize_t offset;
  ssize_t avail;
  ssize_t bytes;
  lring_page_t* current;

  left = size;
  offset = 0;
  current = ring->rhead;

  /* Limit amount of bytes that can be actually read */
  if (left > ring->total) left = ring->total;

  while (left > 0) {
    avail = current->woffset - current->roffset;
    if (avail == 0) break;
    bytes = avail > left ? left : avail;

    assert(current->roffset + bytes <= current->woffset);
    memcpy(data + offset, current->data + current->roffset, bytes);

    offset += bytes;
    left -= bytes;

    current = current->next;
  }

  return offset;
}
