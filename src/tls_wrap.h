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

#ifndef SRC_TLS_WRAP_H_
#define SRC_TLS_WRAP_H_

#include "node.h"
#include "node_crypto.h"  // SSLWrap

#include "async-wrap.h"
#include "env.h"
#include "queue.h"
#include "callback_wrap.h"
#include "stream_wrap.h"
#include "udp_wrap.h"
#include "v8.h"

#include <openssl/ssl.h>

namespace node {

// Forward-declarations
class NodeBIO;
class SendWrap;
class WriteWrap;
namespace crypto {
  class SecureContext;
}

class TLSCallbacks : public crypto::SSLWrap<TLSCallbacks>,
                     public WrapCallbacks,
                     public AsyncWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target,
                         v8::Handle<v8::Value> unused,
                         v8::Handle<v8::Context> context);

  int DoWrite(WriteWrap* w,
              uv_buf_t* bufs,
              size_t count,
              uv_stream_t* send_handle,
              uv_write_cb cb);
  void AfterWrite(WriteWrap* w);
  void DoAlloc(uv_handle_t* handle,
               size_t suggested_size,
               uv_buf_t* buf);
  void DoRecv(uv_udp_t* handle, 
			  ssize_t nread, 
			  const uv_buf_t* buf, 
			  const struct sockaddr* addr, 
			  unsigned int flags);
  int DoSend(SendWrap* s, 
	          uv_udp_t* handle, 
			  uv_buf_t* bufs, 
			  size_t count,
			  const struct sockaddr* addr,
			  uv_udp_send_cb cb);
  void DoRead(uv_stream_t* handle,
              ssize_t nread,
              const uv_buf_t* buf,
              uv_handle_type pending);
  int DoShutdown(ShutdownWrap* req_wrap, uv_shutdown_cb cb);

v8::Handle<v8::Object> Self();

 protected:
  static const int kClearOutChunkSize = 1024;

  // Write callback queue's item
  class WriteItem {
   public:
    WriteItem(WriteWrap* w, uv_write_cb cb) : w_(w), cb_(cb) {
    }
    ~WriteItem() {
      w_ = NULL;
      cb_ = NULL;
    }

    WriteWrap* w_;
    uv_write_cb cb_;
    QUEUE member_;
  };

  class SendItem {
   public:
    SendItem(SendWrap* s, uv_udp_send_cb cb) : s_(s), cb_(cb) {
    }
    ~SendItem() {
      s_ = NULL;
      cb_ = NULL;
    }

    SendWrap* s_;
    uv_udp_send_cb cb_;
    QUEUE member_;
  };

  union ExtraInfo {
    struct {
         const struct sockaddr* addr;
    };
  };

  TLSCallbacks(Environment* env,
               Kind kind,
               v8::Handle<v8::Object> sc,
               WrapCallbacks* old, bool isstream);
  ~TLSCallbacks();

  static void SSLInfoCallback(const SSL* ssl_, int where, int ret);
  void InitSSL();
  void EncOut(const ExtraInfo * extraInfo = NULL);
    
  static void EncOutStreamCb(uv_write_t* req, int status);
  static void EncOutHandleCb(uv_udp_send_t* req, int status);
  static void EncOutCb(TLSCallbacks* callbacks, int status);

  bool ClearIn(const ExtraInfo * extraInfo = NULL);
  void ClearOut(const ExtraInfo * extraInfo = NULL);
  void InvokeQueued(int status);

  inline void Cycle(const ExtraInfo * extraInfo = NULL) {
    ClearIn(extraInfo);
    ClearOut(extraInfo);
    EncOut(extraInfo);
  }

  v8::Local<v8::Value> GetSSLError(int status, int* err);
  static void OnClientHelloParseEnd(void* arg);

  static void Wrap(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Start(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetVerifyMode(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void EnableSessionCallbacks(
      const v8::FunctionCallbackInfo<v8::Value>& args);
  static void EnableHelloParser(
      const v8::FunctionCallbackInfo<v8::Value>& args);

#ifdef SSL_CTRL_SET_TLSEXT_SERVERNAME_CB
  static void GetServername(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetServername(const v8::FunctionCallbackInfo<v8::Value>& args);
  static int SelectSNIContextCallback(SSL* s, int* ad, void* arg);
#endif  // SSL_CTRL_SET_TLSEXT_SERVERNAME_CB

  crypto::SecureContext* sc_;
  v8::Persistent<v8::Object> sc_handle_;
  BIO* enc_in_;
  BIO* enc_out_;
  NodeBIO* clear_in_;
  uv_write_t write_req_;
  uv_udp_send_t send_req_;
  size_t write_size_;
  size_t write_queue_size_;
  QUEUE send_item_queue_;
  QUEUE write_item_queue_;
  WriteItem* pending_write_item_;
  bool started_;
  bool established_;
  bool shutdown_;
  bool isstream_;

#ifdef SSL_CTRL_SET_TLSEXT_SERVERNAME_CB
  v8::Persistent<v8::Value> sni_context_;
#endif  // SSL_CTRL_SET_TLSEXT_SERVERNAME_CB
};

}  // namespace node

#endif  // SRC_TLS_WRAP_H_
