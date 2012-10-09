/*
# Copyright (C) 2012 Jan C. Wynholds
# MIT license
# for both node_systemtap.d, node_systemtap.cc

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom 
the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included 
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

# 1. compiled in probes 
#     probes are handles (untyped pointers)
#     forward declared objs (dtrace_connection_t) are defined 
#     in node_systemtap.cc
# http_client_request ( int fd, string host, int port, int buffersize)
# http_client_response ( int fd, string host, int port, int buffersize)
# http_server_request 
# 2. write .stp scripts (node.stp and node_v8ustack.stp)
*/


provider node {
    probe http__client__request(int, string, int, int);
    probe http__client__response(int, string, int, int);
    probe http__server__request(int, string, int, int);
    probe http__server__response(int, string, int, int);
    probe net__server__connection(int, string, int, int);
    probe net__socket__read(int, string, int, int);
    probe net__socket__write(int, string, int, int);
    probe net__stream__end(int, string, int, int);
    probe gc__done();
    probe gc__start();
};
