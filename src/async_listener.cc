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

#include "async-wrap.h"
#include "async-wrap-inl.h"
#include "env.h"
#include "env-inl.h"

namespace node {

using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::Handle;
using v8::HandleScope;
using v8::Local;
using v8::Object;
using v8::Value;

static void SetupAsyncListener(const FunctionCallbackInfo<Value>& args) {
  HandleScope handle_scope(args.GetIsolate());
  Environment* env = Environment::GetCurrent(args.GetIsolate());

  assert(args[0]->IsObject());
  assert(args[1]->IsFunction());
  assert(args[2]->IsFunction());
  assert(args[3]->IsFunction());
  assert(args[4]->IsFunction());

  env->set_async_listener_run_function(args[1].As<Function>());
  env->set_async_listener_load_function(args[2].As<Function>());
  env->set_async_listener_unload_function(args[3].As<Function>());

  Local<Object> async_listener_flag_obj = args[0].As<Object>();
  Environment::AsyncListener* async_listener = env->async_listener();
  async_listener_flag_obj->SetIndexedPropertiesToExternalArrayData(
      async_listener->fields(),
      v8::kExternalUnsignedIntArray,
      async_listener->fields_count());

  Local<Object> process = env->process_object();

  Local<Value> setErrorHandler = process->Get(
      FIXED_ONE_BYTE_STRING(args.GetIsolate(), "_setFatalErrorHandler"));

  if (setErrorHandler->IsUndefined())
    return;

  Local<Function> setFunc = setErrorHandler.As<Function>();

  Local<Value> errorHandler = args[4];
  setFunc->Call(process, 1, &errorHandler);
}

static void InitializeAL(Handle<Object> target,
                         Handle<Value> unused,
                         Handle<Context> context) {
  NODE_SET_METHOD(target, "setupAsyncListener", SetupAsyncListener);
}

};  // namespace node

NODE_MODULE_CONTEXT_AWARE_BUILTIN(async_listener, node::InitializeAL)
