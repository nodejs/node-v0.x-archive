#if __APPLE__
    #include "TargetConditionals.h"
    #if TARGET_OS_IPHONE && TARGET_CPU_ARM64
        #include "opensslconf-ios-arm64.h"
    #elif TARGET_OS_IPHONE && TARGET_CPU_ARM
        #include "opensslconf-ios-armv7.h"
    #elif TARGET_OS_IPHONE && TARGET_CPU_X86
        #include "opensslconf-ios-i386.h"
    #elif TARGET_OS_IPHONE && TARGET_CPU_X86_64
        #include "opensslconf-ios-x86_64.h"
    #elif TARGET_OS_IPHONE
        #error Unknown iphone platform
    #elif TARGET_OS_MAC && TARGET_CPU_X86
        #include "opensslconf-mac-i386.h"
    #elif TARGET_OS_MAC && TARGET_CPU_X86_64
        #include "opensslconf-mac-x86_64.h"
    #elif TARGET_OS_MAC
        // Falling back to the generic configs for mac
        #include "opensslconf-generic.h"
    #else
        #error Unkonwn Apple platform
    #endif
#else
    #include "opensslconf-generic.h"
#endif
