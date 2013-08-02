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

#include "node_crypto_clienthello.h"
#include "node_crypto_clienthello-inl.h"
#include "node_buffer.h"  // Buffer

namespace node {

void ClientHelloParser::Parse(unsigned char* data, size_t avail) {
  switch (state_) {
    case kWaiting:
      // >= 5 bytes for header parsing
      if (avail < 5)
        break;

      if (data[0] == kChangeCipherSpec ||
          data[0] == kAlert ||
          data[0] == kHandshake ||
          data[0] == kApplicationData) {
        frame_len_ = (data[3] << 8) + data[4];
        state_ = kTLSHeader;
        body_offset_ = 5;
      } else {
        frame_len_ = (data[0] << 8) + data[1];
        state_ = kSSLHeader;
        if (*data & 0x40) {
          // header with padding
          body_offset_ = 3;
        } else {
          // without padding
          body_offset_ = 2;
        }
      }

      // Sanity check (too big frame, or too small)
      // Let OpenSSL handle it
      if (frame_len_ >= kMaxTLSFrameLen)
        return End();

      // Fall through
    case kTLSHeader:
    case kSSLHeader:
      // >= 5 + frame size bytes for frame parsing
      if (avail < body_offset_ + frame_len_)
        break;

      // Skip unsupported frames and gather some data from frame

      // TODO(indutny): Check protocol version
      if (data[body_offset_] == kClientHello) {
        found_hello_ = true;
        uint8_t* body;
        size_t session_offset;

        if (state_ == kTLSHeader) {
          // Skip frame header, hello header, protocol version and random data
          session_offset = body_offset_ + 4 + 2 + 32;

          if (session_offset + 1 < avail) {
            body = data + session_offset;
            session_size_ = *body;
            session_id_ = body + 1;
          }

          size_t cipher_offset = session_offset + 1 + session_size_;

          // Session OOB failure
          if (cipher_offset + 1 >= avail)
            return End();

          uint16_t cipher_len =
              (data[cipher_offset] << 8) + data[cipher_offset + 1];
          size_t comp_offset = cipher_offset + 2 + cipher_len;

          // Cipher OOB failure
          if (comp_offset >= avail)
            return End();

          uint8_t comp_len = data[comp_offset];
          size_t extension_offset = comp_offset + 1 + comp_len;

          // Compression OOB failure
          if (extension_offset > avail)
            return End();

          // Extensions present
          if (extension_offset != avail) {
            size_t ext_off = extension_offset + 2;

            // Parse known extensions
            while (ext_off < avail) {
              // Extension OOB
              if (avail - ext_off < 4)
                return End();

              uint16_t ext_type = (data[ext_off] << 8) + data[ext_off + 1];
              uint16_t ext_len = (data[ext_off + 2] << 8) + data[ext_off + 3];

              // Extension OOB
              if (ext_off + ext_len + 4 > avail)
                return End();

              ext_off += 4;

              // TLS Session Ticket
              if (ext_type == 35) {
                tls_ticket_size_ = ext_len;
                tls_ticket_ = data + ext_off;
              }

              ext_off += ext_len;
            }

            // Extensions OOB failure
            if (ext_off > avail)
              return End();
          }
        } else if (state_ == kSSLHeader) {
          // Skip header, version
          session_offset = body_offset_ + 3;

          if (session_offset + 4 < avail) {
            body = data + session_offset;

            int ciphers_size = (body[0] << 8) + body[1];

            if (body + 4 + ciphers_size < data + avail) {
              session_size_ = (body[2] << 8) + body[3];
              session_id_ = body + 4 + ciphers_size;
            }
          }
        } else {
          // Whoa? How did we get here?
          abort();
        }

        // Check if we overflowed (do not reply with any private data)
        if (session_id_ == NULL ||
            session_size_ > 32 ||
            session_id_ + session_size_ > data + avail) {
          return End();
        }

        // TODO(indutny): Parse other things?
      }

      // Not client hello - let OpenSSL handle it
      if (!found_hello_)
        return End();

      state_ = kPaused;
      ClientHello hello;
      hello.session_id = session_id_;
      hello.session_size = session_size_;
      hello.has_ticket = tls_ticket_ != NULL && tls_ticket_size_ != 0;
      onhello_cb_(cb_arg_, hello);
      break;
    case kEnded:
      // WTF? Meh...
    default:
      break;
  }
}

}  // namespace node
