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

#ifndef REQ_WRAP_H_
#define REQ_WRAP_H_

namespace node {

template <typename T>
class ReqWrap {
 public:
  ReqWrap() {
    v8::HandleScope scope;
    v8::Local<v8::ObjectTemplate> templ = v8::ObjectTemplate::New();
    templ->SetInternalFieldCount(1);
    templ->SetAccessor(v8::String::New("oncomplete"), OnCompleteGetter, OnCompleteSetter);
    object_ = v8::Persistent<v8::Object>::New(templ->NewInstance());
    object_->SetPointerInInternalField(0, this);
  }

  ~ReqWrap() {
    // Assert that someone has called Dispatched()
    assert(req_.data == this);
    assert(!object_.IsEmpty());
    object_->SetPointerInInternalField(0, NULL);
    object_.Dispose();
    object_.Clear();
    oncomplete_.Dispose();
  }

  // Call this after the req has been dispatched.
  void Dispatched() {
    req_.data = this;
  }

  v8::Persistent<v8::Object> object_;
  v8::Persistent<v8::Function> oncomplete_;
  T req_;
  void* data_;

 private:
  static v8::Handle<v8::Value> OnCompleteGetter(v8::Local<v8::String> property, 
                        const v8::AccessorInfo& info) {
    v8::Local<v8::Object> self = info.Holder();
    ReqWrap* ptr = static_cast<ReqWrap*>(self->GetPointerFromInternalField(0));
    if (ptr) {
      return ptr->oncomplete_;
    }

    return v8::Null();
  }
    
  static void OnCompleteSetter(v8::Local<v8::String> property, v8::Local<v8::Value> value,
               const v8::AccessorInfo& info) {
    v8::Local<v8::Object> self = info.Holder();
    ReqWrap* ptr = static_cast<ReqWrap*>(self->GetPointerFromInternalField(0));

    if (ptr) {
      ptr->oncomplete_ = v8::Persistent<v8::Function>::New(v8::Handle<v8::Function>::Cast(value));
    }
  }
       
};


}  // namespace node


#endif  // REQ_WRAP_H_
