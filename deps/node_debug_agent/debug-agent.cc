// Copyright 2012 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "debug-agent.h"
#include "debug-agent-inl.h"



namespace inl = internal;

static inl::DebuggerAgent* agent_;


// Public V8 debugger API message handler function. This function just delegates
// to the debugger agent through it's data parameter.
void DebuggerAgent::MessageHandler(const v8::Debug::Message& message) {
  DCHECK(agent_ != NULL);
  agent_->DebuggerMessage(message);
}



static void StubMessageHandler2(const v8::Debug::Message& message) {
  // Simply ignore message.
}


bool DebuggerAgent::EnableAgent(v8::Isolate *isolate, int port, bool wait) {
  i::Isolate *isolate_int = reinterpret_cast<i::Isolate*>(isolate);
  if (wait) {
    // Suspend V8 if it is already running or set V8 to suspend whenever
    // it starts.
    // Provide stub message handler; V8 auto-continues each suspend
    // when there is no message handler; we doesn't need it.
    // Once become suspended, V8 will stay so indefinitely long, until remote
    // debugger connects and issues "continue" command.
    isolate_int->debug()->Load();
    isolate_int->debug()->SetMessageHandler(StubMessageHandler2);
    v8::Debug::DebugBreak(isolate);
  }

  if (agent_ == NULL) {
    agent_ = new inl::DebuggerAgent(isolate_int, "Node Debug Thread", port);
    agent_->Start();
  }
  return true;
}


void DebuggerAgent::StopAgent() {
  if (agent_ != NULL) {
    i::Isolate *isolate = i::Isolate::Current();
    isolate->debug()->SetMessageHandler(NULL);
    agent_->Shutdown();
    agent_->Join();
    delete agent_;
    agent_ = NULL;
  }
}
