#!/usr/bin/env python
# Moved some utilities here from ../../configure

import urllib
import hashlib
import sys
import zipfile
import tarfile
import fpformat
import contextlib

def formatSize(amt):
    """Format a size as a string in MB"""
    return fpformat.fix(amt / 1024000., 1)

def spin(c):
    """print out an ASCII 'spinner' based on the value of counter 'c'"""
    spin = ".:|'"
    return (spin[c % len(spin)])

class ConfigOpener(urllib.FancyURLopener):
    """fancy opener used by retrievefile. Set a UA"""
    # append to existing version (UA)
    version = '%s node.js/configure' % urllib.URLopener.version

def reporthook(count, size, total):
    """internal hook used by retrievefile"""
    sys.stdout.write(' Fetch: %c %sMB total, %sMB downloaded   \r' %
                     (spin(count),
                      formatSize(total),
                      formatSize(count*size)))

def retrievefile(url, targetfile):
    """fetch file 'url' as 'targetfile'. Return targetfile or throw."""
    try:
        sys.stdout.write(' <%s>\nConnecting...\r' % url)
        sys.stdout.flush()
        msg = ConfigOpener().retrieve(url, targetfile, reporthook=reporthook)
        print ''  # clear the line
        return targetfile
    except:
        print ' ** Error occurred while downloading\n <%s>' % url
        raise

def md5sum(targetfile):
    """md5sum a file. Return the hex digest."""
    digest = hashlib.md5()
    with open(targetfile, 'rb') as f:
      chunk = f.read(1024)
      while chunk !=  "":
        digest.update(chunk)
        chunk = f.read(1024)
    return digest.hexdigest()

def unpack(packedfile, parent_path):
    """Unpacks packedfile into parent_path. Assumes .zip. Returns parent_path"""
    if zipfile.is_zipfile(packedfile):
        with contextlib.closing(zipfile.ZipFile(packedfile, 'r')) as icuzip:
            print ' Extracting zipfile: %s' % packedfile
            icuzip.extractall(parent_path)
            return parent_path
    elif tarfile.is_tarfile(packedfile):
        with tarfile.TarFile.open(packedfile, 'r') as icuzip:
            print ' Extracting tarfile: %s' % packedfile
            icuzip.extractall(parent_path)
            return parent_path
    else:
        packedsuffix = packedfile.lower().split('.')[-1]  # .zip, .tgz etc
        raise Exception('Error: Don\'t know how to unpack %s with extension %s' % (packedfile, packedsuffix))
