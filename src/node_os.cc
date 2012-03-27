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


#include "node_os.h"

#include <errno.h>
#include <string.h>

#ifdef __MINGW32__
#include <io.h>
#endif

#ifdef __POSIX__
#include <unistd.h>  // gethostname, sysconf
#include <sys/utsname.h>
#endif

#include "node.h"
#include "v8.h"

namespace node {

using v8::Object;
using v8::Handle;
using v8::Local;
using v8::Value;
using v8::HandleScope;
using v8::String;
using v8::Array;
using v8::Arguments;
using v8::Integer;
using v8::Undefined;
using v8::False;
using v8::True;
using v8::Number;

static Handle<Value> GetHostname(const Arguments& args) {
  HandleScope scope;
  char s[255];
  int r = gethostname(s, 255);

  if (r < 0) {
#ifdef __POSIX__
    return ThrowException(ErrnoException(errno, "gethostname"));
#else  // __MINGW32__
    return ThrowException(ErrnoException(WSAGetLastError(), "gethostname"));
#endif  // __MINGW32__
  }

  return scope.Close(String::New(s));
}

static Handle<Value> GetOSType(const Arguments& args) {
  HandleScope scope;

#ifdef __POSIX__
  char type[256];
  struct utsname info;

  uname(&info);
  strncpy(type, info.sysname, strlen(info.sysname));
  type[strlen(info.sysname)] = 0;

  return scope.Close(String::New(type));
#else  // __MINGW32__
  return scope.Close(String::New("Windows_NT"));
#endif
}

static Handle<Value> GetOSRelease(const Arguments& args) {
  HandleScope scope;
  char release[256];

#ifdef __POSIX__
  struct utsname info;

  uname(&info);
  strncpy(release, info.release, strlen(info.release));
  release[strlen(info.release)] = 0;

#else  // __MINGW32__
  OSVERSIONINFO info;
  info.dwOSVersionInfoSize = sizeof(info);

  if (GetVersionEx(&info) == 0) {
    return Undefined();
  }

  snprintf(release, sizeof(release), "%d.%d.%d",
      static_cast<int>(info.dwMajorVersion),
      static_cast<int>(info.dwMinorVersion),
      static_cast<int>(info.dwBuildNumber));
#endif

  return scope.Close(String::New(release));
}

static Handle<Value> GetCPUInfo(const Arguments& args) {
  HandleScope scope;
  uv_cpu_info_t* cpu_infos;
  int count, i;

  uv_err_t err = uv_cpu_info(&cpu_infos, &count);

  if (err.code != UV_OK) {
    return Undefined();
  }

  Local<Array> cpus = Array::New();

  for (i = 0; i < count; i++) {
    Local<Object> times_info = Object::New();
    times_info->Set(String::NewSymbol("user"),
      Integer::New(cpu_infos[i].cpu_times.user));
    times_info->Set(String::NewSymbol("nice"),
      Integer::New(cpu_infos[i].cpu_times.nice));
    times_info->Set(String::NewSymbol("sys"),
      Integer::New(cpu_infos[i].cpu_times.sys));
    times_info->Set(String::NewSymbol("idle"),
      Integer::New(cpu_infos[i].cpu_times.idle));
    times_info->Set(String::NewSymbol("irq"),
      Integer::New(cpu_infos[i].cpu_times.irq));

    Local<Object> cpu_info = Object::New();
    cpu_info->Set(
        String::NewSymbol("model"), String::New(cpu_infos[i].model));
    cpu_info->Set(
        String::NewSymbol("speed"), Integer::New(cpu_infos[i].speed));
    cpu_info->Set(
        String::NewSymbol("times"), times_info);
    (*cpus)->Set(i, cpu_info);
  }

  uv_free_cpu_info(cpu_infos, count);

  return scope.Close(cpus);
}

static Handle<Value> GetFreeMemory(const Arguments& args) {
  HandleScope scope;
  double amount = uv_get_free_memory();

  if (amount < 0) {
    return Undefined();
  }

  return scope.Close(Number::New(amount));
}

static Handle<Value> GetTotalMemory(const Arguments& args) {
  HandleScope scope;
  double amount = uv_get_total_memory();

  if (amount < 0) {
    return Undefined();
  }

  return scope.Close(Number::New(amount));
}

static Handle<Value> GetUptime(const Arguments& args) {
  HandleScope scope;
  double uptime;

  uv_err_t err = uv_uptime(&uptime);

  if (err.code != UV_OK) {
    return Undefined();
  }

  return scope.Close(Number::New(uptime));
}

static Handle<Value> GetLoadAvg(const Arguments& args) {
  HandleScope scope;
  double loadavg[3];
  uv_loadavg(loadavg);

  Local<Array> loads = Array::New(3);
  loads->Set(0, Number::New(loadavg[0]));
  loads->Set(1, Number::New(loadavg[1]));
  loads->Set(2, Number::New(loadavg[2]));

  return scope.Close(loads);
}


static Handle<Value> GetInterfaceAddresses(const Arguments& args) {
  HandleScope scope;
  uv_interface_address_t* interfaces;
  int count, i;
  char ip[INET6_ADDRSTRLEN];
  Local<Object> ret, o;
  Local<String> name, family;
  Local<Array> ifarr;

  uv_err_t err = uv_interface_addresses(&interfaces, &count);

  if (err.code != UV_OK) {
    return Undefined();
  }

  ret = Object::New();

  for (i = 0; i < count; i++) {
    name = String::New(interfaces[i].name);
    if (ret->Has(name)) {
      ifarr = Local<Array>::Cast(ret->Get(name));
    } else {
      ifarr = Array::New();
      ret->Set(name, ifarr);
    }

    if (interfaces[i].address.address4.sin_family == AF_INET) {
      uv_ip4_name(&interfaces[i].address.address4, ip, sizeof(ip));
      family = String::NewSymbol("IPv4");
    } else if (interfaces[i].address.address4.sin_family == AF_INET6) {
      uv_ip6_name(&interfaces[i].address.address6, ip, sizeof(ip));
      family = String::NewSymbol("IPv6");
    } else {
      strncpy(ip, "<unknown sa family>", INET6_ADDRSTRLEN);
      family = String::NewSymbol("<unknown>");
    }

    o = Object::New();
    o->Set(String::NewSymbol("address"), String::New(ip));
    o->Set(String::NewSymbol("family"), family);
    o->Set(String::NewSymbol("internal"), interfaces[i].is_internal ?
        True() : False());

    ifarr->Set(ifarr->Length(), o);
  }

  uv_free_interface_addresses(interfaces, count);

  return scope.Close(ret);
}


void OS::Initialize(v8::Handle<v8::Object> target) {
  HandleScope scope;

  NODE_SET_METHOD(target, "getHostname", GetHostname);
  NODE_SET_METHOD(target, "getLoadAvg", GetLoadAvg);
  NODE_SET_METHOD(target, "getUptime", GetUptime);
  NODE_SET_METHOD(target, "getTotalMem", GetTotalMemory);
  NODE_SET_METHOD(target, "getFreeMem", GetFreeMemory);
  NODE_SET_METHOD(target, "getCPUs", GetCPUInfo);
  NODE_SET_METHOD(target, "getOSType", GetOSType);
  NODE_SET_METHOD(target, "getOSRelease", GetOSRelease);
  NODE_SET_METHOD(target, "getInterfaceAddresses", GetInterfaceAddresses);
}


}  // namespace node

NODE_MODULE(node_os, node::OS::Initialize)
