#include <node.h>
#include <handle_wrap.h>

#define UNWRAP \
  assert(!args.Holder().IsEmpty()); \
  assert(args.Holder()->InternalFieldCount() > 0); \
  SignalWrap* wrap =  \
      static_cast<SignalWrap*>(args.Holder()->GetPointerFromInternalField(0)); \
  if (!wrap) { \
    SetErrno(UV_EBADF); \
    return scope.Close(Integer::New(-1)); \
  }

namespace node {

using v8::Object;
using v8::Handle;
using v8::Local;
using v8::Persistent;
using v8::Value;
using v8::HandleScope;
using v8::FunctionTemplate;
using v8::String;
using v8::Function;
using v8::TryCatch;
using v8::Context;
using v8::Arguments;
using v8::Integer;


class SignalWrap : public HandleWrap {
 public:
  static void Initialize(Handle<Object> target) {
    HandleScope scope;

    HandleWrap::Initialize(target);

    Local<FunctionTemplate> constructor = FunctionTemplate::New(New);
    constructor->InstanceTemplate()->SetInternalFieldCount(1);
    constructor->SetClassName(String::NewSymbol("SignalWatcher"));

    NODE_SET_PROTOTYPE_METHOD(constructor, "close", HandleWrap::Close);

    NODE_SET_PROTOTYPE_METHOD(constructor, "start", Start);
    NODE_SET_PROTOTYPE_METHOD(constructor, "stop", Stop);

    target->Set(String::NewSymbol("SignalWatcher"), constructor->GetFunction());
  }

 private:
  static Handle<Value> New(const Arguments& args) {
    // This constructor should not be exposed to public javascript.
    // Therefore we assert that we are not trying to call this as a
    // normal function.
    assert(args.IsConstructCall());

    HandleScope scope;

    if (args.Length() != 1 || !args[0]->IsInt32()) {
      return ThrowException(String::New("Bad arguments"));
    }

    int sig = args[0]->Int32Value();


    SignalWrap *wrap = new SignalWrap(args.This(), sig);
    assert(wrap);

    return scope.Close(args.This());
  }

  SignalWrap(Handle<Object> object, int sig)
      : HandleWrap(object, (uv_handle_t*) &handle_)
      , sig_(sig){
    active_ = false;
    int r = uv_signal_init(uv_default_loop(), &handle_);
    handle_.data = this;

    uv_unref(uv_default_loop());
  }

  ~SignalWrap() {
    if (!active_) uv_ref(uv_default_loop());
  }

  void StateChange() {
    bool was_active = active_;
    active_ = uv_is_active((uv_handle_t*) &handle_);

    if (!was_active && active_) {
      // If our state is changing from inactive to active, we
      // increase the loop's reference count.
      uv_ref(uv_default_loop());
    } else if (was_active && !active_) {
      // If our state is changing from active to inactive, we
      // decrease the loop's reference count.
      uv_unref(uv_default_loop());
    }
  }

  static Handle<Value> Start(const Arguments& args) {

    HandleScope scope;

    UNWRAP


    int r = uv_signal_start(&wrap->handle_, OnSignal, sig_);

    // Error starting the timer.
    if (r) SetErrno(uv_last_error(uv_default_loop()).code);

    wrap->StateChange();

    return scope.Close(Integer::New(r));
  }

  static Handle<Value> Stop(const Arguments& args) {
    HandleScope scope;

    UNWRAP

    int r = uv_signal_stop(&wrap->handle_);

    if (r) SetErrno(uv_last_error(uv_default_loop()).code);

    wrap->StateChange();

    return scope.Close(Integer::New(r));
  }


  static void OnSignal(uv_signal_t* handle, int type) {
    

    SignalWrap* wrap = static_cast<SignalWrap*>(handle->data);
    assert(wrap);
	
	  if(wrap->sig_ == type)
		  return ;

    wrap->StateChange();

    Local<Value> argv[1] = { Integer::New(type) };
    MakeCallback(wrap->object_, "callback", 1, argv);
  }

  uv_signal_t handle_;
  // This member is set false initially. When the signal is turned
  // on uv_ref is called. When the timer is turned off uv_unref is
  // called. Used to mirror libev semantics.
  bool active_;

  // this member is signal type;
  int sig_;
};


}  // namespace node

NODE_MODULE(node_signal_watcher, node::SignalWrap::Initialize);
