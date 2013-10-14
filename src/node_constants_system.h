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

// file access modes
NODE_DEFINE_CONSTANT(target, O_RDONLY);
NODE_DEFINE_CONSTANT(target, O_WRONLY);
NODE_DEFINE_CONSTANT(target, O_RDWR);

NODE_DEFINE_CONSTANT(target, S_IFMT);
NODE_DEFINE_CONSTANT(target, S_IFREG);
NODE_DEFINE_CONSTANT(target, S_IFDIR);
NODE_DEFINE_CONSTANT(target, S_IFCHR);
#ifdef S_IFBLK
NODE_DEFINE_CONSTANT(target, S_IFBLK);
#endif

#ifdef S_IFIFO
NODE_DEFINE_CONSTANT(target, S_IFIFO);
#endif

#ifdef S_IFLNK
NODE_DEFINE_CONSTANT(target, S_IFLNK);
#endif

#ifdef S_IFSOCK
NODE_DEFINE_CONSTANT(target, S_IFSOCK);
#endif

#ifdef O_CREAT
NODE_DEFINE_CONSTANT(target, O_CREAT);
#endif

#ifdef O_EXCL
NODE_DEFINE_CONSTANT(target, O_EXCL);
#endif

#ifdef O_NOCTTY
NODE_DEFINE_CONSTANT(target, O_NOCTTY);
#endif

#ifdef O_TRUNC
NODE_DEFINE_CONSTANT(target, O_TRUNC);
#endif

#ifdef O_APPEND
NODE_DEFINE_CONSTANT(target, O_APPEND);
#endif

#ifdef O_DIRECTORY
NODE_DEFINE_CONSTANT(target, O_DIRECTORY);
#endif

#ifdef O_EXCL
NODE_DEFINE_CONSTANT(target, O_EXCL);
#endif

#ifdef O_NOFOLLOW
NODE_DEFINE_CONSTANT(target, O_NOFOLLOW);
#endif

#ifdef O_SYNC
NODE_DEFINE_CONSTANT(target, O_SYNC);
#endif

#ifdef O_SYMLINK
NODE_DEFINE_CONSTANT(target, O_SYMLINK);
#endif

#ifdef O_DIRECT
NODE_DEFINE_CONSTANT(target, O_DIRECT);
#endif

#ifdef S_IRWXU
NODE_DEFINE_CONSTANT(target, S_IRWXU);
#endif

#ifdef S_IRUSR
NODE_DEFINE_CONSTANT(target, S_IRUSR);
#endif

#ifdef S_IWUSR
NODE_DEFINE_CONSTANT(target, S_IWUSR);
#endif

#ifdef S_IXUSR
NODE_DEFINE_CONSTANT(target, S_IXUSR);
#endif

#ifdef S_IRWXG
NODE_DEFINE_CONSTANT(target, S_IRWXG);
#endif

#ifdef S_IRGRP
NODE_DEFINE_CONSTANT(target, S_IRGRP);
#endif

#ifdef S_IWGRP
NODE_DEFINE_CONSTANT(target, S_IWGRP);
#endif

#ifdef S_IXGRP
NODE_DEFINE_CONSTANT(target, S_IXGRP);
#endif

#ifdef S_IRWXO
NODE_DEFINE_CONSTANT(target, S_IRWXO);
#endif

#ifdef S_IROTH
NODE_DEFINE_CONSTANT(target, S_IROTH);
#endif

#ifdef S_IWOTH
NODE_DEFINE_CONSTANT(target, S_IWOTH);
#endif

#ifdef S_IXOTH
NODE_DEFINE_CONSTANT(target, S_IXOTH);
#endif