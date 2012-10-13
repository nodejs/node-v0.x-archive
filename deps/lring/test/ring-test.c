#include "lring.h"
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <pthread.h>

#define NUM_ITERATIONS 1000000
#define WRITE_BUF 1023
#define READ_BUF 1023

static lring_t ring;

void* producer_fn(void* arg) {
  unsigned char buf[WRITE_BUF];
  int i;
  size_t j;
  int c;

  /* Running counter */
  c = 0;

  for (i = 0; i < NUM_ITERATIONS; i++) {
    for (j = 0; j < sizeof(buf); j++) {
      buf[j] = c;
      c = (c + 1) & 0xff;
    }

    lring_write(&ring, (const char*) buf, sizeof(buf));
  }

  return NULL;
}


void* consumer_fn(void* arg) {
  unsigned char buf[READ_BUF];
  ssize_t left;
  ssize_t read;
  int j;
  int c;

  left = WRITE_BUF * NUM_ITERATIONS;

  /* Running counter */
  c = 0;

  while (left > 0) {
    read = lring_read(&ring, (char*) buf, sizeof(buf));
    left -= read;

    /* Verify read data */
    for (j = 0; j < read; j++) {
      if (buf[j] != c) {
        fprintf(stdout, "%d %d %ld\n", c, buf[j], left);
        abort();
      }
      c = (c + 1) & 0xff;
    }
  }

  return NULL;
}


int main() {
  pthread_t producer;
  pthread_t consumer;
  lring_init(&ring);

  pthread_create(&producer, NULL, producer_fn, NULL);
  pthread_create(&consumer, NULL, consumer_fn, NULL);

  pthread_join(producer, NULL);
  pthread_join(consumer, NULL);

  lring_destroy(&ring);

  return 0;
}
