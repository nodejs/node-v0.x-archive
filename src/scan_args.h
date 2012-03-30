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

#ifndef SRC_PARSE_ARGS_H_
#define SRC_PARSE_ARGS_H_

#include "node.h"
#include "v8.h"

namespace node {

using namespace v8;
using namespace node;

template <typename T>
struct Convert{
  inline T operator()(const Local<Value>& v);
};

template<>
struct Convert<unsigned short>{
  inline unsigned short operator()(const Local<Value>& v) {
    return v->Uint32Value();
  }
};

template<>
struct Convert<unsigned int>{
  inline unsigned int operator()(const Local<Value>& v) {
    return v->Uint32Value();
  }
};

template<>
struct Convert<unsigned long>{
  inline unsigned long operator()(const Local<Value>& v) {
      return v->Uint32Value();
  }
};

template<>
struct Convert<unsigned long long>{
  inline unsigned long long operator()(const Local<Value>& v) {
      return v->Uint32Value();
  }
};

template<>
struct Convert<short>{
  inline short operator()(const Local<Value>& v) {
    return v->Int32Value();
  }
};

template<>
struct Convert<int>{
  inline int operator()(const Local<Value>& v) {
    return v->Int32Value();
  }
};

template<>
struct Convert<long int>{
  inline long int operator()(const Local<Value>& v) {
      return v->Int32Value();
  }
};

template<>
struct Convert<long long int>{
  inline long long int operator()(const Local<Value>& v) {
    return v->IntegerValue();
  }
};

template<>
struct Convert<bool>{
  inline bool operator()(const Local<Value>& v) {
    return v->BooleanValue();
  }
};

template<>
struct Convert<double>{
  inline double operator()(const Local<Value>& v) {
    return v->NumberValue();
  }
};

template<>
struct Convert<float>{
  inline float operator()(const Local<Value>& v) {
    return v->NumberValue();
  }
};

template<>
struct Convert<Local<Object> >{
  inline Local<Object> operator()(const Local<Value>& v) {
    return v->ToObject();
  }
};

template<>
struct Convert<Local<String> >{
  inline Local<String> operator()(const Local<Value>& v) {
    return v->ToString();
  }
};

template<>
struct Convert<void *>{
  inline void * operator()(const Local<Value>& v) {
    return NULL;
  }
};

static void * ignoreArg;

/**
*
* ScanArgs - Checks the Argument types according to format string and converts to native type 
* 
* Parameter type  and Converter Functions are like below
*
* short, int, long  - Int32Value()
* long long  - IntegerValue()
* unsigned short, unsigned int, unsigned long, unsigned long long -  Uint32Value()
* double, float - NumberValue()
* bool - BooleanValue()
* Local<String> -  ToString()
* Local<Object> - ToObject()
* ignoreArg - NULL
*
* We can force certain conversion by type casting
* for example to force int to Uint32Value
*   int a;
*   ScanArgs(args, 0, "d", (unsigned &) a);
*
* Format chars and Validating Functions
* 'd' - IsInt32()
* 'u' - IsUint32()
* 'n' - IsNumber()
* 'b' - IsBoolean()
* 'U' - IsUndefined()
* 'N' - IsNull()
* 'T' - IsTrue()
* 'F' - IsFalse()
* 'S' - IsString()
* 'X' - IsFunction()
* 'A' - IsArray()
* 'O' - IsObject()
*
* If an argument is an optional, format character should be followed by '?'
*
* Assuming Optional arguments are always at the end
*
* Arguments upto 9 are supported
*/

template<typename T0>
Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0) {
  char error[64] = {0};
  
  if (*format && index < args.Length()) {

    switch(*format) {

    case 'd':
    {
      if (!args[index]->IsInt32()) {
        snprintf(error, sizeof(error), "arg%d is not an Integer", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'u': 
    {
      if (!args[index]->IsUint32()) {
        snprintf(error, sizeof(error), "arg%d is not a Unsigned Integer", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'b':
    {
      if (!args[index]->IsBoolean()) {
        snprintf(error, sizeof(error), "arg%d is not a Boolean", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'n':
    {
      if (!args[index]->IsNumber()) {
        snprintf(error, sizeof(error), "arg%d is not a Number", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'U':
    {
      if (!args[index]->IsUndefined()) {
        snprintf(error, sizeof(error), "arg%d is not Undefined", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'N': 
    {
      if (!args[index]->IsNull()) {
        snprintf(error, sizeof(error), "arg%d is not NULL", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'T':
    {
      if (!args[index]->IsTrue()) {
        snprintf(error, sizeof(error), "arg%d is not True", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'F':
    {
      if (!args[index]->IsFalse()) {
        snprintf(error, sizeof(error), "arg%d is not False", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'S':
    {
      if (!args[index]->IsString()) {
        snprintf(error, sizeof(error), "arg%d is not a String", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'X':
    {
      if (!args[index]->IsFunction()) {
        snprintf(error, sizeof(error), "arg%d is not a Function", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'A':
    {
      if (!args[index]->IsArray()) {
        snprintf(error, sizeof(error), "arg%d is not an Array", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    case 'O': 
    {
      if (!args[index]->IsObject()) {
        snprintf(error, sizeof(error), "arg%d is not an Object", index);
        return ThrowException(Exception::TypeError(String::New(error)));
      }
    }  
    break;

    default:
      snprintf(error, sizeof(error), "%c is unspecified format option",*format);
      return ThrowException(Exception::TypeError(String::New(error)));
    break;
    }

    a0 =  Convert<T0>()(args[index]);

  }else {
    if(*format && *format != '?' && *(format + 1) != '?')
      return ThrowException(Exception::TypeError(String::New("Less number of arguments")));
  }

  return Null(); 
}

#define FUNC_BODY(...) \
  if (*format) { \
    Handle<Value> ret = ScanArgs(args, index, format, a0); \
    if (ret->IsNull()) {  \
      ret = ScanArgs(args, index + 1, *(format + 1) == '?' ? format + 2 : format + 1, __VA_ARGS__); \
    } \
    return ret; \ 
  }\
  return Null()

template<typename T0, typename T1>
inline Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0, T1& a1) {
  FUNC_BODY(a1);
}

template<typename T0, typename T1, typename T2>
inline Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0, T1& a1, T2& a2) {
  FUNC_BODY(a1, a2);
}

template<typename T0, typename T1, typename T2, typename T3>
inline Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0, T1& a1, T2& a2, T3& a3) {
  FUNC_BODY(a1, a2, a3);
}

template<typename T0, typename T1, typename T2, typename T3, typename T4>
inline Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0, T1& a1, T2& a2, T3& a3, T4& a4) {
  FUNC_BODY(a1, a2, a3, a4);
}

template<typename T0, typename T1, typename T2, typename T3, typename T4, typename T5>
inline Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0, T1& a1, T2& a2, T3& a3, T4& a4, T5& a5) {
  FUNC_BODY(a1, a2, a3, a4, a5);
}

template<typename T0, typename T1, typename T2, typename T3, typename T4, typename T5, typename T6>
inline Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0, T1& a1, T2& a2, T3& a3, T4& a4, T5& a5, T6& a6) {
  FUNC_BODY(a1, a2, a3, a4, a5, a6);
}

template<typename T0, typename T1, typename T2, typename T3, typename T4, typename T5, typename T6, typename T7>
inline Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0, T1& a1, T2& a2, T3& a3, T4& a4, T5& a5, T6& a6, T7& a7) {
  FUNC_BODY(a1, a2, a3, a4, a5, a6, a7);
}

template<typename T0, typename T1, typename T2, typename T3, typename T4, typename T5, typename T6, typename T7, typename T8>
inline Handle<Value> ScanArgs(const v8::Arguments &args, int index, const char *format, T0& a0, T1& a1, T2& a2, T3& a3, T4& a4, T5& a5, T6& a6, T7& a7, T8& a8) {
  FUNC_BODY(a1, a2, a3, a4, a5, a6, a7, a8);
}

#undef FUNC_BODY

}  // namespace node

#endif  // SRC_PARSE_ARGS_H_
