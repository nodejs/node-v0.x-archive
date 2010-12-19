#include <node_debug.h>

namespace node {

static ev_async debug_watcher;
static bool running;

static void DebugMessageCallback(EV_P_ ev_async *watcher, int revents) {
  v8::HandleScope scope;
  assert(watcher == &debug_watcher);
  assert(revents == EV_ASYNC);
  v8::Debug::ProcessDebugMessages();
}

static void DebugMessageDispatch(void) {
  // This function is called from V8's debug thread when a debug TCP client
  // has sent a message.

  // Send a signal to our main thread saying that it should enter V8 to
  // handle the message.
  ev_async_send(EV_DEFAULT_UC_ &debug_watcher);
}

static void DebugBreakMessageHandler(const v8::Debug::Message& message) {
  // do nothing with debug messages.
  // The message handler will get changed by DebuggerAgent::CreateSession in
  // debug-agent.cc of v8/src when a new session is created
}

static v8::Handle<v8::Value> Start(const v8::Arguments& args) {
  v8::HandleScope scope;
  if (!running) {
    int32_t debug_port = 5858;
    bool wait = false;
    if (args.Length() > 0) {
      debug_port = args[0]->Int32Value();
      if (debug_port < 1 || debug_port > 65535) {
        return v8::ThrowException(v8::Exception::Error(v8::String::New("invalid port")));
      }
    }
    if (args.Length() > 1) {
      wait = args[1]->BooleanValue();
    }
    // Initialize the async watcher for receiving messages from the debug
    // thread and marshal it into the main thread. DebugMessageCallback()
    // is called from the main thread to execute a random bit of javascript
    // - which will give V8 control so it can handle whatever new message
    // had been received on the debug thread.
    ev_async_init(&debug_watcher, DebugMessageCallback);
    ev_set_priority(&debug_watcher, EV_MAXPRI);
    // Set the callback DebugMessageDispatch which is called from the debug
    // thread.
    v8::Debug::SetDebugMessageDispatchHandler(DebugMessageDispatch);
    // Start the async watcher.
    ev_async_start(EV_DEFAULT_UC_ &debug_watcher);
    // unref it so that we exit the event loop despite it being active.
    ev_unref(EV_DEFAULT_UC);

    // Start the debug thread and it's associated TCP server on port 5858.
    running = v8::Debug::EnableAgent("node", debug_port);
    if (wait) {
      // Set up an empty handler so v8 will not continue until a debugger
      // attaches. This is the same behavior as Debug::EnableAgent(_,_,true)
      // except we don't break at the beginning of the script.
      // see Debugger::StartAgent in debug.cc of v8/src
      v8::Debug::SetMessageHandler2(DebugBreakMessageHandler);
    }
    printf("debugger listening on port %d\n", debug_port);
  }
  return scope.Close(v8::Boolean::New(running));
}

static v8::Handle<v8::Value> Pause(const v8::Arguments& args) {
  v8::Debug::DebugBreak();
  return v8::Undefined();
}

void Debug::Initialize(v8::Handle<v8::Object> target) {
  v8::HandleScope scope;
  NODE_SET_METHOD(target, "start", Start);
  NODE_SET_METHOD(target, "pause", Pause);
}
  
}

NODE_MODULE(node_debug, node::Debug::Initialize);