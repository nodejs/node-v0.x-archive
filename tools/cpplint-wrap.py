import glob
import os
import sys
from subprocess import call

def buildFilterList(filters=[]):
  # globally disable all warnings about includes
  globalfilter = ['--filter=-build/include']
  if not type(filters) is list:
    filters = [filters]
  return ','.join(globalfilter + filters)

cpplint = ['python', 'tools/cpplint.py']
excludes = [
  'src{0}{1}'.format(os.sep, 'eio-emul.h'),
  'src{0}{1}'.format(os.sep, 'ngx-queue.h'),
  'src{0}{1}'.format(os.sep, 'node_constants.cc'),
  'src{0}{1}'.format(os.sep, 'node_win32_etw_provider-inl.h'),
  'src{0}{1}'.format(os.sep, 'node_extensions.h'),
  'src{0}{1}'.format(os.sep, 'node_io_watcher.cc'),
  'src{0}{1}'.format(os.sep, 'node_io_watcher.h'),
  'src{0}{1}'.format(os.sep, 'node_root_certs.h'),
  'src{0}{1}'.format(os.sep, 'node_signal_watcher.cc'),
  'src{0}{1}'.format(os.sep, 'node_signal_watcher.h'),
  'src{0}{1}'.format(os.sep, 'node_stat_watcher.cc'),
  'src{0}{1}'.format(os.sep, 'node_stat_watcher.h'),
  'src{0}{1}'.format(os.sep, 'v8_typed_array.cc'),
  'src{0}{1}'.format(os.sep, 'v8_typed_array.h'),
  'src{0}{1}'.format(os.sep, 'v8abbr.h')
]

lintfiles = filter(lambda x: excludes.count(x) == 0,
  glob.glob("src/*.cc") + glob.glob("src/*.h") + glob.glob("src/*.c"))

run_args = [
  [buildFilterList('-whitespace/line_length,-whitespace/comma'), 'src/eio-emul.h'],
  [buildFilterList('-readability/fn_size'), 'src/node_constants.cc'],
  [buildFilterList('-runtime/sizeof'), 'src/node_win32_etw_provider-inl.h'],
  [buildFilterList('-build/header_guard'), 'src/node_extensions.h'],
  [buildFilterList('-whitespace/line_length'), 'src/node_root_certs.h'],
  [buildFilterList('-legal/copyright'),
    'src/v8_typed_array.cc',
    'src/v8_typed_array.h',
    'src/v8abbr.h'
  ],
  [buildFilterList()] + lintfiles  # list concatenation
]

for args in run_args:
  exitcode = call(cpplint + args)
  if not exitcode == 0:
    break

sys.exit(exitcode)
