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

#include "node.h"
#include "v8.h"

#include "env.h"
#include "env-inl.h"

#include "node_dtrace.h"

#ifdef HAVE_DTRACE
#include "node_provider.h"
#elif HAVE_ETW
#include "node_win32_etw_provider.h"
#include "node_win32_etw_provider-inl.h"
#else
#define NODE_HTTP_SERVER_REQUEST(arg0, arg1, arg2, arg3, arg4, arg5, arg6)
#define NODE_HTTP_SERVER_REQUEST_ENABLED() (0)
#define NODE_HTTP_SERVER_RESPONSE(arg0, arg1, arg2, arg3)
#define NODE_HTTP_SERVER_RESPONSE_ENABLED() (0)
#define NODE_HTTP_CLIENT_REQUEST(arg0, arg1, arg2, arg3, arg4, arg5, arg6)
#define NODE_HTTP_CLIENT_REQUEST_ENABLED() (0)
#define NODE_HTTP_CLIENT_RESPONSE(arg0, arg1, arg2, arg3)
#define NODE_HTTP_CLIENT_RESPONSE_ENABLED() (0)
#define NODE_NET_SERVER_CONNECTION(arg0, arg1, arg2, arg3)
#define NODE_NET_SERVER_CONNECTION_ENABLED() (0)
#define NODE_NET_STREAM_END(arg0, arg1, arg2, arg3)
#define NODE_NET_STREAM_END_ENABLED() (0)
#define NODE_NET_SOCKET_READ(arg0, arg1, arg2, arg3, arg4)
#define NODE_NET_SOCKET_READ_ENABLED() (0)
#define NODE_NET_SOCKET_WRITE(arg0, arg1, arg2, arg3, arg4)
#define NODE_NET_SOCKET_WRITE_ENABLED() (0)
#define NODE_GC_START(arg0, arg1, arg2)
#define NODE_GC_DONE(arg0, arg1, arg2)
#endif

#include <string.h>

namespace node {

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::GCCallbackFlags;
using v8::GCEpilogueCallback;
using v8::GCPrologueCallback;
using v8::GCType;
using v8::Handle;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::Array;
using v8::Object;
using v8::String;
using v8::Value;
using v8::Null;

#define SLURP_STRING(obj, member, valp) \
  if (!(obj)->IsArray()) { \
    return env->ThrowError( \
        "expected Array for " #obj " to contain index " #member); \
  } \
  String::Utf8Value _##member(obj->Get(member)); \
  if ((*(const char **)valp = *_##member) == NULL) \
    *(const char **)valp = "<unknown>";

#define SLURP_INT(obj, member, valp) \
  if (!(obj)->IsArray()) { \
    return env->ThrowError( \
      "expected Array for " #obj " to contain integer index " #member); \
  } \
  *valp = obj->Get(member)->ToInteger()->Value();

#define SLURP_CONNECTION(arg, conn) \
  if (!(arg)->IsArray()) { \
    return env->ThrowError( \
      "expected argument " #arg " to be an Array"); \
  } \
  node_dtrace_connection_t conn; \
  Local<Array> _##conn = Local<Array>::Cast(arg); \
  SLURP_INT(_##conn, 0, &conn.fd); \
  SLURP_STRING(_##conn, 1, &conn.remote); \
  SLURP_INT(_##conn, 2, &conn.port); \
  SLURP_INT(_##conn, 3, &conn.buffered);

#define GET_ARGS(arg, dest) \
  if (!(arg)->IsArray()) \
    return ThrowError("expected cb return value to be an Array"); \
  Local<Array> dest = (arg).As<Array>();

void DTRACE_NET_SERVER_CONNECTION(const FunctionCallbackInfo<Value>& args) {
  if (!NODE_NET_SERVER_CONNECTION_ENABLED())
    return;
  Environment* env = Environment::GetCurrent(args.GetIsolate());
  HandleScope scope(env->isolate());
  GET_ARGS(args[0], ret);
  SLURP_CONNECTION(ret, conn);
  NODE_NET_SERVER_CONNECTION(&conn, conn.remote, conn.port, conn.fd);
}


void DTRACE_NET_STREAM_END(const FunctionCallbackInfo<Value>& args) {
  if (!NODE_NET_STREAM_END_ENABLED())
    return;
  Environment* env = Environment::GetCurrent(args.GetIsolate());
  HandleScope scope(env->isolate());
  GET_ARGS(args[0], ret);
  SLURP_CONNECTION(ret, conn);
  NODE_NET_STREAM_END(&conn, conn.remote, conn.port, conn.fd);
}


void DTRACE_NET_SOCKET_READ(const FunctionCallbackInfo<Value>& args) {
  if (!NODE_NET_SOCKET_READ_ENABLED())
    return;
  Environment* env = Environment::GetCurrent(args.GetIsolate());
  HandleScope scope(env->isolate());
  SLURP_CONNECTION(args[0], conn);

  if (!args[1]->IsNumber()) {
    return env->ThrowError("expected argument 1 to be number of bytes");
  }

  NODE_NET_SOCKET_READ(&conn,
                       args[1]->Int32Value(),
                       conn.remote,
                       conn.port,
                       conn.fd);
}


void DTRACE_NET_SOCKET_WRITE(const FunctionCallbackInfo<Value>& args) {
  if (!NODE_NET_SOCKET_WRITE_ENABLED())
    return;
  Environment* env = Environment::GetCurrent(args.GetIsolate());
  HandleScope scope(env->isolate());
  SLURP_CONNECTION(args[0], conn);

  if (!args[1]->IsNumber()) {
    return env->ThrowError("expected argument 1 to be number of bytes");
  }

  NODE_NET_SOCKET_WRITE(&conn,
                        args[1]->Int32Value(),
                        conn.remote,
                        conn.port,
                        conn.fd);
}


void DTRACE_HTTP_SERVER_REQUEST(const FunctionCallbackInfo<Value>& args) {
  node_dtrace_http_server_request_t req;

  if (!NODE_HTTP_SERVER_REQUEST_ENABLED())
    return;

  Environment* env = Environment::GetCurrent(args.GetIsolate());
  HandleScope scope(env->isolate());

  GET_ARGS(args[0], ret);
  SLURP_CONNECTION(ret, conn);

  memset(&req, 0, sizeof(req));
  req._un.version = 1;
  SLURP_STRING(_conn, 4, &req.url);
  SLURP_STRING(_conn, 5, &req.method);
  SLURP_STRING(_conn, 6, &req.forwardedFor);

  NODE_HTTP_SERVER_REQUEST(&req, &conn, conn.remote, conn.port, req.method, \
                           req.url, conn.fd);
}


void DTRACE_HTTP_SERVER_RESPONSE(const FunctionCallbackInfo<Value>& args) {
  if (!NODE_HTTP_SERVER_RESPONSE_ENABLED())
    return;
  Environment* env = Environment::GetCurrent(args.GetIsolate());
  HandleScope scope(env->isolate());
  GET_ARGS(args[0], ret);
  SLURP_CONNECTION(ret, conn);
  NODE_HTTP_SERVER_RESPONSE(&conn, conn.remote, conn.port, conn.fd);
}


void DTRACE_HTTP_CLIENT_REQUEST(const FunctionCallbackInfo<Value>& args) {
  node_dtrace_http_client_request_t req;

  if (!NODE_HTTP_CLIENT_REQUEST_ENABLED())
    return;

  Environment* env = Environment::GetCurrent(args.GetIsolate());
  HandleScope scope(env->isolate());

  /*
   * For the method and URL, we're going to dig them out of the header.  This
   * is not as efficient as it could be, but we would rather not force the
   * caller here to retain their method and URL until the time at which
   * DTRACE_HTTP_CLIENT_REQUEST can be called.
   */
  GET_ARGS(args[0], ret);
  SLURP_CONNECTION(ret, conn);
  SLURP_STRING(_conn, 4, &req.method);
  SLURP_STRING(_conn, 5, &req.url);

  NODE_HTTP_CLIENT_REQUEST(&req, &conn, conn.remote, conn.port, req.method, \
                           req.url, conn.fd);
}


void DTRACE_HTTP_CLIENT_RESPONSE(const FunctionCallbackInfo<Value>& args) {
  if (!NODE_HTTP_CLIENT_RESPONSE_ENABLED())
    return;
  Environment* env = Environment::GetCurrent(args.GetIsolate());
  HandleScope scope(env->isolate());
  GET_ARGS(args[0], ret);
  SLURP_CONNECTION(ret, conn);
  NODE_HTTP_CLIENT_RESPONSE(&conn, conn.remote, conn.port, conn.fd);
}


void dtrace_gc_start(Isolate* isolate, GCType type, GCCallbackFlags flags) {
  // Previous versions of this probe point only logged type and flags.
  // That's why for reasons of backwards compatibility the isolate goes last.
  NODE_GC_START(type, flags, isolate);
}


void dtrace_gc_done(Isolate* isolate, GCType type, GCCallbackFlags flags) {
  // Previous versions of this probe point only logged type and flags.
  // That's why for reasons of backwards compatibility the isolate goes last.
  NODE_GC_DONE(type, flags, isolate);
}


void InitDTrace(Handle<Object> target,
                Handle<Value> unused,
                Handle<v8::Context> context,
                void* priv) {
  Environment* env = Environment::GetCurrent(context);
  HandleScope scope(env->isolate());

#if defined HAVE_DTRACE || defined HAVE_ETW || defined HAVE_SYSTEMTAP
  static struct {
    const char *name;
    void (*func)(const FunctionCallbackInfo<Value>&);
  } tab[] = {
#define NODE_PROBE(name) #name, name
    { NODE_PROBE(DTRACE_NET_SERVER_CONNECTION) },
    { NODE_PROBE(DTRACE_NET_STREAM_END) },
    { NODE_PROBE(DTRACE_NET_SOCKET_READ) },
    { NODE_PROBE(DTRACE_NET_SOCKET_WRITE) },
    { NODE_PROBE(DTRACE_HTTP_SERVER_REQUEST) },
    { NODE_PROBE(DTRACE_HTTP_SERVER_RESPONSE) },
    { NODE_PROBE(DTRACE_HTTP_CLIENT_REQUEST) },
    { NODE_PROBE(DTRACE_HTTP_CLIENT_RESPONSE) }
#undef NODE_PROBE
  };

  Local<Object> global = context->Global();

  for (unsigned int i = 0; i < ARRAY_SIZE(tab); i++) {
    Local<String> key = OneByteString(env->isolate(), tab[i].name);
    Local<Function> val = FunctionTemplate::New(env->isolate(), tab[i].func)
        ->GetFunction();
    val->SetName(key);
    global->Set(key, val);
  }

#ifdef HAVE_ETW
  init_etw();
#endif

  env->isolate()->AddGCPrologueCallback(dtrace_gc_start);
  env->isolate()->AddGCEpilogueCallback(dtrace_gc_done);
#endif

#if defined HAVE_PERFCTR
  InitPerfCounters(context->Global());
#endif

  Local<Object> constants = Object::New(env->isolate());
#define CONSTANT(type)                                                        \
  do {                                                                        \
    Local<String> str = OneByteString(env->isolate(), #type);                 \
    constants->Set(str, v8::Integer::New(env->isolate(),                      \
                   ARGUMENT_TYPE_ ## type));                                  \
    constants->Set(ARGUMENT_TYPE_ ## type, str);                              \
  } while(0);

  CONSTANT(STRING);
  CONSTANT(JSON);
  CONSTANT(INT64);
  CONSTANT(INT32);
  CONSTANT(UINT32);
  CONSTANT(INT16);
  CONSTANT(UINT16);
  CONSTANT(INT8);
  CONSTANT(UINT8);
#undef CONSTANT
  target->Set(OneByteString(env->isolate(), "constants"), constants);
}

}

NODE_MODULE_CONTEXT_AWARE_BUILTIN(dtrace, node::InitDTrace)
