var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    options = fs.readFileSync(process.argv[2]).toString(),
    variables,
    cmd = process.argv[3];

if (cmd !== 'install' && cmd !== 'uninstall') {
  console.error('Unknown command: ' + cmd);
  process.exit(1);
}

// Parse options file and remove first comment line
options = JSON.parse(options.split('\n').slice(1).join(''));
variables = options.variables;

// Execution queue
var queue = [],
    dirs = [];

// Copy file from src to dst
function copy(src, dst, callback) {
  // If src is array - copy each file separately
  if (Array.isArray(src)) {
    src.forEach(function(src) {
      copy(src, dst, callback);
    });
    return;
  }

  dst = path.join(variables.node_prefix, dst);
  var dir = dst.replace(/\/[^\/]*$/, '/');

  console.log(dst, dir);

  // Create directory if hasn't done this yet
  if (dirs.indexOf(dir) === -1) {
    dirs.push(dir);
    queue.push('mkdir -p ' + dir);
  }

  // Queue file copy
  queue.push('cp -rf ' + src + ' ' + dst);
}

// Remove files
function remove(files) {
  files.forEach(function(file) {
    file = path.join(variables.node_prefix, file);
    queue.push('rm -rf ' + file);
  });
}

// Run every command in queue, one-by-one
function run() {
  var cmd = queue.shift();
  if (!cmd) return;

  console.log(cmd);
  exec(cmd, function(err, stdout, stderr) {
    if (stderr) console.error(stderr);
    if (err) process.exit(1);

    run();
  });
}

if (cmd === 'install') {
  // Copy includes
  copy([
    // Node
    'src/node.h', 'src/node_buffer.h', 'src/node_object_wrap.h',
    'src/node_version.h',
    // v8
    'deps/v8/include/*.h',
    // uv
    'deps/uv/include/*.h'
  ], 'include/node/');

  // Private uv headers
  copy('deps/uv/include/uv-private/*.h', 'include/node/uv-private/');
  copy([
    'deps/uv/include/ares.h',
    'deps/uv/include/ares_version.h'
  ], 'include/node/c-ares/');

  // Copy binary file
  copy('out/Release/node', 'bin/node');

  // Install npm (eventually)
  if (variables.node_install_npm) {
    copy('deps/npm', 'lib/node_modules/npm');
    if (process.platform === 'win32') {
      copy('deps/npm/bin/npm.cmd', 'bin/npm.cmd');
    } else {
      queue.push('ln -sF ../lib/node_modules/npm/bin/npm-cli.js ' +
                 path.join(variables.node_prefix, 'bin/npm'));
    }
  }
} else {
  remove([
     'bin/node', 'bin/npm', 'include/node/*', 'lib/node_modules'
  ]);
}

run();
