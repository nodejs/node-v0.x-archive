
/* Copyright 1998 by the Massachusetts Institute of Technology.
 * Copyright (C) 2009 by Jakub Hrozek <jhrozek@redhat.com>
 * Copyright (C) 2015 by Anthony Kirby <anthony@anthony.org>
 *
 * Permission to use, copy, modify, and distribute this
 * software and its documentation for any purpose and without
 * fee is hereby granted, provided that the above copyright
 * notice appear in all copies and that both that copyright
 * notice and this permission notice appear in supporting
 * documentation, and that the name of M.I.T. not be used in
 * advertising or publicity pertaining to distribution of the
 * software without specific, written prior permission.
 * M.I.T. makes no representations about the suitability of
 * this software for any purpose.  It is provided "as is"
 * without express or implied warranty.
 */

#include "ares_setup.h"

#ifdef HAVE_NETINET_IN_H
#  include <netinet/in.h>
#endif
#ifdef HAVE_NETDB_H
#  include <netdb.h>
#endif
#ifdef HAVE_ARPA_INET_H
#  include <arpa/inet.h>
#endif
#ifdef HAVE_ARPA_NAMESER_H
#  include <arpa/nameser.h>
#else
#  include "nameser.h"
#endif
#ifdef HAVE_ARPA_NAMESER_COMPAT_H
#  include <arpa/nameser_compat.h>
#endif

#include "ares.h"
#include "ares_dns.h"
#include "ares_data.h"
#include "ares_private.h"

/* nameser.h frequently omits new DNS record types
 *  so define constant for URI record
 *
 * (reference: RR types as defined by IANA, published at:
 *  http://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml)
 */
#ifndef T_URI
  #define T_URI 256
#endif


int
ares_parse_uri_reply (const unsigned char *abuf, int alen,
                      struct ares_uri_reply **uri_out)
{
  unsigned int qdcount, ancount, i;
  const unsigned char *aptr, *vptr;
  int status, rr_type, rr_class, rr_len, uri_len;
  long len;
  char *qname = NULL, *rr_name = NULL;
  struct ares_uri_reply *uri_head = NULL;
  struct ares_uri_reply *uri_last = NULL;
  struct ares_uri_reply *uri_curr;

  /* Set *uri_out to NULL for all failure cases. */
  *uri_out = NULL;

  /* Give up if abuf doesn't have room for a header. */
  if (alen < HFIXEDSZ)
    return ARES_EBADRESP;

  /* Fetch the question and answer count from the header. */
  qdcount = DNS_HEADER_QDCOUNT (abuf);
  ancount = DNS_HEADER_ANCOUNT (abuf);
  if (qdcount != 1)
    return ARES_EBADRESP;
  if (ancount == 0)
    return ARES_ENODATA;

  /* Expand the name from the question, and skip past the question. */
  aptr = abuf + HFIXEDSZ;
  status = ares_expand_name (aptr, abuf, alen, &qname, &len);
  if (status != ARES_SUCCESS)
    return status;

  if (aptr + len + QFIXEDSZ > abuf + alen)
    {
      free (qname);
      return ARES_EBADRESP;
    }
  aptr += len + QFIXEDSZ;

  /* Examine each answer resource record (RR) in turn. */
  for (i = 0; i < ancount; i++)
    {
      /* Decode the RR up to the data field. */
      status = ares_expand_name (aptr, abuf, alen, &rr_name, &len);
      if (status != ARES_SUCCESS)
        {
          break;
        }
      aptr += len;
      if (aptr + RRFIXEDSZ > abuf + alen)
        {
          status = ARES_EBADRESP;
          break;
        }
      rr_type = DNS_RR_TYPE (aptr);
      rr_class = DNS_RR_CLASS (aptr);
      rr_len = DNS_RR_LEN (aptr);
      aptr += RRFIXEDSZ;
      if (aptr + rr_len > abuf + alen)
        {
          status = ARES_EBADRESP;
          break;
        }

      /* Check if we are really looking at a URI record */
      if (rr_class == C_IN && rr_type == T_URI)
        {
          /* parse the URI record itself */
          if (rr_len < 4)
            {
              status = ARES_EBADRESP;
              break;
            }

          /* Allocate storage for this URI answer appending it to the list */
          uri_curr = ares_malloc_data(ARES_DATATYPE_URI_REPLY);
          if (!uri_curr)
            {
              status = ARES_ENOMEM;
              break;
            }
          uri_curr->target = NULL;
          if (uri_last)
            {
              uri_last->next = uri_curr;
            }
          else
            {
              uri_head = uri_curr;
            }
          uri_last = uri_curr;

          vptr = aptr;
          uri_curr->priority = DNS__16BIT(vptr);
          vptr += sizeof(unsigned short);
          uri_curr->weight = DNS__16BIT(vptr);
          vptr += sizeof(unsigned short);

          /* Allocate storage for the URI target */
          uri_len = rr_len-4;
          uri_curr->target = malloc(uri_len + 1);
          if (!uri_curr->target)
            {
              status = ARES_ENOMEM;
              break;
            }
          /* copy to target */
          memcpy(uri_curr->target, vptr, uri_len);
          uri_curr->target[uri_len] = 0;
        }

      /* Don't lose memory in the next iteration */
      free (rr_name);
      rr_name = NULL;

      /* Move on to the next record */
      aptr += rr_len;
    }

  if (qname)
    free (qname);
  if (rr_name)
    free (rr_name);

  /* clean up on error */
  if (status != ARES_SUCCESS)
    {
      if (uri_head)
        ares_free_data (uri_head);
      return status;
    }

  /* everything looks fine, return the data */
  *uri_out = uri_head;

  return ARES_SUCCESS;
}
