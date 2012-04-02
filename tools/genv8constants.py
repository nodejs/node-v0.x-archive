#!/usr/bin/env python

#
# genv8constants.py output_file libv8_base.a
#
# Emits v8dbg constants stored in libv8_base.a in a format suitable for the V8
# ustack helper.
#

import re
import subprocess
import sys

if len(sys.argv) != 3:
  print "usage: objsym.py outfile libv8_base.a"
  sys.exit(2);

outfile = file(sys.argv[1], 'w');
pipe = subprocess.Popen([ 'objdump', '-z', '-D', sys.argv[2] ],
    stdout=subprocess.PIPE).stdout;
pattern = re.compile('00000000 <(v8dbg_.*)>:');
numpattern = re.compile('[0-9a-fA-F]{2}');

outfile.write("""
/*
 * File automatically generated by genv8constants. Do not edit.
 *
 * The following offsets are dynamically from libv8_base.a.  See src/v8ustack.d
 * for details on how these values are used.
 */

#ifndef V8_CONSTANTS_H
#define V8_CONSTANTS_H

#if defined(__i386)
""");

curr_sym = None;
curr_val = 0;
curr_octet = 0;

for line in pipe:
  if curr_sym != None:
    #
    # This bit of code has nasty knowledge of the objdump text output
    # format, but this is the most obvious robust approach.  We could almost
    # rely on looking at numbered fields, but some instructions look very
    # much like hex numbers (e.g., "adc"), and we don't want to risk picking
    # those up by mistake, so we look at character-based columns intead.
    #
    for i in range (0, 3):
      # 6-character margin, 2-characters + 1 space for each field
      idx = 6 + i * 3;
      octetstr = line[idx:idx+2]
      if not numpattern.match(octetstr):
        break;

      curr_val += int('0x%s' % octetstr, 16) << (curr_octet * 8);
      curr_octet += 1;

    if curr_octet < 4:
      continue;

    outfile.write("#define %s 0x%x\n" % (curr_sym.upper(), curr_val));
    curr_sym = None;
    curr_val = 0;
    curr_octet = 0;
    continue;

  match = pattern.match(line)
  if match == None:
    continue;

  curr_sym = match.group(1);

outfile.write("""
#else
#error "only i386 is supported for DTrace ustack helper"
#endif

#endif /* V8_CONSTANTS_H */
""");
