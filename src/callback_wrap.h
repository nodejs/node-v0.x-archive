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

#ifndef SRC_CALLBACK_WRAP_H_
#define SRC_CALLBACK_WRAP_H_

#include "v8.h"
#include "node.h"
#include "handle_wrap.h"
#include "req_wrap.h"
#include "string_bytes.h"


namespace node {

typedef class ReqWrap<uv_shutdown_t> ShutdownWrap;

class SendWrap;
class WriteWrap;


// Overridable callbacks' types
class WrapCallbacks {

 public:
  typedef int(WrapCallbacks::*DoShutdownCallback)(ShutdownWrap* req_wrap, uv_shutdown_cb cb);

  explicit WrapCallbacks(HandleWrap* wrap) : wrap_(wrap) {
	  oldCallback_ = NULL;
  }

  explicit WrapCallbacks(WrapCallbacks* old) : wrap_(old->wrap()) {
	  oldCallback_ = old;
  }

  virtual ~WrapCallbacks() {
  }

  virtual v8::Handle<v8::Object> Self() = 0;

  // Common
  virtual void DoAlloc(uv_handle_t* handle, size_t suggested_size, uv_buf_t* buf) = 0;
  virtual int DoShutdown(ShutdownWrap* req_wrap, uv_shutdown_cb cb) {
	if (oldCallback_) {
		return oldCallback_->DoShutdown(req_wrap, cb);
	}

	return 0;
  };

  // UDP
  virtual void DoRecv(uv_udp_t* handle, ssize_t nread, const uv_buf_t* buf, const struct sockaddr* addr, unsigned int flags) {};
  virtual int DoSend(SendWrap* s, uv_udp_t* handle, uv_buf_t* buf, size_t count, const struct sockaddr* addr, uv_udp_send_cb cb) { return -1; };

  // Stream
  virtual void DoRead(uv_stream_t* handle, ssize_t nread, const uv_buf_t* buf, uv_handle_type pending) { /* throw .... */ };
  virtual int DoWrite(WriteWrap* w, uv_buf_t* bufs, size_t count, uv_stream_t* send_handle, uv_write_cb cb) { return -1; };
  virtual void AfterWrite(WriteWrap* w) {};


 protected:
  inline HandleWrap* wrap() const {
    return wrap_;
  }

  HandleWrap* const wrap_;

  private:
	WrapCallbacks* oldCallback_;
};


}  // namespace node


#endif  // SRC_STREAM_WRAP_H_
