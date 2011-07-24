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


#include <node.h>
#include <platform.h>

#include <v8.h>

#include <errno.h>
#include <stdlib.h>
#include <sys/param.h> // for MAXPATHLEN
#include <unistd.h> // getpagesize
#include <cpuid.h> // __get_cpuid
#include <powrprof.h>

#include <platform_win32.h>

#include <platform_win32_winsock.cc>

typedef struct _PROCESSOR_POWER_INFORMATION {
  ULONG Number;
  ULONG MaxMhz;
  ULONG CurrentMhz;
  ULONG MhzLimit;
  ULONG MaxIdleState;
  ULONG CurrentIdleState;
} PROCESSOR_POWER_INFORMATION, *PPROCESSOR_POWER_INFORMATION;

typedef struct _SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION {
  LARGE_INTEGER IdleTime;
  LARGE_INTEGER KernelTime;
  LARGE_INTEGER UserTime;
  LARGE_INTEGER DpcTime;
  LARGE_INTEGER InterruptTime;
  ULONG InterruptCount;
} SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION,
  *PSYSTEM_PROCESSOR_PERFORMANCE_INFORMATION;

#define SystemProcessorPerformanceInformation 0x08

typedef ULONG (__stdcall *NT_QUERY_SYSTEM_INFORMATION)(
  ULONG SystemInformationClass,
  PVOID SystemInformation,
  ULONG SystemInformationLength,
  PULONG ReturnLength
);

NT_QUERY_SYSTEM_INFORMATION NtQuerySystemInformation =
  (NT_QUERY_SYSTEM_INFORMATION)GetProcAddress(GetModuleHandle("ntdll.dll"),
   "NtQuerySystemInformation");


namespace node {

using namespace v8;

static char *process_title = NULL;
double Platform::prog_start_time = 0.0;


// Does the about the same as strerror(),
// but supports all windows errror messages
const char *winapi_strerror(const int errorno) {
  char *errmsg = NULL;

  FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM |
      FORMAT_MESSAGE_IGNORE_INSERTS, NULL, errorno,
      MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR)&errmsg, 0, NULL);

  if (errmsg) {
    // Remove trailing newlines
    for (int i = strlen(errmsg) - 1;
        i >= 0 && (errmsg[i] == '\n' || errmsg[i] == '\r'); i--) {
      errmsg[i] = '\0';
    }

    return errmsg;
  } else {
    // FormatMessage failed
    return "Unknown error";
  }
}


// Does the about the same as perror(), but for windows api functions
void winapi_perror(const char* prefix = NULL) {
  DWORD errorno = GetLastError();
  const char *errmsg = NULL;

  FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM |
      FORMAT_MESSAGE_IGNORE_INSERTS, NULL, errorno,
      MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPTSTR)&errmsg, 0, NULL);

  if (!errmsg) {
    errmsg = "Unknown error\n";
  }

  // FormatMessage messages include a newline character

  if (prefix) {
    fprintf(stderr, "%s: %s", prefix, errmsg);
  } else {
    fputs(errmsg, stderr);
  }
}


char** Platform::SetupArgs(int argc, char *argv[]) {
  return argv;
}


// Max title length; the only thing MSDN tells us about the maximum length
// of the console title is that it is smaller than 64K. However in practice
// it is much smaller, and there is no way to figure out what the exact length
// of the title is or can be, at least not on XP. To make it even more
// annoying, GetConsoleTitle failes when the buffer to be read into is bigger
// than the actual maximum length. So we make a conservative guess here;
// just don't put the novel you're writing in the title, unless the plot
// survives truncation.
#define MAX_TITLE_LENGTH 8192

void Platform::SetProcessTitle(char *title) {
  // We need to convert _title_ to UTF-16 first, because that's what windows uses internally.
  // It would be more efficient to use the UTF-16 value that we can obtain from v8,
  // but it's not accessible from here.

  int length;
  WCHAR *title_w;

  // Find out how big the buffer for the wide-char title must be
  length = MultiByteToWideChar(CP_UTF8, 0, title, -1, NULL, 0);
  if (!length) {
    winapi_perror("MultiByteToWideChar");
    return;
  }

  // Convert to wide-char string
  title_w = new WCHAR[length];
  length = MultiByteToWideChar(CP_UTF8, 0, title, -1, title_w, length);
  if (!length) {
    winapi_perror("MultiByteToWideChar");
    delete title_w;
    return;
  };

  // If the title must be truncated insert a \0 terminator there
  if (length > MAX_TITLE_LENGTH) {
    title_w[MAX_TITLE_LENGTH - 1] = *L"\0";
  }

  if (!SetConsoleTitleW(title_w)) {
    winapi_perror("SetConsoleTitleW");
  }

  free(process_title);
  process_title = strdup(title);

  delete title_w;
}


static inline char* _getProcessTitle() {
  WCHAR title_w[MAX_TITLE_LENGTH];
  char *title;
  int result, length;

  result = GetConsoleTitleW(title_w, sizeof(title_w) / sizeof(WCHAR));

  if (result == 0) {
    winapi_perror("GetConsoleTitleW");
    return NULL;
  }

  // Find out what the size of the buffer is that we need
  length = WideCharToMultiByte(CP_UTF8, 0, title_w, -1, NULL, 0, NULL, NULL);
  if (!length) {
    winapi_perror("WideCharToMultiByte");
    return NULL;
  }

  title = (char *) malloc(length);
  if (!title) {
    perror("malloc");
    return NULL;
  }

  // Do utf16 -> utf8 conversion here
  if (!WideCharToMultiByte(CP_UTF8, 0, title_w, -1, title, length, NULL, NULL)) {
    winapi_perror("WideCharToMultiByte");
    free(title);
    return NULL;
  }

  return title;
}


const char* Platform::GetProcessTitle(int *len) {
  // If the process_title was never read before nor explicitly set,
  // we must query it with getConsoleTitleW
  if (!process_title) {
    process_title = _getProcessTitle();
  }

  if (process_title) {
    *len = strlen(process_title);
    return process_title;
  } else {
    *len = 0;
    return NULL;
  }
}


int Platform::GetMemory(size_t *rss, size_t *vsize) {
  *rss = 0;
  *vsize = 0;
  return 0;
}


double Platform::GetFreeMemory() {
  MEMORYSTATUSEX status;
  status.dwLength = sizeof(status);
  GlobalMemoryStatusEx(&status);
  return static_cast<double>(status.ullAvailPhys);
}

double Platform::GetTotalMemory() {
  MEMORYSTATUSEX status;
  status.dwLength = sizeof(status);
  GlobalMemoryStatusEx(&status);
  return static_cast<double>(status.ullTotalPhys);  
}


int Platform::GetCPUInfo(Local<Array> *cpus) {
  HandleScope scope;
  Local<Object> cpuinfo;
  Local<Object> cputimes;
  unsigned int i = 0, numcpus, j, max_ext_funcs;
  unsigned int regs[4];
  char CPUName[64];
  SYSTEM_INFO si;

  memset(CPUName, 0, sizeof(CPUName));
  __get_cpuid(0x80000000, &regs[0], &regs[1], &regs[2], &regs[3]);
  max_ext_funcs = regs[0];
  if (max_ext_funcs >= 0x80000004) {
    for (j = 0x80000002; j <= 0x80000004; ++j) {
      __get_cpuid(j, &regs[0], &regs[1], &regs[2], &regs[3]);
      if  (j == 0x80000002)
        memcpy(CPUName, regs, sizeof(regs));
      else if  (j == 0x80000003)
        memcpy(CPUName + 16, regs, sizeof(regs));
      else if  (j == 0x80000004)
        memcpy(CPUName + 32, regs, sizeof(regs));
    }
  }

  GetSystemInfo(&si);
  unsigned int mask = static_cast<unsigned int>(si.dwActiveProcessorMask);
  for (numcpus = 0; mask; ++numcpus)
    mask &= mask - 1;

  PROCESSOR_POWER_INFORMATION ppi[numcpus];
  if (CallNtPowerInformation(ProcessorInformation, NULL, 0, &ppi,
      sizeof(PROCESSOR_POWER_INFORMATION) * numcpus) != ERROR_SUCCESS)
    return -1;

  SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION srpi[numcpus];
  DWORD returnLength = 0;
  if (NtQuerySystemInformation(SystemProcessorPerformanceInformation, &srpi,
      sizeof(SYSTEM_PROCESSOR_PERFORMANCE_INFORMATION) * numcpus,
      &returnLength ) != ERROR_SUCCESS)
    return -1;

  *cpus = Array::New(numcpus);
  for (i = 0; i < numcpus; ++i) {
    cpuinfo = Object::New();
    cputimes = Object::New();
    cputimes->Set(String::New("user"), Number::New(srpi[i].UserTime.QuadPart
                                                   / 100000L));
    cputimes->Set(String::New("nice"), Number::New(0));
    // According to: http://www.netperf.org/svn/netperf2/trunk/src/netcpu_ntperf.c
    // KernelTime in Windows includes both actual kernel time AND idle time
    cputimes->Set(String::New("sys"), Number::New((srpi[i].KernelTime.QuadPart
                                                   - srpi[i].IdleTime.QuadPart)
                                                  / 100000L));
    cputimes->Set(String::New("idle"), Number::New(srpi[i].IdleTime.QuadPart
                                                   / 100000L));
    cputimes->Set(String::New("irq"), Number::New(srpi[i].InterruptTime.QuadPart
                                                  / 100000L));

    cpuinfo->Set(String::New("model"), String::New(CPUName));
    cpuinfo->Set(String::New("speed"), Number::New(ppi[i].CurrentMhz));
    cpuinfo->Set(String::New("times"), cputimes);
    (*cpus)->Set(i, cpuinfo);
  }
  return 0;
}


double Platform::GetUptimeImpl() {
  __int64 qpcnt, qpfreq;
  QueryPerformanceFrequency((LARGE_INTEGER *)&qpfreq);
  QueryPerformanceCounter((LARGE_INTEGER *)&qpcnt);
  return static_cast<double>(qpcnt/((LARGE_INTEGER *)&qpfreq)->QuadPart);
}

int Platform::GetLoadAvg(Local<Array> *loads) {
  return -1;
}


Handle<Value> Platform::GetInterfaceAddresses() {
  HandleScope scope;
  return scope.Close(Object::New());
}


} // namespace node
