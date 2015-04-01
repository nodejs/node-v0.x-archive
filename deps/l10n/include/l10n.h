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

#ifndef L10N__H
#define L10N__H

#include <stdint.h>
#include <unicode/uloc.h>

#define L10N_VERSION_MAJOR 0
#define L10N_VERSION_MINOR 0
#define L10N_VERSION_PATCH 1
#define L10N_VERSION ((L10N_VERSION_MAJOR<<16)|\
                       (L10N_VERSION_MINOR<<8)|\
                       (L10N_VERSION_PATCH))
#define L10N_VERSION_STR "0.0.1-DEV"

#ifdef _WIN32
# define L10N_EXTERN /* nothing */
#elif __GNUC__ >= 4
# define L10N_EXTERN __attribute__((visibility("default")))
#else
# define L10N_EXTERN /* nothing */
#endif

/**
 * Initialize the resource bundle. This will register an atexit handler
 * to deal with the cleanup in normal termination
 **/
L10N_EXTERN bool l10n_initialize(const char * locale, const char * icu_data_dir);

/**
 * Preflight to get the minimum buffer allocation size we need.
 **/
L10N_EXTERN int32_t l10n_preflight(const char * key);

/**
 * Fetch the value for the specified key. Returns a pointer to dest.
 **/
L10N_EXTERN const char * l10n_fetch(const char * key,
                                    const char * fallback,
                                    char * dest,
                                    int32_t *len);

/**
 * Lookup the key, return the value. Doesn't get much easier. If the key
 * is not found in the bundle, fallback is returned instead. The caller
 * owns the string and must delete[] it when done lest horrible things.
 **/
L10N_EXTERN const char * l10n_fetch(const char * key,
                                    const char * fallback);

#define L10N(key, fallback) l10n_fetch(key, fallback)
#define L10N_LOCALE() uloc_getDefault()

#endif // L10N__H
