// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var assert = require('assert');

/*
 * The goal of this test is to make sure that:
 *
 * - Even if --abort-on-uncaught-exception is passed on the command line,
 * setting up a top-level domain error handler and throwing an error
 * within this domain does *not* make the process abort. The process exits
 * gracefully.
 *
 * - When passing --abort-on-uncaught-exception on the command line and
 * setting up a top-level domain error handler, an error thrown
 * within this domain's error handler *does* make the process abort.
 *
 * - When *not* passing --abort-on-uncaught-exception on the command line and
 * setting up a top-level domain error handler, an error thrown within this
 * domain's error handler does *not* make the process abort, but makes it exit
 * with the proper failure exit code.
 *
 * - When throwing an error within the top-level domain's error handler
 * within a try/catch block, the process should exit gracefully, whether or
 * not --abort-on-uncaught-exception is passed on the command line.
 */

var domainErrHandlerExMessage = 'exception from domain error handler';

if (process.argv[2] === 'child') {
  var domain = require('domain');
  var d = domain.create();
  var triggeredProcessUncaughtException = false;

  process.on('uncaughtException', function onUncaughtException() {
    process.send('triggeredProcessUncaughtEx');
  });

  d.on('error', function() {
    // Swallowing the error on purpose if 'throwInDomainErrHandler' is not
    // set
    if (process.argv.indexOf('throwInDomainErrHandler') !== -1) {
      if (process.argv.indexOf('useTryCatch') !== -1) {
        try {
          throw new Error(domainErrHandlerExMessage);
        } catch (e) {
        }
      } else {
        throw new Error(domainErrHandlerExMessage);
      }
    }
  });

  d.run(function doStuff() {
    process.nextTick(function () {
      throw new Error("You should NOT see me");
    });
  });
} else {
  var fork = require('child_process').fork;

  function testDomainExceptionHandling(cmdLineOption, options) {
    if (typeof cmdLineOption === 'object') {
      options = cmdLineOption;
      cmdLineOption = undefined;
    }

    var forkOptions;
    if (cmdLineOption) {
      forkOptions = { execArgv: [cmdLineOption] };
    }

    var throwInDomainErrHandlerOpt;
    if (options.throwInDomainErrHandler)
     throwInDomainErrHandlerOpt = 'throwInDomainErrHandler';

    var useTryCatchOpt;
    if (options.useTryCatch)
      useTryCatchOpt = 'useTryCatch';

    var child = fork(process.argv[1], [
                       'child',
                       throwInDomainErrHandlerOpt,
                       useTryCatchOpt
                     ],
                     forkOptions);

    if (child) {
      var childTriggeredOnUncaughtExceptionHandler = false;
      child.on('message', function onChildMsg(msg) {
        if (msg === 'triggeredProcessUncaughtEx') {
          childTriggeredOnUncaughtExceptionHandler = true;
        }
      });

      child.on('exit', function onChildExited(exitCode, signal) {
        // The process' uncaughtException event must not be emitted when
        // an error handler is setup on the top-level domain.
        assert(childTriggeredOnUncaughtExceptionHandler === false,
               "Process' uncaughtException should not be emitted when " +
               "an error handler is set on the top-level domain");

        // If the top-level domain's error handler does not throw,
        // the process must exit gracefully, whether or not
        // --abort-on-uncaught-exception was passed on the command line
        var expectedExitCode = 0;
        var expectedSignal = null;

        // When not throwing errors from the top-level domain error handler
        // or if throwing them within a try/catch block, the process
        // should exit gracefully
        if (!options.useTryCatch && options.throwInDomainErrHandler) {
          expectedExitCode = 7;
          if (cmdLineOption === '--abort-on-uncaught-exception') {
            // If the top-level domain's error handler throws, and only if
            // --abort-on-uncaught-exception is passed on the command line,
            // the process must abort.
            expectedExitCode = null;
            expectedSignal = 'SIGABRT';

            // On linux, v8 raises SIGTRAP when aborting because
            // the "debug break" flag is on by default
            if (process.platform === 'linux')
              expectedSignal = 'SIGTRAP';

            // On Windows, v8's OS::Abort also triggers a debug breakpoint
            // which makes the process exit with code -2147483645
            if (process.platform === 'win32') {
              expectedExitCode = -2147483645;
              expectedSignal = null;
            }
          }
        }

        assert.equal(exitCode, expectedExitCode);
        assert.equal(signal, expectedSignal);
      });
    }
  }

  testDomainExceptionHandling('--abort-on-uncaught-exception', {
                              throwInDomainErrHandler: false,
                              useTryCatch: false
                            });
  testDomainExceptionHandling('--abort-on-uncaught-exception', {
                              throwInDomainErrHandler: false,
                              useTryCatch: true
                            });

  testDomainExceptionHandling('--abort-on-uncaught-exception', {
                              throwInDomainErrHandler: true,
                              useTryCatch: false
                            });
  testDomainExceptionHandling('--abort-on-uncaught-exception', {
                              throwInDomainErrHandler: true,
                              useTryCatch: true
                            });

  testDomainExceptionHandling({
    throwInDomainErrHandler: false
  });
  testDomainExceptionHandling({
    throwInDomainErrHandler: false,
    useTryCatch: false
  });
  testDomainExceptionHandling({
    throwInDomainErrHandler: true,
    useTryCatch: true
  });
}
