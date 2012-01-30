/** section: Addons
Addons

Addons are dynamically linked shared objects. They can provide glue to C and C++ libraries. The API (at the moment) is rather complex, involving knowledge of several libraries:

 - V8 Javascript, a C++ library. Used for interfacing with Javascript: creating objects, calling functions, etc. These are documented mostly in the `v8.h` header file (`deps/v8/include/v8.h` in the Node.js source tree).

 - [libuv](https://github.com/joyent/libuv), a C event loop library. Anytime one needs to wait for a file descriptor to become readable, wait for a timer, or wait for a signal to received one needs to interface with libuv. That is, if you perform any I/O, libuv needs to be used.

 - Internal Node libraries. Most importantly is the `node::ObjectWrap` class which you will likely want to derive from.

 - Additional libraries, located the `deps/` folder.

Node.js statically compiles all its dependencies into the executable. When compiling your module, you don't need to worry about linking to any of these libraries.

To get started, let's make a small addon which is the C++ equivalent of the following Javascript code:

    exports.hello = function() { return 'world'; };

First, we'll create a file called `hello.cc`:

    #include <node.h>
    #include <v8.h>

    using namespace v8;

    Handle<Value> Method(const Arguments& args) {
      HandleScope scope;
      return scope.Close(String::New("world"));
    }

    void init(Handle<Object> target) {
      NODE_SET_METHOD(target, "hello", Method);
    }
    NODE_MODULE(hello, init)

Note that all Node.js addons must export an initialization function:

    void Initialize (Handle<Object> target);
    NODE_MODULE(module_name, Initialize)

There is no semi-colon after `NODE_MODULE`, as it's not a function (for more information, see `node.h`).

The `module_name` needs to match the filename of the final binary (minus the __.node__ suffix).

The source code needs to be built into `hello.node`, the binary addon. To do this we create a file called `wscript`, which is Python code and looks like this:

    srcdir = '.'
    blddir = 'build'
    VERSION = '0.0.1'

    def set_options(opt):
      opt.tool_options('compiler_cxx')

    def configure(conf):
      conf.check_tool('compiler_cxx')
      conf.check_tool('node_addon')

    def build(bld):
      obj = bld.new_task_gen('cxx', 'shlib', 'node_addon')
      obj.target = 'hello'
      obj.source = 'hello.cc'

Running `node-waf configure build` will create a file `build/default/hello.node` which is our addon.

`node-waf` is just [WAF](http://code.google.com/p/waf), the Python-based build system. `node-waf` is provided for developers to easily access it.

You can now use the binary addon in a Node project `hello.js` by pointing `require` to the recently built module:

    var addon = require('./build/Release/hello');

    console.log(addon.hello()); // 'world'

For the moment, that is all the documentation on addons. Please see
[https://github.com/pietern/hiredis-node](https://github.com/pietern/hiredis-node">https://github.com/pietern/hiredis-node) for a real example.

**/