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
#include "platform.h"

#include <v8.h>

#include <sys/param.h> // for MAXPATHLEN
#include <sys/sysctl.h>
#include <sys/sysinfo.h>
#include <unistd.h> // getpagesize, sysconf
#include <stdio.h> // sscanf, snprintf
#include <fcntl.h> // open

/* SetProcessTitle */
#include <sys/prctl.h>
#include <linux/prctl.h>
#include <stdlib.h> // free
#include <string.h> // strdup

/* GetInterfaceAddresses */
#include <arpa/inet.h>
#include <sys/types.h>
#include <ifaddrs.h>
#include <errno.h>
#include <sys/ioctl.h>
#include <net/if.h>

#if HAVE_MONOTONIC_CLOCK
#include <time.h>
#endif

namespace node {

using namespace v8;

static char *process_title;
double Platform::prog_start_time = Platform::GetUptime();


char** Platform::SetupArgs(int argc, char *argv[]) {
  process_title = strdup(argv[0]);
  return argv;
}


void Platform::SetProcessTitle(char *title) {
  if (process_title) free(process_title);
  process_title = strdup(title);
  prctl(PR_SET_NAME, process_title);
}


const char* Platform::GetProcessTitle(int *len) {
  if (process_title) {
    *len = strlen(process_title);
    return process_title;
  }
  *len = 0;
  return NULL;
}


int Platform::GetMemory(size_t *rss, size_t *vsize) {
  // See proc(5) manual
  int fd = open("/proc/self/stat", O_RDONLY);
  if (fd < 0) return -1;

  char buf[512];
  size_t value;
  char *p;
  ssize_t len = read(fd, buf, sizeof(buf));
  close(fd);

  if (len == sizeof(buf))
    buf[sizeof(buf)-1] = '\n';
  if (len <= 0 || buf[len-1] != '\n') goto error;
  //if (len < 40) goto error;

  p = buf;

  if (*p < '1' || *p > '9') goto error;
  do {
      if (*++p == '\n') goto error;
  } while (*p >= '0' && *p <= '9');
  if (*p != ' ') goto error;
  if (*++p != '(') goto error;

  // skip process name
  do {
    if (*++p == '\n') goto error;
  } while (*p != ')');
  if (*++p != ' ') goto error;

  // skip 20 columns
  int i;
  for(i=0; i<20; i++) {
    do {
      if (*++p == '\n') goto error;
      if (*p == ')') goto error; // the process name breaks parsing
    } while (*p != ' ');
  }

  // read vsize
  value = 0;
  int c;
  while (1) {
    c = *++p;
    if (c == ' ') break;
    if (c < '0' || c > '9') goto error;
    value = value * 10 + (c - '0');
  }
  *vsize = value;

  // read rss
  value = 0;
  while (1) {
    c = *++p;
    if (c == ' ') break;
    if (c < '0' || c > '9') goto error;
    value = value * 10 + (c - '0');
  }
  *rss = value * getpagesize();

  return 0;

error:
  *rss = *vsize = 0;
  return -1;
}


int Platform::GetExecutablePath(char* buffer, size_t* size) {
  *size = readlink("/proc/self/exe", buffer, *size - 1);
  if (*size <= 0) return -1;
  buffer[*size] = '\0';
  return 0;
}

int Platform::GetCPUInfo(Local<Array> *cpus) {
  HandleScope scope;
  Local<Object> cpuinfo;
  Local<Object> cputimes;
  unsigned int ticks = (unsigned int)sysconf(_SC_CLK_TCK),
               multiplier = ((uint64_t)1000L / ticks), cpuspeed;
  int numcpus = 0, i = 0;
  unsigned long long ticks_user, ticks_sys, ticks_idle, ticks_nice, ticks_intr;
  char line[512], speedPath[256], model[512];
  FILE *fpStat = fopen("/proc/stat", "r");
  FILE *fpModel = fopen("/proc/cpuinfo", "r");
  FILE *fpSpeed;

  if (fpModel) {
    while (fgets(line, 511, fpModel) != NULL) {
      if (strncmp(line, "model name", 10) == 0) {
        numcpus++;
        if (numcpus == 1) {
          char *p = strchr(line, ':') + 2;
          strcpy(model, p);
          model[strlen(model)-1] = 0;
        }
      } else if (strncmp(line, "cpu MHz", 7) == 0) {
        if (numcpus == 1) {
          sscanf(line, "%*s %*s : %u", &cpuspeed);
        }
      }
    }
    fclose(fpModel);
  }

  *cpus = Array::New(numcpus);

  if (fpStat) {
    while (fgets(line, 511, fpStat) != NULL) {
      if (strncmp(line, "cpu ", 4) == 0) {
        continue;
      } else if (strncmp(line, "cpu", 3) != 0) {
        break;
      }

      sscanf(line, "%*s %llu %llu %llu %llu %*llu %llu",
             &ticks_user, &ticks_nice, &ticks_sys, &ticks_idle, &ticks_intr);
      snprintf(speedPath, sizeof(speedPath),
               "/sys/devices/system/cpu/cpu%u/cpufreq/cpuinfo_max_freq", i);

      fpSpeed = fopen(speedPath, "r");

      if (fpSpeed) {
        if (fgets(line, 511, fpSpeed) != NULL) {
          sscanf(line, "%u", &cpuspeed);
          cpuspeed /= 1000;
        }
        fclose(fpSpeed);
      }

      cpuinfo = Object::New();
      cputimes = Object::New();
      cputimes->Set(String::New("user"), Number::New(ticks_user * multiplier));
      cputimes->Set(String::New("nice"), Number::New(ticks_nice * multiplier));
      cputimes->Set(String::New("sys"), Number::New(ticks_sys * multiplier));
      cputimes->Set(String::New("idle"), Number::New(ticks_idle * multiplier));
      cputimes->Set(String::New("irq"), Number::New(ticks_intr * multiplier));

      cpuinfo->Set(String::New("model"), String::New(model));
      cpuinfo->Set(String::New("speed"), Number::New(cpuspeed));

      cpuinfo->Set(String::New("times"), cputimes);
      (*cpus)->Set(i++, cpuinfo);
    }
    fclose(fpStat);
  }

  return 0;
}

double Platform::GetFreeMemory() {
  double pagesize = static_cast<double>(sysconf(_SC_PAGESIZE));
  double pages = static_cast<double>(sysconf(_SC_AVPHYS_PAGES));

  return static_cast<double>(pages * pagesize);
}

double Platform::GetTotalMemory() {
  double pagesize = static_cast<double>(sysconf(_SC_PAGESIZE));
  double pages = static_cast<double>(sysconf(_SC_PHYS_PAGES));

  return pages * pagesize;
}

double Platform::GetUptimeImpl() {
#if HAVE_MONOTONIC_CLOCK
  struct timespec now;
  if (0 == clock_gettime(CLOCK_MONOTONIC, &now)) {
    double uptime = now.tv_sec;
    uptime += (double)now.tv_nsec / 1000000000.0;
    return uptime;
  }
  return -1;
#else
  struct sysinfo info;
  if (sysinfo(&info) < 0) {
    return -1;
  }
  return static_cast<double>(info.uptime);
#endif
}

int Platform::GetLoadAvg(Local<Array> *loads) {
  struct sysinfo info;

  if (sysinfo(&info) < 0) {
    return -1;
  }
  (*loads)->Set(0, Number::New(static_cast<double>(info.loads[0]) / 65536.0));
  (*loads)->Set(1, Number::New(static_cast<double>(info.loads[1]) / 65536.0));
  (*loads)->Set(2, Number::New(static_cast<double>(info.loads[2]) / 65536.0));

  return 0;
}


bool IsInternal(struct ifaddrs* addr) {
  return addr->ifa_flags & IFF_UP &&
         addr->ifa_flags & IFF_RUNNING &&
         addr->ifa_flags & IFF_LOOPBACK;
}


Handle<Value> Platform::GetInterfaceAddresses() {
  HandleScope scope;

  struct ::ifaddrs *addrs;

  int r = getifaddrs(&addrs);

  if (r != 0) {
    return ThrowException(ErrnoException(errno, "getifaddrs"));
  }

  struct ::ifaddrs *addr;

  Local<Object> a = Object::New();

  for (addr = addrs;
       addr;
       addr = addr->ifa_next) {
    Local<String> name = String::New(addr->ifa_name);
    Local<Object> info;

    if (a->Has(name)) {
      info = a->Get(name)->ToObject();
    } else {
      info = Object::New();
      a->Set(name, info);
    }

    struct sockaddr *address = addr->ifa_addr;
    char ip[INET6_ADDRSTRLEN];

    switch (address->sa_family) {
      case AF_INET6: {
        struct sockaddr_in6 *a6 = (struct sockaddr_in6*)address;
        inet_ntop(AF_INET6, &(a6->sin6_addr), ip, INET6_ADDRSTRLEN);
        info->Set(String::New("ip6"), String::New(ip));
        if (addr->ifa_flags) {
          info->Set(String::New("internal"),
                    IsInternal(addr) ? True() : False());
        }
        break;
      }

      case AF_INET: {
        struct sockaddr_in *a4 = (struct sockaddr_in*)address;
        inet_ntop(AF_INET, &(a4->sin_addr), ip, INET6_ADDRSTRLEN);
        info->Set(String::New("ip"), String::New(ip));
        if (addr->ifa_flags) {
          info->Set(String::New("internal"),
                    IsInternal(addr) ? True() : False());
        }
        break;
      }
    }
  }

  freeifaddrs(addrs);

  return scope.Close(a);
}


}  // namespace node
