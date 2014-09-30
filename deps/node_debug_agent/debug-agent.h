// Copyright 2008 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef NODE_DEBUG_AGENT_
#define NODE_DEBUG_AGENT_

#include <v8.h>
#include <include/v8-debug.h>

class DebuggerAgent {
public:
  /**
  * Enable the V8 builtin debug agent. The debugger agent will listen on the
  * supplied TCP/IP port for remote debugger connection.
  * \param name the name of the embedding application
  * \param port the TCP/IP port to listen on
  * \param wait_for_connection whether V8 should pause on a first statement
  *   allowing remote debugger to connect before anything interesting happened
  */
  static bool EnableAgent(v8::Isolate *isolate, int port, bool wait = false);
    
  
  /**
    * Stop the V8 builtin debug agent. The TCP/IP connection will be closed.
    */
  static void StopAgent();


  static void MessageHandler(const v8::Debug::Message& message);
};

#endif  // NODE_DEBUG_AGENT_
