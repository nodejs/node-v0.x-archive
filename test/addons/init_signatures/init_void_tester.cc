#include "init_test.h"

namespace node { namespace test_init_void {
  // TODO(agnat): needs dll import linkage on win
  extern bool initialized; 
}}  // end of namespace node::test_init_void

void init(v8::Handle<v8::Object> exports) {
  node::test::setInitTag(exports);
  node::test::set(exports, "initVoid", node::test_init_void::initialized);
}
NODE_MODULE(init_void_tester, init);
