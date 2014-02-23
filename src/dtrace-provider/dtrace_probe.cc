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

#include "env.h"
#include "env-inl.h"

#include "base-object.h"
#include "base-object-inl.h"

#include "v8.h"


namespace node {

  using v8::Array;
  using v8::Exception;
  using v8::Function;
  using v8::FunctionCallbackInfo;
  using v8::FunctionTemplate;
  using v8::Handle;
  using v8::HandleScope;
  using v8::Local;
  using v8::Object;
  using v8::String;
  using v8::True;
  using v8::TryCatch;
  using v8::Undefined;
  using v8::Value;

  DTraceProbe::DTraceProbe(Environment* env, Local<Object> obj)
    : BaseObject(env, obj),
      probedef(NULL),
      argc(0) {
    MakeWeak<DTraceProbe>(this);
  }

  DTraceProbe::~DTraceProbe() {
    for (size_t i = 0; i < argc; i++)
      delete(this->arguments[i]);
    usdt_probe_release(probedef);
  }

  void DTraceProbe::Initialize(Handle<Object> target, Environment* env) {
    HandleScope scope(env->isolate());

    Local<FunctionTemplate> t = FunctionTemplate::New(env->isolate(),
        DTraceProbe::New);
    t->InstanceTemplate()->SetInternalFieldCount(1);
    t->SetClassName(FIXED_ONE_BYTE_STRING(env->isolate(), "DTraceProbe"));

    NODE_SET_PROTOTYPE_METHOD(t, "fire", DTraceProbe::Fire);

    target->Set(FIXED_ONE_BYTE_STRING(env->isolate(), "DTraceProbe"),
        t->GetFunction());
  }

  void DTraceProbe::New(const FunctionCallbackInfo<Value>& args) {
    Environment *env = Environment::GetCurrent(args.GetIsolate());
    DTraceProbe *probe = new DTraceProbe(env, args.This());
    args.GetReturnValue().Set(args.This());

    AsciiValue name(args[0]->ToString());
    Local<Array> arr = args[1].As<Array>();

    const char *types[USDT_ARG_MAX];

    fprintf(stderr, "trying to look at %u args\n", arr->Length());
    fflush(stderr);

    for (uint32_t i = 0; i < USDT_ARG_MAX && i < arr->Length(); i++) {
      int64_t type = arr->Get(i)->IntegerValue();

      switch (type) {
        case ARGUMENT_TYPE_JSON:
          probe->arguments[i] = new DTraceJsonArgument(env);
          break;
        case ARGUMENT_TYPE_INT64:
          probe->arguments[i] =
            new DTraceIntegerArgument<ARGUMENT_TYPE_INT64, int64_t>(env);
          break;
        case ARGUMENT_TYPE_UINT32:
          probe->arguments[i] =
            new DTraceIntegerArgument<ARGUMENT_TYPE_UINT32, uint32_t>(env);
          break;
        case ARGUMENT_TYPE_INT32:
          probe->arguments[i] =
            new DTraceIntegerArgument<ARGUMENT_TYPE_INT32, int32_t>(env);
          break;
        case ARGUMENT_TYPE_UINT16:
          probe->arguments[i] =
            new DTraceIntegerArgument<ARGUMENT_TYPE_UINT16, uint16_t>(env);
          break;
        case ARGUMENT_TYPE_INT16:
          probe->arguments[i] =
            new DTraceIntegerArgument<ARGUMENT_TYPE_INT16, int16_t>(env);
          break;
        case ARGUMENT_TYPE_UINT8:
          probe->arguments[i] =
            new DTraceIntegerArgument<ARGUMENT_TYPE_UINT8, uint8_t>(env);
          break;
        case ARGUMENT_TYPE_INT8:
          probe->arguments[i] =
            new DTraceIntegerArgument<ARGUMENT_TYPE_INT8, int8_t>(env);
          break;
        case ARGUMENT_TYPE_STRING:
          probe->arguments[i] = new DTraceStringArgument(env);
          break;
        default:
          probe->arguments[i] = new DTraceStringArgument(env);
          break;
      }

      types[i] = strdup(probe->arguments[i]->Type());
      probe->argc++;
    }

    probe->probedef = usdt_create_probe(*name, *name, probe->argc, types);

    for (size_t i = 0; i < probe->argc; i++) {
      delete types[i];
    }
  }

  void DTraceProbe::Fire(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    DTraceProbe *pd = Unwrap<DTraceProbe>(args.This());
    args.GetReturnValue().Set(pd->_fire(args[0]));
  }

  Handle<Value> DTraceProbe::_fire(v8::Local<v8::Value> probe_args) {
    if (usdt_is_enabled(this->probedef->probe) == 0)
      return Undefined(env()->isolate());

    // invoke fire callback
    TryCatch try_catch;

    // check return
    if (!probe_args->IsArray())
      return Undefined(env()->isolate());

    Local<Array> a = probe_args.As<Array>();
    void *argv[USDT_ARG_MAX];

    // convert each argument value
    for (size_t i = 0; i < argc; i++) {
      argv[i] = this->arguments[i]->ArgumentValue(a->Get(i));
    }

    // finally fire the probe
    usdt_fire_probe(this->probedef->probe, argc, argv);

    // free argument values
    for (size_t i = 0; i < argc; i++) {
      this->arguments[i]->FreeArgument(argv[i]);
    }

    return True(env()->isolate());
  }

}  //  namespace node
