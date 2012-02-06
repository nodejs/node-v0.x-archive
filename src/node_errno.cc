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


#include <node_errno.h>
#include <node_vars.h>
#include <cstring>

using namespace v8;

namespace node {

static Persistent<String> errno_symbol;
static Persistent<String> syscall_symbol;
static Persistent<String> errpath_symbol;
static Persistent<String> code_symbol;

// return the errno key as a string
static const char* get_uv_errno_string(int errorno) {
  uv_err_t err;
  memset(&err, 0, sizeof err);
  err.code = (uv_err_code)errorno;
  return uv_err_name(err);
}
static Handle<Value> GetErrnoCode(const Arguments& args) {
  HandleScope scope;

  int errno = args[0]->NumberValue();
  Local<String> code = String::New(get_uv_errno_string(errno));

  return scope.Close(code);
}

// return the readable errno message
static const char* get_uv_errno_message(int errorno) {
  uv_err_t err;
  memset(&err, 0, sizeof err);
  err.code = (uv_err_code)errorno;
  return uv_strerror(err);
}
static Handle<Value> GetErrnoMessage(const Arguments& args) {
  HandleScope scope;

  int errno = args[0]->NumberValue();
  Local<String> msg = String::New(get_uv_errno_message(errno));

  return scope.Close(msg);
}

// create an errno object
static Handle<Value> ErrnoException(const Arguments& args) {
  HandleScope scope;

  // define object property symbols
  if (syscall_symbol.IsEmpty()) {
    syscall_symbol = NODE_PSYMBOL("syscall");
    errno_symbol = NODE_PSYMBOL("errno");
    errpath_symbol = NODE_PSYMBOL("path");
    code_symbol = NODE_PSYMBOL("code");
  }

  // parse arguments
  // fn(errno, syscall, msg, path)
  int errno;
  Local<Value> code = args[0];
  Local<Value> syscall = args[1];
  Local<Value> msg = args[2];
  Local<Value> path = args[3];

  // convert errno to string
  if (args[0]->IsNumber()) {
    errno = code->NumberValue();
    code = String::New(get_uv_errno_string(errno));
  }

  // get msg if a number was used and msg wasn't set
  if (args[0]->IsNumber() && args[2]->IsUndefined()) {
    msg = String::New(get_uv_errno_message(errno));
  }

  // will contain the error object
  Local<Value> e;

  // add syscall to error message and fallback to errno code
  Local<String> message;
  if (syscall->IsString()) {
    message = syscall->ToString();
  } else {
    message = code->ToString();
  }

  // add msg to error message
  if (msg->IsString()) {
    message = String::Concat(message, String::NewSymbol(", "));
    message = String::Concat(message, msg->ToString());
  }

  // create error object
  e = Exception::Error(message);
  Local<Object> obj = e->ToObject();

  // add Error.code
  obj->Set(code_symbol, code);

  // add Error.errno
  if (args[0]->IsNumber()) {
    obj->Set(errno_symbol, Number::New(errno));
  }

  // add Error.syscall
  if (syscall->IsString()) {
    obj->Set(syscall_symbol, syscall);
  }

  // add Error.path
  if (path->IsString()) {
    obj->Set(errpath_symbol, path);
  }

  return scope.Close(e);
}

void Errno::Initialize(v8::Handle<v8::Object> target) {
  HandleScope scope;

  NODE_SET_METHOD(target, "errnoException", ErrnoException);
  NODE_SET_METHOD(target, "getErrnoCode", GetErrnoCode);
  NODE_SET_METHOD(target, "getErrnoMessage", GetErrnoMessage);
}

}  // namespace node

NODE_MODULE(node_errno, node::Errno::Initialize)
