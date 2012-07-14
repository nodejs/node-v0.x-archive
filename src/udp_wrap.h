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

#ifndef SRC_UDP_WRAP_H_
#define SRC_UDP_WRAP_H_

#include "node.h"
#include "req_wrap.h"
#include "handle_wrap.h"

namespace node {

using v8::Object;
using v8::Handle;
using v8::Local;
using v8::Value;
using v8::String;
using v8::Arguments;

class UDPWrap: public HandleWrap {
 public:
  static void Initialize(Handle<Object> target);
  static Handle<Value> New(const Arguments& args);
  static Handle<Value> Bind(const Arguments& args);
  static Handle<Value> Send(const Arguments& args);
  static Handle<Value> Bind6(const Arguments& args);
  static Handle<Value> Send6(const Arguments& args);
  static Handle<Value> RecvStart(const Arguments& args);
  static Handle<Value> RecvStop(const Arguments& args);
  static Handle<Value> GetSockName(const Arguments& args);
  static Handle<Value> AddMembership(const Arguments& args);
  static Handle<Value> DropMembership(const Arguments& args);
  static Handle<Value> SetMulticastTTL(const Arguments& args);
  static Handle<Value> SetMulticastLoopback(const Arguments& args);
  static Handle<Value> SetBroadcast(const Arguments& args);
  static Handle<Value> SetTTL(const Arguments& args);
  static UDPWrap* Unwrap(Local<Object> obj);

  uv_udp_t* UVHandle();

 private:
  explicit UDPWrap(Handle<Object> object);
  virtual ~UDPWrap();

  static Handle<Value> DoBind(const Arguments& args, int family);
  static Handle<Value> DoSend(const Arguments& args, int family);
  static Handle<Value> SetMembership(const Arguments& args,
                                     uv_membership membership);

  static uv_buf_t OnAlloc(uv_handle_t* handle, size_t suggested_size);
  static void OnSend(uv_udp_send_t* req, int status);
  static void OnRecv(uv_udp_t* handle,
                     ssize_t nread,
                     uv_buf_t buf,
                     struct sockaddr* addr,
                     unsigned flags);

  uv_udp_t handle_;
};

}  // namespace node

#endif  // SRC_UDP_WRAP_H_
