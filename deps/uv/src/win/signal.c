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

#include <assert.h>
#include <limits.h>
#include <stddef.h> 
#include <signal.h>

#include "uv.h"
#include "internal.h"
#include "tree.h"




static uv_once_t uv_signal_init_guard_ = UV_ONCE_INIT;
CRITICAL_SECTION uv_signal_data_guard_;
uv_loop_t** uv_loops_;
size_t uv_loop_capcity_;
size_t uv_loop_count_;


static void uv_signal_doasync(uv_loop_t* loop, int type);



void uv_signal_ctrlHandler(int type ) 
{
	size_t index;

	EnterCriticalSection(&uv_signal_data_guard_);

    for(index = 0; index < uv_loop_count_; ++ index)
	{
		uv_signal_doasync(uv_loops_[index], type);
	}

    LeaveCriticalSection(&uv_signal_data_guard_);
} 

BOOL WINAPI uv_signal_consoleHandler(DWORD fdwCtrlType ) 
{
    int type;

	switch(fdwCtrlType){
		case CTRL_C_EVENT:
			type = SIGINT;
			break;
		case CTRL_BREAK_EVENT:
			type = SIGBREAK;
			break;
		case CTRL_CLOSE_EVENT:
		case CTRL_LOGOFF_EVENT:
		case CTRL_SHUTDOWN_EVENT:
		default:
			return FALSE;
	}
	uv_signal_ctrlHandler(type);
	return FALSE;
} 

void uv_signal_system_init(void)
{
	uv_loop_capcity_ = 64;
	uv_loops_ = (uv_loop_t**)malloc(sizeof(uv_loop_t*)*uv_loop_capcity_);
	uv_loop_count_ = 0;

	
	//SetConsoleCtrlHandler(&uv_signal_consoleHandler, TRUE);
    signal(SIGINT, &uv_signal_ctrlHandler);
    signal(SIGBREAK, &uv_signal_ctrlHandler);

    signal(SIGILL, &uv_signal_ctrlHandler);
    signal(SIGFPE, &uv_signal_ctrlHandler);
    signal(SIGSEGV, &uv_signal_ctrlHandler);
    signal(SIGTERM, &uv_signal_ctrlHandler);
    signal(SIGABRT, &uv_signal_ctrlHandler);
}

void uv_signal_registerHandler(uv_loop_t* loop)
{
	size_t index;

	uv_once(&uv_signal_init_guard_, &uv_signal_system_init);

	EnterCriticalSection(&uv_signal_data_guard_);

	for(index = 0; index < uv_loop_count_; ++ index)
	{
		if(uv_loops_[index] == loop)
			goto end;
	}

	if(uv_loop_count_ >= uv_loop_capcity_) 
	{
		uv_loop_capcity_ *= 2;
		uv_loops_ = (uv_loop_t**)realloc(uv_loops_, sizeof(uv_loop_t*)*uv_loop_capcity_);
	}

	uv_loops_[uv_loop_count_ ++ ] = loop;
	uv_ref(loop);
end:
	LeaveCriticalSection(&uv_signal_data_guard_);
}


void uv_signal_unregisterHandler(uv_loop_t* loop)
{
	size_t index;

	uv_once(&uv_signal_init_guard_, &uv_signal_system_init);

	EnterCriticalSection(&uv_signal_data_guard_);

    for(index = 0; index < uv_loop_count_; ++ index)
	{
		if(uv_loops_[index] == loop) 
		{
			memmove(&uv_loops_[index], &uv_loops_[index+1], uv_loop_count_ - index -1);
			-- uv_loop_count_;
	        uv_unref(loop);
			goto end;
		}
	}

end:
	LeaveCriticalSection(&uv_signal_data_guard_);
}


int uv_signal_init(uv_loop_t* loop, uv_signal_t* handle) {
  loop->counters.handle_init++;
  loop->counters.timer_init++;

  handle->type = UV_SIGNAL;
  handle->loop = loop;
  handle->flags = 0;
  handle->signal_cb = NULL;
  handle->_next = NULL;
  handle->_prev = NULL;

  uv_ref(loop);

  return 0;
}


void uv_signal_endgame(uv_loop_t* loop, uv_signal_t* handle) {
  if (handle->flags & UV_HANDLE_CLOSING) {
    assert(!(handle->flags & UV_HANDLE_CLOSED));
    handle->flags |= UV_HANDLE_CLOSED;

    if (handle->close_cb) {
      handle->close_cb((uv_handle_t*)handle);
    }

    uv_unref(loop);
  }
}


int uv_signal_start(uv_signal_t* handle, uv_signal_cb signal_cb) {
  uv_loop_t* loop = handle->loop;

  handle->signal_cb = signal_cb;
  handle->flags |= UV_HANDLE_ACTIVE;

  DLINK_InsertNext(&loop->signal_handles, handle);

  return 0;
}


int uv_signal_stop(uv_signal_t* handle) {
  uv_loop_t* loop = handle->loop;

  if (!(handle->flags & UV_HANDLE_ACTIVE))
    return 0;

  DLINK_Remove(handle);
  handle->_next = NULL;
  handle->_prev = NULL;

  handle->flags &= ~UV_HANDLE_ACTIVE;
  return 0;
}


struct signal_async_s {
	struct uv_async_s async;
	DWORD fdwCtrlType;
};

void uv_signal_handler(struct uv_async_s* async, int signal) {
	struct signal_async_s*  s = (struct signal_async_s*)(((char*)async)-offsetof(struct signal_async_s, async));

	uv_signal_t*  head = &(async->loop->signal_handles);
	uv_signal_t* handle = head;
	while(head != (handle = handle->_next)) {
		handle->signal_cb(handle, s->fdwCtrlType);
	}
}


static void uv_signal_doasync(uv_loop_t* loop, int type) 
{
   struct signal_async_s* async = (struct signal_async_s*)malloc(sizeof(struct signal_async_s));
   uv_async_init(loop, &async->async, &uv_signal_handler);
   async->fdwCtrlType = type;
   uv_async_send(&async->async);
}