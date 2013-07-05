#!/bin/sh

# Copyright (c) 2013, Ben Noordhuis <info@bnoordhuis.nl>
#
# Permission to use, copy, modify, and/or distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

TOPLEVELDIR=`dirname $0`

RPMBUILD_PATH="${RPMBUILD_PATH:-$HOME/rpmbuild}"
if [ ! -d "$RPMBUILD_PATH" ]; then
  echo "Run rpmdev-setuptree first."
  exit 1
fi

cd "$TOPLEVELDIR"

if [ $# -ge 1 ]; then
  VERSION=$1
else
  VERSION=`sed -nre 's/%define _version (.+)/\1/p' node.spec`
fi

set -ex
cp node.spec $RPMBUILD_PATH/SPECS/node.spec
tar --exclude-vcs --transform="s|^|node-${VERSION}/|" \
    -czf $RPMBUILD_PATH/SOURCES/node-v$VERSION.tar.gz .
rpmbuild $* -ba $RPMBUILD_PATH/SPECS/node.spec
