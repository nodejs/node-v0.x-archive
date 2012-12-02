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

#ifndef SRC_NODE_CRYPTO_H_
#define SRC_NODE_CRYPTO_H_

#include "node.h"

#include "node_object_wrap.h"
#include "v8.h"

#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/evp.h>
#include <openssl/pem.h>
#include <openssl/x509.h>
#include <openssl/x509v3.h>
#include <openssl/hmac.h>
#include <openssl/rand.h>
#include <openssl/pkcs12.h>

#ifdef OPENSSL_NPN_NEGOTIATED
#include "node_buffer.h"
#endif

#define EVP_F_EVP_DECRYPTFINAL 101


namespace node {
namespace crypto {

static X509_STORE* root_cert_store;

// Forward declaration
class Connection;

class SecureContext : ObjectWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

  SSL_CTX* ctx_;
  X509_STORE* ca_store_;

 protected:
  static const int kMaxSessionSize = 10 * 1024;

  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> Init(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetKey(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetCert(const v8::Arguments& args);
  static v8::Handle<v8::Value> AddCACert(const v8::Arguments& args);
  static v8::Handle<v8::Value> AddCRL(const v8::Arguments& args);
  static v8::Handle<v8::Value> AddRootCerts(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetCiphers(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetOptions(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetSessionIdContext(const v8::Arguments& args);
  static v8::Handle<v8::Value> Close(const v8::Arguments& args);
  static v8::Handle<v8::Value> LoadPKCS12(const v8::Arguments& args);

  static SSL_SESSION* GetSessionCallback(SSL* s,
                                         unsigned char* key,
                                         int len,
                                         int* copy);
  static int NewSessionCallback(SSL* s, SSL_SESSION* sess);

  SecureContext() : ObjectWrap() {
    ctx_ = NULL;
    ca_store_ = NULL;
  }

  void FreeCTXMem() {
    if (ctx_) {
      if (ctx_->cert_store == root_cert_store) {
        // SSL_CTX_free() will attempt to free the cert_store as well.
        // Since we want our root_cert_store to stay around forever
        // we just clear the field. Hopefully OpenSSL will not modify this
        // struct in future versions.
        ctx_->cert_store = NULL;
      }
      SSL_CTX_free(ctx_);
      ctx_ = NULL;
      // No need to free ca_store_, SSL_CTX_free() does it
      ca_store_ = NULL;
    } else {
      assert(ca_store_ == NULL);
    }
  }

  ~SecureContext() {
    FreeCTXMem();
  }

 private:
};

class ClientHelloParser {
 public:
  enum FrameType {
    kChangeCipherSpec = 20,
    kAlert = 21,
    kHandshake = 22,
    kApplicationData = 23,
    kOther = 255
  };

  enum HandshakeType {
    kClientHello = 1
  };

  enum ParseState {
    kWaiting,
    kTLSHeader,
    kSSLHeader,
    kPaused,
    kEnded
  };

  explicit ClientHelloParser(Connection* c) : conn_(c),
                                              state_(kWaiting),
                                              offset_(0),
                                              body_offset_(0),
                                              written_(0) {
  }

  size_t Write(const uint8_t* data, size_t len);
  void Finish();

  inline bool ended() { return state_ == kEnded; }

 private:
  Connection* conn_;
  ParseState state_;
  size_t frame_len_;

  uint8_t data_[18432];
  size_t offset_;
  size_t body_offset_;
  size_t written_;
};

class Connection : ObjectWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

#ifdef OPENSSL_NPN_NEGOTIATED
  v8::Persistent<v8::Object> npnProtos_;
  v8::Persistent<v8::Value> selectedNPNProto_;
#endif

#ifdef SSL_CTRL_SET_TLSEXT_SERVERNAME_CB
  v8::Persistent<v8::Object> sniObject_;
  v8::Persistent<v8::Value> sniContext_;
  v8::Persistent<v8::String> servername_;
#endif

 protected:
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> EncIn(const v8::Arguments& args);
  static v8::Handle<v8::Value> ClearOut(const v8::Arguments& args);
  static v8::Handle<v8::Value> ClearPending(const v8::Arguments& args);
  static v8::Handle<v8::Value> EncPending(const v8::Arguments& args);
  static v8::Handle<v8::Value> EncOut(const v8::Arguments& args);
  static v8::Handle<v8::Value> ClearIn(const v8::Arguments& args);
  static v8::Handle<v8::Value> GetPeerCertificate(const v8::Arguments& args);
  static v8::Handle<v8::Value> GetSession(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetSession(const v8::Arguments& args);
  static v8::Handle<v8::Value> LoadSession(const v8::Arguments& args);
  static v8::Handle<v8::Value> IsSessionReused(const v8::Arguments& args);
  static v8::Handle<v8::Value> IsInitFinished(const v8::Arguments& args);
  static v8::Handle<v8::Value> VerifyError(const v8::Arguments& args);
  static v8::Handle<v8::Value> GetCurrentCipher(const v8::Arguments& args);
  static v8::Handle<v8::Value> Shutdown(const v8::Arguments& args);
  static v8::Handle<v8::Value> ReceivedShutdown(const v8::Arguments& args);
  static v8::Handle<v8::Value> Start(const v8::Arguments& args);
  static v8::Handle<v8::Value> Close(const v8::Arguments& args);

#ifdef OPENSSL_NPN_NEGOTIATED
  // NPN
  static v8::Handle<v8::Value> GetNegotiatedProto(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetNPNProtocols(const v8::Arguments& args);
  static int AdvertiseNextProtoCallback_(SSL* s,
                                         const unsigned char** data,
                                         unsigned int* len,
                                         void* arg);
  static int SelectNextProtoCallback_(SSL* s,
                                      unsigned char** out,
                                      unsigned char* outlen,
                                      const unsigned char* in,
                                      unsigned int inlen, void* arg);
#endif

#ifdef SSL_CTRL_SET_TLSEXT_SERVERNAME_CB
  // SNI
  static v8::Handle<v8::Value> GetServername(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetSNICallback(const v8::Arguments& args);
  static int SelectSNIContextCallback_(SSL* s, int* ad, void* arg);
#endif

  int HandleBIOError(BIO* bio, const char* func, int rv);

  enum ZeroStatus {
    kZeroIsNotAnError,
    kZeroIsAnError
  };

  int HandleSSLError(const char* func, int rv, ZeroStatus zs);

  void ClearError();
  void SetShutdownFlags();

  static Connection* Unwrap(const v8::Arguments& args) {
    Connection* ss = ObjectWrap::Unwrap<Connection>(args.Holder());
    ss->ClearError();
    return ss;
  }

  Connection() : ObjectWrap(), hello_parser_(this) {
    bio_read_ = bio_write_ = NULL;
    ssl_ = NULL;
    next_sess_ = NULL;
  }

  ~Connection() {
    if (ssl_ != NULL) {
      SSL_free(ssl_);
      ssl_ = NULL;
    }

    if (next_sess_ != NULL) {
      SSL_SESSION_free(next_sess_);
      next_sess_ = NULL;
    }

#ifdef OPENSSL_NPN_NEGOTIATED
    if (!npnProtos_.IsEmpty()) npnProtos_.Dispose();
    if (!selectedNPNProto_.IsEmpty()) selectedNPNProto_.Dispose();
#endif

#ifdef SSL_CTRL_SET_TLSEXT_SERVERNAME_CB
    if (!sniObject_.IsEmpty()) sniObject_.Dispose();
    if (!sniContext_.IsEmpty()) sniContext_.Dispose();
    if (!servername_.IsEmpty()) servername_.Dispose();
#endif
  }

 private:
  static void SSLInfoCallback(const SSL* ssl, int where, int ret);

  BIO* bio_read_;
  BIO* bio_write_;
  SSL* ssl_;

  ClientHelloParser hello_parser_;

  bool is_server_; /* coverity[member_decl] */
  SSL_SESSION* next_sess_;

  friend class ClientHelloParser;
  friend class SecureContext;
};

enum CipherType {
  kCipher,
  kDecipher
};

template <CipherType Type>
class CipherBase : public ObjectWrap {
 public:
  CipherBase() : cipher_(NULL), initialized_(false) {
  }

  ~CipherBase() {
    if (!initialized_) return;
    EVP_CIPHER_CTX_cleanup(&ctx_);
  }

  bool Init(char* cipherType, char* key_buf, int key_buf_len);
  bool InitIv(char* cipherType,
              char* key,
              int key_len,
              char* iv,
              int iv_len);
  int SetAutoPadding(bool auto_padding);
  int Update(char* data, int len, unsigned char** out, int* out_len);
  int Final(unsigned char** out, int* out_len);

 protected:
  static v8::Handle<v8::Value> Init(const v8::Arguments& args);
  static v8::Handle<v8::Value> InitIv(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetAutoPadding(const v8::Arguments& args);
  static v8::Handle<v8::Value> Update(const v8::Arguments& args);
  static v8::Handle<v8::Value> Final(const v8::Arguments& args);

  EVP_CIPHER_CTX ctx_; /* coverity[member_decl] */
  const EVP_CIPHER* cipher_; /* coverity[member_decl] */
  bool initialized_;
};

class Cipher : public CipherBase<kCipher> {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

 protected:
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
};

class Decipher : public CipherBase<kDecipher> {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

 protected:
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
};

class Hmac : public ObjectWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

  bool Init(char* hashType, char* key, int key_len);
  int Update(char* data, int len);
  int Digest(unsigned char** md_value, unsigned int* md_len);

 protected:
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> Init(const v8::Arguments& args);
  static v8::Handle<v8::Value> Update(const v8::Arguments& args);
  static v8::Handle<v8::Value> Digest(const v8::Arguments& args);

  Hmac() : ObjectWrap(), initialized_(false) {
  }

  ~Hmac() {
    if (!initialized_) return;
    HMAC_CTX_cleanup(&ctx);
  }

 private:
  HMAC_CTX ctx; /* coverity[member_decl] */
  const EVP_MD* md; /* coverity[member_decl] */
  bool initialized_;
};

class Hash : public ObjectWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

  bool Init(const char* hashType);
  int Update(char* data, int len);

 protected:
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> Update(const v8::Arguments& args);
  static v8::Handle<v8::Value> Digest(const v8::Arguments& args);

  Hash() : ObjectWrap(), initialized_(false) {
  }

  ~Hash() {
    if (!initialized_) return;
    EVP_MD_CTX_cleanup(&mdctx);
  }

 private:
  EVP_MD_CTX mdctx; /* coverity[member_decl] */
  const EVP_MD* md; /* coverity[member_decl] */
  bool initialized_;
};

class Sign : public ObjectWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

  bool Init(const char* signType);
  int Update(char* data, int len);

  int Final(unsigned char** md_value,
                unsigned int* md_len,
                char* key_pem,
                int key_pemLen);

 protected:
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> Init(const v8::Arguments& args);
  static v8::Handle<v8::Value> Update(const v8::Arguments& args);
  static v8::Handle<v8::Value> Final(const v8::Arguments& args);

  Sign() : ObjectWrap(), initialized_(false) {
  }

  ~Sign() {
    if (!initialized_) return;
    EVP_MD_CTX_cleanup(&mdctx);
  }

 private:
  EVP_MD_CTX mdctx; /* coverity[member_decl] */
  const EVP_MD* md; /* coverity[member_decl] */
  bool initialized_;
};

class Verify : public ObjectWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

  bool Init(const char* verifyType);
  int Update(char* data, int len);
  int Final(char* key_pem,
                  int key_pemLen,
                  unsigned char* sig,
                  int siglen);

 protected:
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> Init(const v8::Arguments& args);
  static v8::Handle<v8::Value> Update(const v8::Arguments& args);
  static v8::Handle<v8::Value> Final(const v8::Arguments& args);

  Verify() : ObjectWrap(), initialized_(false) {
  }

  ~Verify() {
    if (!initialized_) return;
    EVP_MD_CTX_cleanup(&mdctx);
  }

 private:
  EVP_MD_CTX mdctx; /* coverity[member_decl] */
  const EVP_MD* md; /* coverity[member_decl] */
  bool initialized_;
};


class DiffieHellman : public ObjectWrap {
 public:
  static void Initialize(v8::Handle<v8::Object> target);

  bool Init(int primeLength);
  bool Init(unsigned char* p, int p_len);
  bool Init(unsigned char* p, int p_len, unsigned char* g, int g_len);

 protected:
  static v8::Handle<v8::Value> DiffieHellmanGroup(const v8::Arguments& args);
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> GenerateKeys(const v8::Arguments& args);
  static v8::Handle<v8::Value> GetPrime(const v8::Arguments& args);
  static v8::Handle<v8::Value> GetGenerator(const v8::Arguments& args);
  static v8::Handle<v8::Value> GetPublicKey(const v8::Arguments& args);
  static v8::Handle<v8::Value> GetPrivateKey(const v8::Arguments& args);
  static v8::Handle<v8::Value> ComputeSecret(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetPublicKey(const v8::Arguments& args);
  static v8::Handle<v8::Value> SetPrivateKey(const v8::Arguments& args);

  DiffieHellman() : ObjectWrap(), initialized_(false), dh(NULL) {
  }

  ~DiffieHellman() {
    if (dh != NULL) {
      DH_free(dh);
    }
  }

 private:
  bool VerifyContext();

  bool initialized_;
  DH* dh;
};

void InitCrypto(v8::Handle<v8::Object> target);

}  // namespace crypto
}  // namespace node

#endif  // SRC_NODE_CRYPTO_H_
