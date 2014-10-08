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


#include "node.h"
#include "node_os_signals.h"

#if defined(_MSC_VER)
#include <direct.h>
#include <io.h>
#include <process.h>
#endif

#ifdef __POSIX__
#include <string.h>
#endif


namespace node {

#ifdef __POSIX__
void RegisterSignalHandler(int signal, SignalHandler handler, bool reset) {
  struct sigaction sa;
  memset(&sa, 0, sizeof(sa));
  sa.sa_handler = handler;
  sa.sa_flags = reset ? SA_RESETHAND : 0;
  sigfillset(&sa.sa_mask);
  CHECK_EQ(sigaction(signal, &sa, NULL), 0);
}


void SendDebugSignalToProc(v8::Isolate* isolate, int arg_pid) {
  pid_t pid = arg_pid;
  int r = kill(pid, SIGUSR1);
  if (r != 0) {
    isolate->ThrowException(ErrnoException(isolate, errno, "kill", "", ""));
    return;
  }
}
#endif  // __POSIX__



#ifdef _WIN32
#define SIGUSR1 0
const int NAME_SIZE = 32;

static SignalHandler debug_signal_handler;

DWORD WINAPI EnableDebugThreadProc(void* arg) {
  debug_signal_handler(0);
  return 0;
}


int GetDebugSignalHandlerMappingName(DWORD pid, wchar_t* buf, size_t buf_len) {
  return _snwprintf(buf, buf_len, L"node-debug-handler-%u", pid);
}


void RegisterSignalHandler(int signal, SignalHandler handler, bool reset) {
  debug_signal_handler = handler;

  wchar_t mapping_name[NAME_SIZE];
  HANDLE mapping_handle;
  DWORD pid;
  LPTHREAD_START_ROUTINE* pHandler;

  pid = GetCurrentProcessId();

  if (GetDebugSignalHandlerMappingName(pid, mapping_name, NAME_SIZE) < 0) {
    return;
  }

  mapping_handle = CreateFileMappingW(INVALID_HANDLE_VALUE,
                                      NULL,
                                      PAGE_READWRITE,
                                      0,
                                      sizeof *pHandler,
                                      mapping_name);
  if (mapping_handle == NULL) {
    return;
  }

  pHandler = reinterpret_cast<LPTHREAD_START_ROUTINE*>(
    MapViewOfFile(mapping_handle,
    FILE_MAP_ALL_ACCESS,
    0,
    0,
    sizeof *pHandler));
  if (pHandler == NULL) {
    CloseHandle(mapping_handle);
    return;
  }

  *pHandler = EnableDebugThreadProc;

  UnmapViewOfFile(static_cast<void*>(pHandler));
}


void SendDebugSignalToProc(v8::Isolate* isolate, int arg_pid) {
  DWORD pid = arg_pid;
  HANDLE process = NULL;
  HANDLE thread = NULL;
  HANDLE mapping = NULL;
  wchar_t mapping_name[NAME_SIZE];
  LPTHREAD_START_ROUTINE* handler = NULL;


  process = OpenProcess(PROCESS_CREATE_THREAD | PROCESS_QUERY_INFORMATION |
                        PROCESS_VM_OPERATION | PROCESS_VM_WRITE |
                        PROCESS_VM_READ,
                        FALSE,
                        pid);
  if (process == NULL) {
    isolate->ThrowException(
      WinapiErrnoException(isolate, GetLastError(), "OpenProcess"));
    goto out;
  }

  if (GetDebugSignalHandlerMappingName(pid, mapping_name, NAME_SIZE) < 0) {
    isolate->ThrowException(
      ErrnoException(isolate, errno, "printf", "", ""));
    goto out;
  }

  mapping = OpenFileMappingW(FILE_MAP_READ, FALSE, mapping_name);
  if (mapping == NULL) {
    isolate->ThrowException(WinapiErrnoException(isolate,
      GetLastError(),
      "OpenFileMappingW"));
    goto out;
  }

  handler = reinterpret_cast<LPTHREAD_START_ROUTINE*>(
    MapViewOfFile(mapping,
    FILE_MAP_READ,
    0,
    0,
    sizeof *handler));
  if (handler == NULL || *handler == NULL) {
    isolate->ThrowException(
      WinapiErrnoException(isolate, GetLastError(), "MapViewOfFile"));
    goto out;
  }

  thread = CreateRemoteThread(process,
                              NULL,
                              0,
                              *handler,
                              NULL,
                              0,
                              NULL);
  if (thread == NULL) {
    isolate->ThrowException(WinapiErrnoException(isolate,
      GetLastError(),
      "CreateRemoteThread"));
    goto out;
  }

  // Wait for the thread to terminate
  if (WaitForSingleObject(thread, INFINITE) != WAIT_OBJECT_0) {
    isolate->ThrowException(WinapiErrnoException(isolate,
      GetLastError(),
      "WaitForSingleObject"));
    goto out;
  }

 out:
  if (process != NULL)
    CloseHandle(process);
  if (thread != NULL)
    CloseHandle(thread);
  if (handler != NULL)
    UnmapViewOfFile(handler);
  if (mapping != NULL)
    CloseHandle(mapping);
}
#endif  // _WIN32


static uv_async_t on_uv_debugger;


// Called from OS signal handlers
void OnSignal_Debugger(int signum) {
  uv_async_send(&on_uv_debugger);
}

void RegisterDebugSignalHandler(uv_async_cb handler) {
  uv_async_init(uv_default_loop(), &on_uv_debugger, handler);
  uv_unref(reinterpret_cast<uv_handle_t*>(&on_uv_debugger));

  RegisterSignalHandler(SIGUSR1, OnSignal_Debugger);
}

}  // end namespace node

#ifdef _WIN32
#undef SIGUSR1
#endif

