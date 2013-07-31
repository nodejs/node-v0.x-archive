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

#include "v8.h"
#include "node.h"
#include "node_natives.h"

#include <string.h>
#if !defined(_MSC_VER)
#include <strings.h>
#endif

namespace node {

v8::Handle<v8::String> MainSource() {
  return v8::String::New(node_native, sizeof(node_native) - 1);
}

void DefineJavaScript(v8::Handle<v8::Object> target) {
  v8::HandleScope scope(node_isolate);

  for (int i = 0; natives[i].name; i++) {
    if (natives[i].source != node_native) {
      v8::Local<v8::String> name = v8::String::New(natives[i].name);
      v8::Handle<v8::String> source = v8::String::New(natives[i].source,
                                                      natives[i].source_len);
      target->Set(name, source);
    }
  }
}

}  // namespace node
