# This file is used by tools/js2c.py to preprocess the files in lib/

# Replace BUILDTYPE(x) with the current build type
# Note: x must be specified, but can be anything.
python macro BUILDTYPE(x) = repr(os.environ["BUILDTYPE"]);
