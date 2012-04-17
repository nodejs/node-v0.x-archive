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

#include <assert.h>
#include "node.h"
#include "req_wrap.h"
#include "uv.h"

#include <string.h>

#if defined(__OpenBSD__) || defined(__MINGW32__) || defined(_MSC_VER)
# include <nameser.h>
#else
# include <arpa/nameser.h>
#endif

// Temporary hack: libuv should provide uv_inet_pton and uv_inet_ntop.
#if defined(__MINGW32__) || defined(_MSC_VER)
  extern "C" {
#   include <inet_net_pton.h>
#   include <inet_ntop.h>
  }
# define uv_inet_pton ares_inet_pton
# define uv_inet_ntop ares_inet_ntop

#else // __POSIX__
# include <arpa/inet.h>
# define uv_inet_pton inet_pton
# define uv_inet_ntop inet_ntop
#endif


namespace node {

namespace cares_wrap {

using v8::Arguments;
using v8::Array;
using v8::Context;
using v8::Function;
using v8::Handle;
using v8::HandleScope;
using v8::Integer;
using v8::Local;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;
using v8::Undefined;
using v8::TryCatch;

static ares_channel ares_channel;

struct getservers_req {
  struct ares_addr_node *servers;
  Persistent<Function> callback;
};

static void GetServersProcess(uv_work_t* work) {
  getservers_req *req = (getservers_req *)work->data;
  int r;

  r = ares_library_init(ARES_LIB_INIT_ALL);
  assert(r == ARES_SUCCESS);

  struct ares_options options;
  uv_ares_init_options(uv_default_loop(), &ares_channel, &options, 0);
  assert(r == 0);

  r = ares_get_servers(ares_channel, &req->servers);
  assert(r == ARES_SUCCESS);

  uv_ares_destroy(uv_default_loop(), ares_channel);
}

static void GetServersAfter(uv_work_t* work) {
  getservers_req *req = (getservers_req *)work->data;
  struct ares_addr_node *cur = req->servers;

  size_t i = 0;

  Local<Array> servers = Array::New();

  char ip[INET6_ADDRSTRLEN];
  while (cur != NULL) {
    uv_inet_ntop(cur->family, (const void *) &cur->addr, ip, sizeof(ip));
    Local<String> addr = String::New(ip);
    servers->Set(Integer::New(i), addr);
    cur = cur->next;
    i++;
  }

  Local<Value> argv[1];
  argv[0] = servers;

  TryCatch try_catch;

  req->callback->Call(Context::GetCurrent()->Global(), 1, argv);

  if (try_catch.HasCaught())
    FatalException(try_catch);

  req->callback.Dispose();
  ares_free_data(req->servers);
  delete req;

  delete work;
}

static Handle<Value> GetServers(const Arguments &args) {
  HandleScope scope;
  uv_work_t *req = new uv_work_t();
  getservers_req *getreq = new getservers_req;

  getreq->callback = Persistent<Function>::New(Local<Function>::Cast(args[0]));

  req->data = getreq;
  uv_queue_work(uv_default_loop(), req, GetServersProcess, GetServersAfter);

  return Undefined();
}

static void Initialize(Handle<Object> target) {
  HandleScope scope;

  NODE_SET_METHOD(target, "getServers", GetServers);
}


} // namespace cares_wrap

}  // namespace node

NODE_MODULE(node_cares_wrap, node::cares_wrap::Initialize)
