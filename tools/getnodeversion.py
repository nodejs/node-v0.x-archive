import os,re, sys

node_version_h = os.path.join(os.path.dirname(__file__), '..', 'src',
    'node_version.h')

f = open(node_version_h)

tag = None
no_tag = '--no-tag' in sys.argv
output_stability = '--stability' in sys.argv
output_tag = '--tag' in sys.argv
msi_mode = '--msi' in sys.argv

for line in f:
  if re.match('#define NODE_MAJOR_VERSION', line):
    major = line.split()[2]
  if re.match('#define NODE_MINOR_VERSION', line):
    minor = line.split()[2]
  if re.match('#define NODE_PATCH_VERSION', line):
    patch = line.split()[2]

  if not no_tag:
    tag_match = re.match('#define NODE_TAG (.*)', line)
    if tag_match:
      tag = tag_match.group(1)

def get_version_string(major, minor, patch, tag, msi=False, no_tag=False):
  version_string = '%(major)s.%(minor)s.%(patch)s'% locals()
  if tag:
    if msi:
      rc_number_match = re.match('.*(\d+)$', tag)
      if rc_number_match and rc_number_match.group(1):
        rc_number = rc_number_match.group(1)
        version_string += '.%(rc_number)s'% locals()
      else:
        sys.stderr.write('Could not determine proper rc number for msi ' +
                         'version, exiting')
        sys.exit(1)
    else:
      version_string += '-%(tag)s'% locals()

  return version_string


if output_stability:
  if int(minor) % 2 == 0:
    print 'stable'
  else:
    print 'unstable'
elif output_tag:
  if tag:
      print tag
else:
  print get_version_string(major,
                           minor,
                           patch,
                           tag,
                           msi=msi_mode,
                           no_tag=no_tag)
