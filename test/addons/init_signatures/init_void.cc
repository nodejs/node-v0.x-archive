#include "init_test.h"

// TODO(agnat): needs dll export linkage on win
namespace node { namespace test_init_void {

bool initialized = false;

void init() {
  initialized = true;
}
NODE_MODULE(NODE_TEST_ADDON_NAME, init)

}}  // end of namespace node::test_init_void
