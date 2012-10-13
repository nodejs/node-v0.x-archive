#ifndef _SRC_ATOMIC_H_
#define _SRC_ATOMIC_H_

/* GCC >= 4.1 has built-in intrinsics. We'll use those */
#if defined(__GNUC__)
# if (__GNUC__ > 4) || (__GNUC__ == 4 && __GNUC_MINOR__ >= 1)

#  define ATOMIC_ADD(arg, num) __sync_add_and_fetch(&arg, num)
#  define ATOMIC_SUB(arg, num) __sync_sub_and_fetch(&arg, num)

# elif defined( __i386__ ) || defined( __i486__ ) || defined( __i586__ ) || \
       defined( __i686__ ) || defined( __x86_64__ )

# define ATOMIC_ADD(arg, num)  asm volatile ("lock add %0, %1\n" : \
                                             : "r" (num), "m" (arg))
# define ATOMIC_SUB(arg, num)  asm volatile ("lock sub %0, %1\n" : \
                                             : "r" (num), "m" (arg))

# else

#  error Atomic operations are not supported on your platform

# endif

#elif defined(__APPLE__)

#include <libkern/OSAtomic.h>

# if defined( __x86_64__ ) || defined ( __ppc64__)
#  define ATOMIC_CAST_WORD(arg) ((volatile int64_t*)(arg))

#  define ATOMIC_ADD(arg, num) OSAtomicAdd64(num, ATOMIC_CAST_WORD(&arg));
#  define ATOMIC_SUB(arg, num) OSAtomicAdd64(-num, ATOMIC_CAST_WORD(&arg));
# else
#  define ATOMIC_CAST_WORD(arg) ((volatile int32_t*)(arg))

#  define ATOMIC_ADD(arg, num) OSAtomicAdd32(num, ATOMIC_CAST_WORD(&arg));
#  define ATOMIC_SUB(arg, num) OSAtomicAdd32(-num, ATOMIC_CAST_WORD(&arg));
# endif

#elif defined(_MSC_VER)

# if defined(_M_X64)
   extern "C" __int64 _InterlockedExchangeAdd64(__int64 volatile* addend, __int64 value);
#  pragma intrinsic (_InterlockedExchangeAdd64)
#  define ATOMIC_ADD(arg, num) ((void) _InterlockedExchangeAdd64(&(arg), (num)))
#  define ATOMIC_SUB(arg, num) ((void) _InterlockedExchangeAdd64(&(arg), -(num)))

# elif defined(_M_IX86)
   extern "C" long _InterlockedExchangeAdd(long volatile* addend, long value);
#  pragma intrinsic (_InterlockedExchangeAdd)
#  define ATOMIC_ADD(arg, num) ((void) _InterlockedExchangeAdd(&(arg), (num)))
#  define ATOMIC_SUB(arg, num) ((void) _InterlockedExchangeAdd(&(arg), -(num)))

# else
#  error Atomic operations are not supported on your platform

# endif

#else

# error Atomic operations are not supported on your platform

#endif

#endif /* _SRC_ATOMIC_H_ */
