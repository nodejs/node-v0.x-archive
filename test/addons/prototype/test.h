#ifndef ADDONTEST_H
#define ADDONTEST_H

#include <v8.h>
#include <node.h>

class MyClass : public node::ObjectWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

 private:
  MyClass(int);
  ~MyClass();
  static v8::Persistent<v8::FunctionTemplate> constructor;
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> ValueGetter(v8::Local<v8::String> property, 
                                    const v8::AccessorInfo &info);
  static void ValueSetter(v8::Local<v8::String> property, 
                                    v8::Local<v8::Value> value,
                                    const v8::AccessorInfo& info); 
  static v8::Handle<v8::Value> SayHello(const v8::Arguments& args);
  int value_;
};

#endif
