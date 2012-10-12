#ifndef _SRC_LRING_BIO_H_
#define _SRC_LRING_BIO_H_

#include "openssl/bio.h"
#include "ngx-queue.h"
#include "lring.h"

namespace node {

BIO_METHOD* BIO_lring();

} // namespace node

#endif // _SRC_LRING_BIO_H_
