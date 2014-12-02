#include <node.h>

#if __cplusplus <= 199711L  // not C++11
# warning C++11 is not available.
#endif

void init(v8::Handle<v8::Object> exports) {}
NODE_MODULE(binding, init);
