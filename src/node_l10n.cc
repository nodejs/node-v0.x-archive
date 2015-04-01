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

#include "node_l10n.h"

#include "env.h"
#include "node_wrap.h"
#include "string_bytes.h"
#include <stdio.h>
#include <assert.h>

namespace node {

using v8::String;
using v8::Number;
using v8::HandleScope;
using v8::FunctionCallbackInfo;
using v8::Handle;
using v8::Context;
using v8::Object;
using v8::Value;
using v8::Isolate;
using v8::Local;
using v8::PropertyAttribute;

void Bundle::Initialize(Handle<Object> target,
                        Handle<Value> unused,
                        Handle<Context> context) {
  NODE_SET_METHOD(target, "fetch", Fetch);

  Isolate* isolate = Isolate::GetCurrent();

  (target)->ForceSet(
    String::NewFromUtf8(isolate, "locale"),
    String::NewFromUtf8(isolate, L10N_LOCALE()),
    static_cast<PropertyAttribute>(v8::ReadOnly | v8::DontDelete));

  #if defined(NODE_HAVE_I18N_SUPPORT)
  (target)->ForceSet(
    String::NewFromUtf8(isolate, "icu"),
    Number::New(isolate, 1),
    static_cast<PropertyAttribute>(v8::ReadOnly | v8::DontDelete));
  #endif

}

// borrowed from v8
// (see http://v8.googlecode.com/svn/trunk/samples/shell.cc)
const char* ToCString(const String::Utf8Value& value) {
  return *value ? *value : "<string conversion failed>";
}

void Bundle::Fetch(const FunctionCallbackInfo<Value>& args) {
  // we only pay attention to the first two args,
  // they both need to be strings, these are passed
  // off to the L10N macro. For javascript, we'll
  // handle the actual printf formatting using the
  // util.js format method
  assert(args.Length() >= 2);
  HandleScope handle_scope(args.GetIsolate());
  v8::String::Utf8Value key(args[0]);
  v8::String::Utf8Value fallback(args[1]);
  const char * ckey = ToCString(key);
  const char * cfallback = ToCString(fallback);
  const char * msg = L10N(ckey,cfallback);

  args.GetReturnValue().Set(
    v8::String::NewFromUtf8(
      args.GetIsolate(), msg));

#if defined(NODE_HAVE_I18N_SUPPORT)
  if (msg != cfallback) {
    delete[] msg;
  }
#endif
}

} // namespace node


NODE_MODULE_CONTEXT_AWARE_BUILTIN(node_l10n, node::Bundle::Initialize)
