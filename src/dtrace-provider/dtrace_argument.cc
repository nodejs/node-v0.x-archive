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

#include "dtrace_provider.h"

#include "node.h"
#include "util.h"

#include "env.h"
#include "env-inl.h"

#include "base-object.h"
#include "base-object-inl.h"

namespace node {

  using v8::Function;
  using v8::Handle;
  using v8::HandleScope;
  using v8::Local;
  using v8::String;
  using v8::Value;

  DTraceArgument::DTraceArgument(Environment* env) : _env(env) {
  }

  DTraceStringArgument::DTraceStringArgument(Environment* env)
    : DTraceArgument(env) {
  }

  void * DTraceStringArgument::ArgumentValue(Handle<Value> value) {
    if (value->IsUndefined())
      return reinterpret_cast<void*>(strdup("undefined"));

    AsciiValue str(value->ToString());
    return reinterpret_cast<void*>(strdup(*str));
  }

  void DTraceStringArgument::FreeArgument(void *arg) {
    free(arg);
  }

  const char * DTraceStringArgument::Type() {
    return "char *";
  }

  DTraceJsonArgument::DTraceJsonArgument(Environment* env)
    : DTraceArgument(env) {
  }


  void * DTraceJsonArgument::ArgumentValue(Handle<Value> value) {
    HandleScope scope(env()->isolate());

    if (value->IsUndefined())
      return reinterpret_cast<void*>(strdup("undefined"));

    Local<Function> stringify = env()->json_stringify_function();
    Handle<Value> j = stringify->Call(env()->json_object(), 1, &value);

    if (*j == NULL)
      return reinterpret_cast<void*>(
        strdup("{ \"error\": \"stringify failed\" }"));

    AsciiValue json(j->ToString());
    return reinterpret_cast<void*>(strdup(*json));
  }

  void DTraceJsonArgument::FreeArgument(void *arg) {
    free(arg);
  }

  const char * DTraceJsonArgument::Type() {
    return "char *";
  }

}  // namespace node
