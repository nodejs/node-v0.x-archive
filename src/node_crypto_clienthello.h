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

#ifndef SRC_NODE_CRYPTO_CLIENTHELLO_H_
#define SRC_NODE_CRYPTO_CLIENTHELLO_H_

#include "node.h"

#include <stddef.h>  // size_t
#include <stdlib.h>  // NULL

namespace node {

class ClientHelloParser {
 public:
  ClientHelloParser() : state_(kEnded),
                        onhello_cb_(NULL),
                        onend_cb_(NULL),
                        cb_arg_(NULL) {
    Reset();
  }

  struct ClientHello {
    uint8_t session_size;
    uint8_t* session_id;
    bool has_ticket;
    uint8_t servername_size;
    uint8_t* servername;
  };

  typedef void (*OnHelloCb)(void* arg, const ClientHello& hello);
  typedef void (*OnEndCb)(void* arg);

  void Parse(uint8_t* data, size_t avail);

  inline void Reset();
  inline void Start(OnHelloCb onhello_cb, OnEndCb onend_cb, void* onend_arg);
  inline void End();
  inline bool IsPaused();
  inline bool IsEnded();

 private:
  static const size_t kMaxTLSFrameLen = 16 * 1024 + 5;

  enum ParseState {
    kWaiting,
    kTLSHeader,
    kSSL2Header,
    kPaused,
    kEnded
  };

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

  enum ExtensionType {
    kServerName = 0,
    kTLSSessionTicket = 35
  };

  bool ParseRecordHeader(uint8_t* data, size_t avail);
  void ParseHeader(uint8_t* data, size_t avail);
  void ParseExtension(ExtensionType type,
                      uint8_t* data,
                      size_t len);
  bool ParseTLSClientHello(uint8_t* data, size_t avail);
  bool ParseSSL2ClientHello(uint8_t* data, size_t avail);

  ParseState state_;
  OnHelloCb onhello_cb_;
  OnEndCb onend_cb_;
  void* cb_arg_;
  size_t frame_len_;
  size_t body_offset_;
  size_t extension_offset_;
  uint8_t session_size_;
  uint8_t* session_id_;
  uint16_t servername_size_;
  uint8_t* servername_;
  uint16_t tls_ticket_size_;
  uint8_t* tls_ticket_;
};

}  // namespace node

#endif  // SRC_NODE_CRYPTO_CLIENTHELLO_H_
