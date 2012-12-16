// Copyright 2012 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

#include "v8.h"
#include "frames.h"
#include "frames-inl.h" /* for architecture-specific frame constants */

using namespace v8::internal;

extern "C" {

#define V8DBG_STRUCT
#define V8DBG_INIT
#include "debug-support.h"

#ifdef V8DBG_STRUCT

#define MEMBER_INIT(type, name, value)      value,
#define FRAME_CONST_V                       MEMBER_INIT
struct v8dbg_struct v8dbg = {
    V8DBG_CONST_LIST(MEMBER_INIT)
    STACK_FRAME_TYPE_LIST(FRAME_CONST)
};
#undef FRAME_CONST_V
#undef MEMBER_INIT

#else

#ifdef V8DBG_ARRAY

#define MEMBER_INIT(type, name, value)      value,
#define FRAME_CONST_V                       MEMBER_INIT
int v8dbg[] = {
    V8DBG_CONST_LIST(MEMBER_INIT)
    STACK_FRAME_TYPE_LIST(FRAME_CONST)
};
#undef FRAME_CONST_V
#undef MEMBER_INIT

#else

#define GLOBAL_DEF(type, name, value)       type v8dbg_##name = value;
#define FRAME_CONST_V                       GLOBAL_DEF
V8DBG_CONST_LIST(GLOBAL_DEF)
STACK_FRAME_TYPE_LIST(FRAME_CONST)
#undef FRAME_CONST_V
#undef GLOBAL_DEF

#endif

#endif

#ifdef V8DBG_STRUCT
void __v8dbg_init(struct v8dbg_struct *v8dbg) {
  v8dbg->initialized = 1;
#else
#ifdef V8DBG_ARRAY
void __v8dbg_init(int *v8dbg) {
  v8dbg[v8dbg_initialized] = 1;
#endif
#endif
}

}
