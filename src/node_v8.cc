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
#include "env.h"
#include "env-inl.h"
#include "util.h"
#include "util-inl.h"
#include "v8.h"
#include "v8-profiler.h"

namespace node {

using v8::Context;
using v8::CpuProfile;
using v8::CpuProfileNode;
using v8::CpuProfiler;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::GCCallbackFlags;
using v8::GCType;
using v8::Handle;
using v8::HandleScope;
using v8::HeapGraphEdge;
using v8::HeapGraphNode;
using v8::HeapProfiler;
using v8::HeapSnapshot;
using v8::HeapStatistics;
using v8::Isolate;
using v8::Local;
using v8::Null;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Uint32;
using v8::Value;
using v8::kGCTypeAll;
using v8::kGCTypeMarkSweepCompact;
using v8::kGCTypeScavenge;


void Environment::IsolateData::BeforeGarbageCollection(Isolate* isolate,
                                                       GCType type,
                                                       GCCallbackFlags flags) {
  Get(isolate)->BeforeGarbageCollection(type, flags);
}


void Environment::IsolateData::AfterGarbageCollection(Isolate* isolate,
                                                      GCType type,
                                                      GCCallbackFlags flags) {
  Get(isolate)->AfterGarbageCollection(type, flags);
}


void Environment::IsolateData::BeforeGarbageCollection(GCType type,
                                                       GCCallbackFlags flags) {
  gc_info_before_ = GCInfo(isolate(), type, flags, uv_hrtime());
}


void Environment::IsolateData::AfterGarbageCollection(GCType type,
                                                      GCCallbackFlags flags) {
  gc_info_after_ = GCInfo(isolate(), type, flags, uv_hrtime());

  // The copy upfront and the remove-then-insert is to avoid corrupting the
  // list when the callback removes itself from it.  QUEUE_FOREACH() is unsafe
  // when the list is mutated while being walked.
  ASSERT(QUEUE_EMPTY(&gc_tracker_queue_) == false);
  QUEUE queue;
  QUEUE* q = QUEUE_HEAD(&gc_tracker_queue_);
  QUEUE_SPLIT(&gc_tracker_queue_, q, &queue);
  while (QUEUE_EMPTY(&queue) == false) {
    q = QUEUE_HEAD(&queue);
    QUEUE_REMOVE(q);
    QUEUE_INSERT_TAIL(&gc_tracker_queue_, q);
    Environment* env = CONTAINER_OF(q, Environment, gc_tracker_queue_);
    env->AfterGarbageCollectionCallback(&gc_info_before_, &gc_info_after_);
  }
}


void Environment::IsolateData::StartGarbageCollectionTracking(
    Environment* env) {
  if (QUEUE_EMPTY(&gc_tracker_queue_)) {
    isolate()->AddGCPrologueCallback(BeforeGarbageCollection, v8::kGCTypeAll);
    isolate()->AddGCEpilogueCallback(AfterGarbageCollection, v8::kGCTypeAll);
  }
  ASSERT(QUEUE_EMPTY(&env->gc_tracker_queue_) == true);
  QUEUE_INSERT_TAIL(&gc_tracker_queue_, &env->gc_tracker_queue_);
}


void Environment::IsolateData::StopGarbageCollectionTracking(Environment* env) {
  ASSERT(QUEUE_EMPTY(&env->gc_tracker_queue_) == false);
  QUEUE_REMOVE(&env->gc_tracker_queue_);
  QUEUE_INIT(&env->gc_tracker_queue_);
  if (QUEUE_EMPTY(&gc_tracker_queue_)) {
    isolate()->RemoveGCPrologueCallback(BeforeGarbageCollection);
    isolate()->RemoveGCEpilogueCallback(AfterGarbageCollection);
  }
}


void Environment::AfterGarbageCollectionCallback(const GCInfo* before,
                                                 const GCInfo* after) {
  HandleScope handle_scope(isolate());
  Context::Scope context_scope(context());
  Local<Value> argv[] = { Object::New(), Object::New() };
  const GCInfo* infov[] = { before, after };
  for (unsigned i = 0; i < ARRAY_SIZE(argv); i += 1) {
    Local<Object> obj = argv[i].As<Object>();
    const GCInfo* info = infov[i];
    switch (info->type()) {
      case kGCTypeScavenge:
        obj->Set(type_string(), scavenge_string());
        break;
      case kGCTypeMarkSweepCompact:
        obj->Set(type_string(), mark_sweep_compact_string());
        break;
      default:
        UNREACHABLE();
    }
    obj->Set(flags_string(), Uint32::NewFromUnsigned(info->flags(), isolate()));
    obj->Set(timestamp_string(), Number::New(isolate(), info->timestamp()));
#define V(name)                                                               \
    do {                                                                      \
      obj->Set(name ## _string(),                                             \
               Uint32::NewFromUnsigned(info->stats()->name(), isolate()));    \
    } while (0)
    V(total_heap_size);
    V(total_heap_size_executable);
    V(total_physical_size);
    V(used_heap_size);
    V(heap_size_limit);
#undef V
  }
  // The usage of process_object() here is a red herring, the callback is
  // bound to its own object in lib/prof.js.
  MakeCallback(this,
               Null(isolate()),
               gc_info_callback_function(),
               ARRAY_SIZE(argv),
               argv);
}


void Environment::StartGarbageCollectionTracking(Local<Function> callback) {
  ASSERT(gc_info_callback_function().IsEmpty() == true);
  set_gc_info_callback_function(callback);
  isolate_data()->StartGarbageCollectionTracking(this);
}


void Environment::StopGarbageCollectionTracking() {
  ASSERT(gc_info_callback_function().IsEmpty() == false);
  isolate_data()->StopGarbageCollectionTracking(this);
  set_gc_info_callback_function(Local<Function>());
}


void StartGarbageCollectionTracking(const FunctionCallbackInfo<Value>& args) {
  CHECK(args[0]->IsFunction() == true);
  HandleScope handle_scope(args.GetIsolate());
  Environment* env = Environment::GetCurrent(args.GetIsolate());
  env->StartGarbageCollectionTracking(args[0].As<Function>());
}


void GetHeapStatistics(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope handle_scope(isolate);
  Environment* env = Environment::GetCurrent(isolate);
  HeapStatistics s;
  isolate->GetHeapStatistics(&s);
  Local<Object> info = Object::New();
#define V(name)                                                               \
  info->Set(env->name ## _string(), Uint32::NewFromUnsigned(s.name(), isolate))
  V(total_heap_size);
  V(total_heap_size_executable);
  V(total_physical_size);
  V(used_heap_size);
  V(heap_size_limit);
#undef V
  args.GetReturnValue().Set(info);
}


void StopGarbageCollectionTracking(const FunctionCallbackInfo<Value>& args) {
  HandleScope handle_scope(args.GetIsolate());
  Environment::GetCurrent(args.GetIsolate())->StopGarbageCollectionTracking();
}


void CpuProfilerSetSamplingInterval(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope handle_scope(isolate);
  Environment* env = Environment::GetCurrent(isolate);
  if (env->cpu_profiler_active() == true) {
    return ThrowError("profiler already running");
  }
  isolate->GetCpuProfiler()->SetSamplingInterval(args[0]->Uint32Value());
}


void CpuProfilerStartCpuProfiling(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope handle_scope(isolate);
  Environment* env = Environment::GetCurrent(isolate);
  if (env->cpu_profiler_active() == true) {
    return ThrowError("profiler already running");
  }
  Local<String> title =
      args[0]->IsString() ? args[0].As<String>() : String::Empty(isolate);
  bool record_samples = args[1]->IsTrue();
  isolate->GetCpuProfiler()->StartCpuProfiling(title, record_samples);
  env->set_cpu_profiler_active(true);
}


void CpuProfilerStopCpuProfiling(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope handle_scope(isolate);
  Environment* env = Environment::GetCurrent(isolate);
  if (env->cpu_profiler_active() == false) {
    return ThrowError("profiler not running");
  }
  Local<String> title =
      args[0]->IsString() ? args[0].As<String>() : String::Empty(isolate);
  const CpuProfile* profile =
      isolate->GetCpuProfiler()->StopCpuProfiling(title);
  args.GetReturnValue().Set(profile->GetUid());
  env->set_cpu_profiler_active(false);
}


void CpuProfilerDeleteAllCpuProfiles(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope handle_scope(isolate);
  isolate->GetCpuProfiler()->DeleteAllCpuProfiles();
}


void CpuProfilerGetProfileCount(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope handle_scope(isolate);
  args.GetReturnValue().Set(isolate->GetCpuProfiler()->GetProfileCount());
}


inline const CpuProfile* FindCpuProfile(Isolate* isolate, int index) {
  CpuProfiler* profiler = isolate->GetCpuProfiler();
  if (index < 0 || index >= profiler->GetProfileCount()) {
    return NULL;
  }
  return profiler->GetCpuProfile(index);
}


inline const CpuProfileNode* FindCpuProfileNode(const CpuProfile* profile,
                                                int index) {
  if (index < 0 || index >= profile->GetSamplesCount()) {
    return NULL;
  }
  return profile->GetSample(index);
}


inline const CpuProfileNode* FindCpuProfileNode(Isolate* isolate,
                                                int profile_index,
                                                int sample_index) {
  const CpuProfile* profile = FindCpuProfile(isolate, profile_index);
  if (profile == NULL) {
    return NULL;
  }
  return FindCpuProfileNode(profile, sample_index);
}


inline const HeapSnapshot* FindHeapSnapshot(Isolate* isolate, int index) {
  HeapProfiler* profiler = isolate->GetHeapProfiler();
  if (index < 0 || index >= profiler->GetSnapshotCount()) {
    return NULL;
  }
  return profiler->GetHeapSnapshot(index);
}


inline const HeapGraphNode* FindHeapGraphNode(Isolate* isolate,
                                              int snapshot_index,
                                              int node_index) {
  const HeapSnapshot* snapshot = FindHeapSnapshot(isolate, snapshot_index);
  if (snapshot == NULL) {
    return NULL;
  }
  if (node_index < 0 || node_index >= snapshot->GetNodesCount()) {
    return NULL;
  }
  return snapshot->GetNode(node_index);
}


inline const HeapGraphEdge* FindHeapGraphEdge(Isolate* isolate,
                                              int snapshot_index,
                                              int node_index,
                                              int edge_index) {
  const HeapGraphNode* node =
      FindHeapGraphNode(isolate, snapshot_index, node_index);
  if (node == NULL) {
    return NULL;
  }
  if (edge_index < 0 || edge_index >= node->GetChildrenCount()) {
    return NULL;
  }
  return node->GetChild(edge_index);
}


template <typename Type>
const Type* Find(const FunctionCallbackInfo<Value>& args);


template <>
const CpuProfile* Find(const FunctionCallbackInfo<Value>& args) {
  return FindCpuProfile(args.GetIsolate(), args[0]->Int32Value());
}


template <>
const CpuProfileNode* Find(const FunctionCallbackInfo<Value>& args) {
  return FindCpuProfileNode(args.GetIsolate(),
                            args[0]->Int32Value(),
                            args[1]->Int32Value());
}


template <>
const HeapSnapshot* Find(const FunctionCallbackInfo<Value>& args) {
  return FindHeapSnapshot(args.GetIsolate(), args[0]->Int32Value());
}


template <>
const HeapGraphNode* Find(const FunctionCallbackInfo<Value>& args) {
  return FindHeapGraphNode(args.GetIsolate(),
                           args[0]->Int32Value(),
                           args[1]->Int32Value());
}


template <>
const HeapGraphEdge* Find(const FunctionCallbackInfo<Value>& args) {
  return FindHeapGraphEdge(args.GetIsolate(),
                           args[0]->Int32Value(),
                           args[1]->Int32Value(),
                           args[2]->Int32Value());
}


template <typename InType, typename OutType>
OutType Coerce(Isolate*, InType value) {
  return value;  // Identity function.
}


template <>
double Coerce(Isolate*, int64_t value) {
  return static_cast<double>(value);
}


template <>
Local<String> Coerce(Isolate* isolate, const char* string) {
  return String::NewFromUtf8(isolate, string);
}


template <>
int Coerce(Isolate*, const CpuProfileNode* node) {
  return node->GetNodeId();
}


template <>
int Coerce(Isolate*, const HeapGraphNode* node) {
  return node->GetId();
}


template <typename Type,
          typename MethodType,
          typename ReturnType,
          const Type* (*Find)(const FunctionCallbackInfo<Value>&),
          MethodType (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  HandleScope handle_scope(args.GetIsolate());
  if (const Type* obj = Find(args)) {
    args.GetReturnValue().Set(
        Coerce<MethodType, ReturnType>(isolate, (obj->*Method)()));
  } else {
    ThrowRangeError("index out of range");
  }
}


template <typename Type, int (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  Bind<Type, int, int, Find<Type>, Method>(args);
}


template <typename Type, unsigned (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  Bind<Type, unsigned, unsigned, Find<Type>, Method>(args);
}


// Only used for timestamps.  V8's profiler timestamps are measured in
// microseconds since the Epoch.  Doubles have 53 bits of precision so
// that should last us well into the second half of the 22nd century.
//
// If you, maintenance programmer from the far flung future, encounter this
// comment while tracking down a bug caused by my assumption, know that I'm
// sorry.
//
// If the Rapture of the Nerds has come to pass and we've all been uploaded
// in the Introdus, ping me and I'll buy you the 22nd century equivalent of
// a beer to make it up.  Brace yourself for plenty of "back in my day"
// stories though!
template <typename Type, int64_t (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  Bind<Type, int64_t, double, Find<Type>, Method>(args);
}


template <typename Type, const char* (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  Bind<Type, const char*, Local<String>, Find<Type>, Method>(args);
}


template <typename Type, Handle<String> (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  Bind<Type, Handle<String>, Handle<String>, Find<Type>, Method>(args);
}


template <typename Type, Handle<Value> (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  Bind<Type, Handle<Value>, Handle<Value>, Find<Type>, Method>(args);
}


template <typename Type, const CpuProfileNode* (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  Bind<Type, const CpuProfileNode*, int, Find<Type>, Method>(args);
}


template <typename Type, const HeapGraphNode* (Type::*Method)() const>
void Bind(const FunctionCallbackInfo<Value>& args) {
  Bind<Type, const HeapGraphNode*, int, Find<Type>, Method>(args);
}


void CpuProfileNodeGetChild(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope handle_scope(isolate);
  const CpuProfileNode* node = FindCpuProfileNode(isolate,
                                                  args[0]->Int32Value(),
                                                  args[1]->Int32Value());
  if (node != NULL) {
    int child_index = args[2]->Int32Value();
    if (child_index >= 0 && child_index < node->GetChildrenCount()) {
      args.GetReturnValue().Set(node->GetChild(child_index)->GetNodeId());
      return;
    }
  }
  ThrowRangeError("index out of range");
}


void HeapProfilerTakeHeapSnapshot(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope handle_scope(isolate);
  Local<String> title =
      args[0]->IsString() ? args[0].As<String>() : String::Empty(isolate);
  const HeapSnapshot* snapshot =
      isolate->GetHeapProfiler()->TakeHeapSnapshot(title);
  args.GetReturnValue().Set(snapshot->GetUid());
}


void InitializeV8Bindings(Handle<Object> target,
                          Handle<Value> unused,
                          Handle<Context> context) {
  NODE_SET_METHOD(target,
                  "startGarbageCollectionTracking",
                  StartGarbageCollectionTracking);
  NODE_SET_METHOD(target,
                  "stopGarbageCollectionTracking",
                  StopGarbageCollectionTracking);
  NODE_SET_METHOD(target, "getHeapStatistics", GetHeapStatistics);
  NODE_SET_METHOD(target,
                  "CpuProfilerSetSamplingInterval",
                  CpuProfilerSetSamplingInterval);
  NODE_SET_METHOD(target,
                  "CpuProfilerStartCpuProfiling",
                  CpuProfilerStartCpuProfiling);
  NODE_SET_METHOD(target,
                  "CpuProfilerStopCpuProfiling",
                  CpuProfilerStopCpuProfiling);
  NODE_SET_METHOD(target,
                  "CpuProfilerDeleteAllCpuProfiles",
                  CpuProfilerDeleteAllCpuProfiles);
  NODE_SET_METHOD(target,
                  "CpuProfilerGetProfileCount",
                  CpuProfilerGetProfileCount);
#define V(Type, Method)                                                       \
  NODE_SET_METHOD(target, #Type #Method, Bind<Type, &Type::Method>)
  V(CpuProfile, GetTitle);
  V(CpuProfile, GetTopDownRoot);
  V(CpuProfile, GetSamplesCount);
  V(CpuProfile, GetStartTime);
  V(CpuProfile, GetEndTime);
  V(CpuProfileNode, GetFunctionName);
  V(CpuProfileNode, GetScriptId);
  V(CpuProfileNode, GetScriptResourceName);
  V(CpuProfileNode, GetLineNumber);
  V(CpuProfileNode, GetColumnNumber);
  V(CpuProfileNode, GetBailoutReason);
  V(CpuProfileNode, GetHitCount);
  V(CpuProfileNode, GetCallUid);
  V(CpuProfileNode, GetChildrenCount);
  V(HeapSnapshot, GetTitle);
  V(HeapSnapshot, GetRoot);
  V(HeapSnapshot, GetNodesCount);
  V(HeapSnapshot, GetMaxSnapshotJSObjectId);
  V(HeapGraphNode, GetName);
  V(HeapGraphNode, GetId);
  V(HeapGraphNode, GetSelfSize);
  V(HeapGraphNode, GetChildrenCount);
  V(HeapGraphNode, GetHeapValue);
#undef V
  NODE_SET_METHOD(target, "CpuProfileNodeGetChild", CpuProfileNodeGetChild);
  NODE_SET_METHOD(target,
                  "HeapProfilerTakeHeapSnapshot",
                  HeapProfilerTakeHeapSnapshot);
}

}  // namespace node

NODE_MODULE_CONTEXT_AWARE(node_v8, node::InitializeV8Bindings)
