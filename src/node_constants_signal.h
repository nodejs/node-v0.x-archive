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

#ifdef SIGHUP
NODE_DEFINE_CONSTANT(target, SIGHUP);
#endif

#ifdef SIGINT
NODE_DEFINE_CONSTANT(target, SIGINT);
#endif

#ifdef SIGQUIT
NODE_DEFINE_CONSTANT(target, SIGQUIT);
#endif

#ifdef SIGILL
NODE_DEFINE_CONSTANT(target, SIGILL);
#endif

#ifdef SIGTRAP
NODE_DEFINE_CONSTANT(target, SIGTRAP);
#endif

#ifdef SIGABRT
NODE_DEFINE_CONSTANT(target, SIGABRT);
#endif

#ifdef SIGIOT
NODE_DEFINE_CONSTANT(target, SIGIOT);
#endif

#ifdef SIGBUS
NODE_DEFINE_CONSTANT(target, SIGBUS);
#endif

#ifdef SIGFPE
NODE_DEFINE_CONSTANT(target, SIGFPE);
#endif

#ifdef SIGKILL
NODE_DEFINE_CONSTANT(target, SIGKILL);
#endif

#ifdef SIGUSR1
NODE_DEFINE_CONSTANT(target, SIGUSR1);
#endif

#ifdef SIGSEGV
NODE_DEFINE_CONSTANT(target, SIGSEGV);
#endif

#ifdef SIGUSR2
NODE_DEFINE_CONSTANT(target, SIGUSR2);
#endif

#ifdef SIGPIPE
NODE_DEFINE_CONSTANT(target, SIGPIPE);
#endif

#ifdef SIGALRM
NODE_DEFINE_CONSTANT(target, SIGALRM);
#endif

NODE_DEFINE_CONSTANT(target, SIGTERM);

#ifdef SIGCHLD
NODE_DEFINE_CONSTANT(target, SIGCHLD);
#endif

#ifdef SIGSTKFLT
NODE_DEFINE_CONSTANT(target, SIGSTKFLT);
#endif


#ifdef SIGCONT
NODE_DEFINE_CONSTANT(target, SIGCONT);
#endif

#ifdef SIGSTOP
NODE_DEFINE_CONSTANT(target, SIGSTOP);
#endif

#ifdef SIGTSTP
NODE_DEFINE_CONSTANT(target, SIGTSTP);
#endif

#ifdef SIGBREAK
NODE_DEFINE_CONSTANT(target, SIGBREAK);
#endif

#ifdef SIGTTIN
NODE_DEFINE_CONSTANT(target, SIGTTIN);
#endif

#ifdef SIGTTOU
NODE_DEFINE_CONSTANT(target, SIGTTOU);
#endif

#ifdef SIGURG
NODE_DEFINE_CONSTANT(target, SIGURG);
#endif

#ifdef SIGXCPU
NODE_DEFINE_CONSTANT(target, SIGXCPU);
#endif

#ifdef SIGXFSZ
NODE_DEFINE_CONSTANT(target, SIGXFSZ);
#endif

#ifdef SIGVTALRM
NODE_DEFINE_CONSTANT(target, SIGVTALRM);
#endif

#ifdef SIGPROF
NODE_DEFINE_CONSTANT(target, SIGPROF);
#endif

#ifdef SIGWINCH
NODE_DEFINE_CONSTANT(target, SIGWINCH);
#endif

#ifdef SIGIO
NODE_DEFINE_CONSTANT(target, SIGIO);
#endif

#ifdef SIGPOLL
NODE_DEFINE_CONSTANT(target, SIGPOLL);
#endif

#ifdef SIGLOST
NODE_DEFINE_CONSTANT(target, SIGLOST);
#endif

#ifdef SIGPWR
NODE_DEFINE_CONSTANT(target, SIGPWR);
#endif

#ifdef SIGSYS
NODE_DEFINE_CONSTANT(target, SIGSYS);
#endif

#ifdef SIGUNUSED
NODE_DEFINE_CONSTANT(target, SIGUNUSED);
#endif