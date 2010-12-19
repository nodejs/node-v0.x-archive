#ifndef SRC_DEBUG_H_
#define SRC_DEBUG_H_

#include <node.h>
#include <node_events.h>
#include <v8.h>
#include <v8-debug.h>

namespace node {

class Debug {
 public:
  static void Initialize(v8::Handle<v8::Object> target);
};


}  // namespace node
#endif  // SRC_DEBUG_H_
