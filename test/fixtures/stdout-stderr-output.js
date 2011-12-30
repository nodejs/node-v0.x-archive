process.stdout.write('hello stdout\n');
process.stderr.write('hello stderr\n');
process.exit(); // force exit here because it's being run as a fork

