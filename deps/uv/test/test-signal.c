/* Copyright Joyent, Inc. and other Node contributors. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

#include "uv.h"
#include "task.h"
#include <signal.h>


static int  sigint_called = 0;
static int  sigbreak_called = 0;
static int  sigill_called = 0;
static int  sigfpe_called = 0;
static int  sigsegv_called = 0;
static int  sigterm_called = 0;
static int  sigabrt_called = 0;


static int  sigint_closed = 0;
static int  sigbreak_closed = 0;
static int  sigill_closed = 0;
static int  sigfpe_closed = 0;
static int  sigsegv_closed = 0;
static int  sigterm_closed = 0;
static int  sigabrt_closed = 0;



static void signal_cb(uv_signal_t* handle, int signum) {
   switch(signum){	
   case SIGINT:
	   sigint_called ++;
	   break;
   case SIGBREAK:
	   sigbreak_called++;
	   break;
   case SIGILL:
	   sigill_called ++;
	   break;
   case SIGFPE:
	   sigfpe_called ++;
	   break;
   case SIGSEGV:
	   sigsegv_called ++;
	   break;
   case SIGTERM:
	   sigterm_called ++;
	   break;
   case SIGABRT:
	   sigabrt_called ++;
	   break;
   default:
		FATAL("signal_cb be called with unkown signal");
   }
}


static void never_cb(uv_timer_t* handle, int status) {
  FATAL("never_cb should never be called");
}


TEST_IMPL(signal) {
	uv_signal_t sigint;
	uv_signal_t sigbreak;
	uv_signal_t sigill;
	uv_signal_t sigfpe;
	uv_signal_t sigsegv;
	uv_signal_t sigterm;
	uv_signal_t sigabrt;
	
    uv_signal_registerHandler(uv_default_loop());
	
	uv_signal_init(uv_default_loop(), &sigint, &signal_cb, SIGINT);
	uv_signal_init(uv_default_loop(), &sigbreak, &signal_cb, SIGBREAK);
	uv_signal_init(uv_default_loop(), &sigill, &signal_cb, SIGILL);
	uv_signal_init(uv_default_loop(), &sigfpe, &signal_cb, SIGFPE);
	uv_signal_init(uv_default_loop(), &sigsegv, &signal_cb, SIGSEGV);
	uv_signal_init(uv_default_loop(), &sigterm, &signal_cb, SIGTERM);
	uv_signal_init(uv_default_loop(), &sigabrt, &signal_cb, SIGABRT);

	
	
	uv_signal_start(&sigint);
	uv_signal_start(&sigbreak);
	uv_signal_start(&sigill);
	uv_signal_start(&sigfpe);
	uv_signal_start(&sigsegv);
	uv_signal_start(&sigterm);
	uv_signal_start(&sigabrt);
	
	
    uv_unref(uv_default_loop());
    uv_unref(uv_default_loop());
    uv_unref(uv_default_loop());
    uv_unref(uv_default_loop());
    uv_unref(uv_default_loop());
    uv_unref(uv_default_loop());
    uv_unref(uv_default_loop());
    uv_unref(uv_default_loop());

    raise(SIGINT);
	uv_run(uv_default_loop());
	ASSERT(sigint_called == 1);
    raise(SIGINT);
	uv_run(uv_default_loop());
	ASSERT(sigint_called == 2);
    raise(SIGBREAK);
	uv_run(uv_default_loop());
	ASSERT(sigbreak_called == 1);

    raise(SIGILL);
	uv_run(uv_default_loop());
	ASSERT(sigill_called == 1);
    raise(SIGFPE);
	uv_run(uv_default_loop());
	ASSERT(sigfpe_called == 1);
    raise(SIGSEGV);
	uv_run(uv_default_loop());
	ASSERT(sigsegv_called == 1);
    raise(SIGTERM);
	uv_run(uv_default_loop());
	ASSERT(sigterm_called == 1);
    raise(SIGABRT);
	uv_run(uv_default_loop());
	ASSERT(sigabrt_called == 1);

	
	ASSERT(sigint_called == 2);
	ASSERT(sigbreak_called == 1);
	ASSERT(sigill_called == 1);
	ASSERT(sigfpe_called == 1);
	ASSERT(sigsegv_called == 1);
	ASSERT(sigterm_called == 1);
	ASSERT(sigabrt_called == 1);

	
	uv_signal_stop(&sigint);
	uv_signal_stop(&sigbreak);
	uv_signal_stop(&sigill);
	uv_signal_stop(&sigfpe);
	uv_signal_stop(&sigsegv);
	uv_signal_stop(&sigterm);
	uv_signal_stop(&sigabrt);

	
    raise(SIGINT);
    raise(SIGBREAK);
    raise(SIGILL);
    raise(SIGFPE);
    raise(SIGSEGV);
    raise(SIGTERM);
    raise(SIGABRT);
	uv_run(uv_default_loop());
	uv_run(uv_default_loop());
	uv_run(uv_default_loop());
	uv_run(uv_default_loop());
	uv_run(uv_default_loop());
	uv_run(uv_default_loop());
	uv_run(uv_default_loop());
	uv_run(uv_default_loop());
	
	ASSERT(sigint_called == 2);
	ASSERT(sigbreak_called == 1);
	ASSERT(sigill_called == 1);
	ASSERT(sigfpe_called == 1);
	ASSERT(sigsegv_called == 1);
	ASSERT(sigterm_called == 1);
	ASSERT(sigabrt_called == 1);

  return 0;
}
