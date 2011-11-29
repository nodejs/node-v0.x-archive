#define BUILDING_NODE_EXTENSION

#include <node.h>
#include "test.h"

using namespace v8;

Persistent<FunctionTemplate> MyClass::constructor;

MyClass::MyClass(int val) : value_(val) {}
MyClass::~MyClass() {}

Handle<Value> MyClass::New(const Arguments& args) {
  HandleScope scope;

  MyClass* obj = new MyClass(0);
  obj->Wrap(args.This());

  return args.This();
}

Handle<Value> MyClass::ValueGetter(Local<String> property, 
                               const AccessorInfo &info) {
  HandleScope scope;

  // Unwrapped calls might happen (e.g. probing content of prototype itself)
  if (!ObjectWrap::IsWrapped(info.This())) {
    return scope.Close(Undefined());
  }

  MyClass* obj = ObjectWrap::Unwrap<MyClass>(info.This());

  return scope.Close(Integer::New(obj->value_));
}

void MyClass::ValueSetter(Local<String> property, 
                            Local<Value> value,
                            const AccessorInfo& info) {
  HandleScope scope;

  // Unwrapped calls might happen (e.g. probing content of prototype itself)
  if (!ObjectWrap::IsWrapped(info.This())) {
    return;
  }

  MyClass* obj = ObjectWrap::Unwrap<MyClass>(info.This());
  obj->value_ = value->ToInteger()->Value();
}

Handle<Value> MyClass::SayHello(const Arguments& args) {
  HandleScope scope;

  return scope.Close(String::New("hello"));
}

void MyClass::Initialize(Handle<Object> target) {
  HandleScope scope;
  Local<String> name = String::NewSymbol("MyClass");

  NODE_SET_CONSTRUCTOR(constructor, New, name);
  NODE_SET_PROTOTYPE_METHOD(constructor, "sayHello", SayHello);
  NODE_SET_PROTOTYPE_ACCESSOR(constructor, "value", ValueGetter, ValueSetter);

  target->Set(name, constructor->GetFunction());
}

void RegisterModule(Handle<Object> target) {
  MyClass::Initialize(target);
}
NODE_MODULE(test, RegisterModule)
