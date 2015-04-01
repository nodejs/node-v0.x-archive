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

#include <stdlib.h>
#include <unicode/udata.h>
#include <unicode/ures.h>
#include "l10n.h"

// The ICU bundle name
#define L10N_APPDATA "node"

extern "C" const char U_DATA_API node_dat[];

UResourceBundle *bundle;

const char * _locale;

void l10n_cleanup() {
  ures_close(bundle);
}

bool l10n_initialize(const char * locale,
                     const char * icu_data_dir) {
  UErrorCode status = U_ZERO_ERROR;
  _locale = locale;
  if (!icu_data_dir) {
    udata_setAppData("node", &node_dat, &status);
  }
  if (U_FAILURE(status)) {
    return FALSE;
  } else {
    bundle = ures_open(L10N_APPDATA, locale, &status);
    if (U_SUCCESS(status)) {
      // cleanup the bundle when the process
      // exits normally. obviously this doesn't
      // catch the abnormal terminations but hey,
      // we can only do so much.
      atexit(l10n_cleanup);
      return TRUE;
    } else {
      return FALSE;
    }
  }

}

int32_t l10n_preflight(const char * key) {
  int32_t len = 0;
  UErrorCode status = U_ZERO_ERROR;
  ures_getUTF8StringByKey(bundle,
                          key,
                          NULL,
                          &len,
                          TRUE,
                          &status);
  return len;
}

const char * l10n_fetch(const char * key,
                        const char * fallback,
                        char * dest,
                        int32_t *len) {
  UErrorCode status = U_ZERO_ERROR;
  const char * res = ures_getUTF8StringByKey(bundle,
                          key,
                          dest,
                          len,
                          FALSE,
                          &status);
  if (U_SUCCESS(status)) {
    return res;
  }
  return fallback; // return the fallback if resolution fails
}

const char * l10n_fetch(const char * key,
                        const char * fallback) {
  char * dest;
  int32_t keylen = l10n_preflight(key) + 1;
  dest = new char[keylen];
  const char * res = l10n_fetch(key, fallback, dest, &keylen);
  return res; // caller must free!
}
