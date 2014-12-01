#ifndef NODE_TEST_ADDON_INIT_TEST_H
# define NODE_TEST_ADDON_INIT_TEST_H

#include <node.h>

#define NODE_TEST_ADDON_INIT_TAG(exports)                   \
  {                                                         \
    v8::Isolate * isolate = v8::Isolate::GetCurrent();      \
    exports->Set(                                           \
        v8::String::NewFromUtf8(isolate, "initialized"),    \
        v8::Boolean::New(isolate, true));                   \
  }

#endif // NODE_TEST_ADDON_INIT_TEST_H
