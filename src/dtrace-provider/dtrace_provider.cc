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

#include "base-object.h"
#include "base-object-inl.h"

#include "env.h"
#include "env-inl.h"

#include "v8.h"

#include <stdio.h>

namespace node {

  using v8::Context;
  using v8::Function;
  using v8::FunctionCallbackInfo;
  using v8::FunctionTemplate;
  using v8::Handle;
  using v8::HandleScope;
  using v8::Isolate;
  using v8::Local;
  using v8::Object;
  using v8::String;
  using v8::True;
  using v8::Value;

  DTraceProvider::DTraceProvider(Environment* env, Local<Object> obj)
    : BaseObject(env, obj) {
    provider = NULL;
    MakeWeak<DTraceProvider>(this);
  }

  DTraceProvider::~DTraceProvider() {
    usdt_provider_disable(provider);
    usdt_provider_free(provider);
  }

  void DTraceProvider::Initialize(Handle<Object> target, Environment* env) {
    HandleScope scope(env->isolate());

    Local<FunctionTemplate> t = FunctionTemplate::New(env->isolate(),
        DTraceProvider::New);
    t->InstanceTemplate()->SetInternalFieldCount(1);
    t->SetClassName(FIXED_ONE_BYTE_STRING(env->isolate(), "DTraceProvider"));

    NODE_SET_PROTOTYPE_METHOD(t, "addProbe", DTraceProvider::AddProbe);
    NODE_SET_PROTOTYPE_METHOD(t, "removeProbe", DTraceProvider::RemoveProbe);
    NODE_SET_PROTOTYPE_METHOD(t, "enable", DTraceProvider::Enable);
    NODE_SET_PROTOTYPE_METHOD(t, "disable", DTraceProvider::Disable);

    target->Set(FIXED_ONE_BYTE_STRING(env->isolate(), "DTraceProvider"),
        t->GetFunction());

    DTraceProbe::Initialize(target, env);
  }

  void DTraceProvider::New(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    Environment *env = Environment::GetCurrent(args.GetIsolate());
    DTraceProvider *p = new DTraceProvider(env, args.This());
    char module[128];

    if (args.Length() < 1 || !args[0]->IsString()) {
      ThrowError("Must give provider name as argument");
      return;
    }

    AsciiValue name(args[0].As<String>());

    if (args.Length() == 2) {
      if (!args[1]->IsString()) {
        ThrowError("Must give module name as argument");
        return;
      }

      AsciiValue mod(args[1].As<String>());
      snprintf(module, sizeof(module), "%s", *mod);
    } else if (args.Length() == 1) {
      // If no module name is provided, develop a synthetic module name based
      // on our address
      snprintf(module, sizeof(module), "mod-%p", p);
    } else {
      ThrowError("Expected only provider name and module as arguments");
      return;
    }

    if ((p->provider = usdt_create_provider(*name, module)) == NULL) {
      ThrowError("usdt_create_provider failed");
      return;
    }

    args.GetReturnValue().Set(args.This());
  }

  void DTraceProvider::AddProbe(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    HandleScope scope(isolate);

    Handle<Object> obj = args.This();
    DTraceProvider *provider = Unwrap<DTraceProvider>(obj);

    Local<Object> dprobe = args[0].As<Object>();

    DTraceProbe *probe = Unwrap<DTraceProbe>(dprobe);

    // store in provider object
    obj->Set(dprobe->ToString(), dprobe);

    usdt_provider_add_probe(provider->provider, probe->probedef);

    args.GetReturnValue().Set(dprobe);
  }

  void DTraceProvider::RemoveProbe(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    HandleScope scope(isolate);

    Handle<Object> provider_obj = args.This();
    DTraceProvider *provider = Unwrap<DTraceProvider>(provider_obj);

    Handle<Object> probe_obj = Local<Object>::Cast(args[0]);
    DTraceProbe *probe = Unwrap<DTraceProbe>(probe_obj);

    Handle<String> name = String::NewFromUtf8(isolate,
        probe->probedef->name);

    provider_obj->Delete(name);

    if (usdt_provider_remove_probe(provider->provider, probe->probedef) != 0) {
      ThrowError(usdt_errstr(provider->provider));
      return;
    }

    args.GetReturnValue().Set(True(isolate));
  }

  void DTraceProvider::Enable(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    DTraceProvider *provider = Unwrap<DTraceProvider>(args.This());

    if (usdt_provider_enable(provider->provider) != 0) {
      ThrowError(usdt_errstr(provider->provider));
      return;
    }
  }

  void DTraceProvider::Disable(const FunctionCallbackInfo<Value>& args) {
    HandleScope scope(args.GetIsolate());
    DTraceProvider *provider = Unwrap<DTraceProvider>(args.Holder());

    if (usdt_provider_disable(provider->provider) != 0) {
      ThrowError(usdt_errstr(provider->provider));
      return;
    }
  }

  static void
  init(Handle<Object> target,
       Handle<Value> unused,
       Handle<Context> context,
       void* priv) {
    Environment *env = Environment::GetCurrent(context);
    DTraceProvider::Initialize(target, env);
  }

  NODE_MODULE_CONTEXT_AWARE_BUILTIN(dtrace_provider, init)
}  // namespace node
