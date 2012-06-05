import glob
import os
import sys
from subprocess import call

cpplint = ['python', 'tools/cpplint.py']
excludes = [
	'src{0}{1}'.format(os.sep, 'node_extensions.h'),
	'src{0}{1}'.format(os.sep, 'node_root_certs.h'),
	'src{0}{1}'.format(os.sep, 'v8_typed_array.cc'),
	'src{0}{1}'.format(os.sep, 'v8_typed_array.h'),
	'src{0}{1}'.format(os.sep, 'v8abbr.h')
]

lintfiles = filter(lambda x: excludes.count(x) == 0,
	glob.glob("src/*.cc") + glob.glob("src/*.h") + glob.glob("src/*.c"))

run_args = [
	['--filter=-build/header_guard', 'src/node_extensions.h'],
	['--filter=-whitespace/line_length', 'src/node_root_certs.h'],
	['--filter=-legal/copyright',
		'src/v8_typed_array.cc',
		'src/v8_typed_array.h',
		'src/v8abbr.h'
	],
	lintfiles # no filters for the "regular" files
]

for args in run_args:
	exitcode = call(cpplint + args)
	if not exitcode == 0:
		break

sys.exit(exitcode)
