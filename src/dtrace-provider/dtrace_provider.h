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
#ifndef SRC_DTRACE_PROVIDER_DTRACE_PROVIDER_H_
#define SRC_DTRACE_PROVIDER_DTRACE_PROVIDER_H_

#include "node.h"
#include "base-object.h"
#include "node_dtrace.h"

#include "v8.h"

extern "C" {
#include <usdt.h>
}

#include <sys/dtrace.h>
#include <sys/types.h>
#include <sys/mman.h>

#include <errno.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>

#ifndef __APPLE__
#include <stdlib.h>
#include <malloc.h>
#endif

namespace node {

  class DTraceArgument {
  public:
    virtual const char *Type() = 0;
    virtual void *ArgumentValue(v8::Handle<v8::Value>) = 0;
    virtual void FreeArgument(void* arg) = 0;
    virtual ~DTraceArgument() { }
    explicit DTraceArgument(Environment* env);
    Environment* env() { return _env; }
  private:
    Environment* _env;
  };

  template <TracingArgumentType T, typename P>
  class DTraceIntegerArgument : public DTraceArgument {
  public:
    explicit DTraceIntegerArgument(Environment* env) :
      DTraceArgument(env) {
    }

    const char *Type() {
      switch (T) {
        case ARGUMENT_TYPE_INT64:
          return "int64_t";
          break;
        case ARGUMENT_TYPE_UINT32:
          return "uint32_t";
          break;
        case ARGUMENT_TYPE_INT32:
          return "int32_t";
          break;
        case ARGUMENT_TYPE_UINT16:
          return "uint16_t";
          break;
        case ARGUMENT_TYPE_INT16:
          return "int16_t";
          break;
        case ARGUMENT_TYPE_UINT8:
          return "uint8_t";
          break;
        case ARGUMENT_TYPE_INT8:
          return "int8_t";
          break;
      }
    }

    void *ArgumentValue(v8::Handle<v8::Value> value) {
      int64_t ret = value->IntegerValue();
      P r = static_cast<P>(ret);
      return reinterpret_cast<void*>(r);
    }

    void FreeArgument(void* arg) {
    }
  };

  class DTraceStringArgument : public DTraceArgument {
  public:
    const char *Type();
    void *ArgumentValue(v8::Handle<v8::Value>);
    void FreeArgument(void* arg);
    explicit DTraceStringArgument(Environment* env);
  };

  class DTraceJsonArgument : public DTraceArgument {
  public:
    const char *Type();
    void *ArgumentValue(v8::Handle<v8::Value>);
    void FreeArgument(void* arg);
    explicit DTraceJsonArgument(Environment* env);
  };

  class DTraceProbe : public BaseObject {
  public:
    static void Initialize(v8::Handle<v8::Object> target, Environment *env);
    usdt_probedef_t *probedef;
    size_t argc;
    DTraceArgument *arguments[USDT_ARG_MAX];

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Fire(const v8::FunctionCallbackInfo<v8::Value>& args);

    v8::Handle<v8::Value> _fire(v8::Local<v8::Value>);

    DTraceProbe(Environment *env, v8::Local<v8::Object> obj);
    ~DTraceProbe();
  };

  class DTraceProvider : public BaseObject {
  public:
    static void Initialize(v8::Handle<v8::Object> target, Environment *env);
    usdt_provider_t *provider;

    static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void AddProbe(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void RemoveProbe(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Enable(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Disable(const v8::FunctionCallbackInfo<v8::Value>& args);
    static void Fire(const v8::FunctionCallbackInfo<v8::Value>& args);

    DTraceProvider(Environment *env, v8::Local<v8::Object> obj);
    ~DTraceProvider();
  };

  void InitDTraceProvider(v8::Handle<v8::Object> target);
}

#endif  // SRC_DTRACE_PROVIDER_DTRACE_PROVIDER_H_
