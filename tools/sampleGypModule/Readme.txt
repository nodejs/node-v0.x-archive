Define a system variable named NODE_ROOT to point to your node folder, the one that contains the src, deps and Release of Debug folder. The script will verify that the requested files do exist.

On windows run:
../node-gyp make
On linux run:
../node-gyp && make

To test your new module run:
node test.js