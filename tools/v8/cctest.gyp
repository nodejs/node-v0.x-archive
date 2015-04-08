# Copyright 2012 the V8 project authors. All rights reserved.
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
#
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above
#       copyright notice, this list of conditions and the following
#       disclaimer in the documentation and/or other materials provided
#       with the distribution.
#     * Neither the name of Google Inc. nor the names of its
#       contributors may be used to endorse or promote products derived
#       from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

{
  'variables': {
    'v8_code': 1,
    'generated_file': '<(SHARED_INTERMEDIATE_DIR)/resources.cc',
  },
  'includes': ['../../deps/v8/build/toolchain.gypi', '../../deps/v8/build/features.gypi'],
  'targets': [
    {
      'target_name': 'cctest',
      'type': 'executable',
      'dependencies': [
        'resources',
        '../../deps/v8/tools/gyp/v8.gyp:v8_libplatform',
      ],
      'include_dirs': [
        '../../deps/v8/',
      ],
      'sources': [  ### gcmole(all) ###
        '<(generated_file)',
        '../../deps/v8/test/cctest/compiler/codegen-tester.cc',
        '../../deps/v8/test/cctest/compiler/codegen-tester.h',
        '../../deps/v8/test/cctest/compiler/function-tester.h',
        '../../deps/v8/test/cctest/compiler/graph-builder-tester.cc',
        '../../deps/v8/test/cctest/compiler/graph-builder-tester.h',
        '../../deps/v8/test/cctest/compiler/graph-tester.h',
        '../../deps/v8/test/cctest/compiler/simplified-graph-builder.cc',
        '../../deps/v8/test/cctest/compiler/simplified-graph-builder.h',
        '../../deps/v8/test/cctest/compiler/test-branch-combine.cc',
        '../../deps/v8/test/cctest/compiler/test-changes-lowering.cc',
        '../../deps/v8/test/cctest/compiler/test-codegen-deopt.cc',
        '../../deps/v8/test/cctest/compiler/test-gap-resolver.cc',
        '../../deps/v8/test/cctest/compiler/test-graph-reducer.cc',
        '../../deps/v8/test/cctest/compiler/test-instruction-selector.cc',
        '../../deps/v8/test/cctest/compiler/test-instruction.cc',
        '../../deps/v8/test/cctest/compiler/test-js-context-specialization.cc',
        '../../deps/v8/test/cctest/compiler/test-js-constant-cache.cc',
        '../../deps/v8/test/cctest/compiler/test-js-typed-lowering.cc',
        '../../deps/v8/test/cctest/compiler/test-linkage.cc',
        '../../deps/v8/test/cctest/compiler/test-machine-operator-reducer.cc',
        '../../deps/v8/test/cctest/compiler/test-node-algorithm.cc',
        '../../deps/v8/test/cctest/compiler/test-node-cache.cc',
        '../../deps/v8/test/cctest/compiler/test-node.cc',
        '../../deps/v8/test/cctest/compiler/test-operator.cc',
        '../../deps/v8/test/cctest/compiler/test-phi-reducer.cc',
        '../../deps/v8/test/cctest/compiler/test-pipeline.cc',
        '../../deps/v8/test/cctest/compiler/test-representation-change.cc',
        '../../deps/v8/test/cctest/compiler/test-run-deopt.cc',
        '../../deps/v8/test/cctest/compiler/test-run-intrinsics.cc',
        '../../deps/v8/test/cctest/compiler/test-run-jsbranches.cc',
        '../../deps/v8/test/cctest/compiler/test-run-jscalls.cc',
        '../../deps/v8/test/cctest/compiler/test-run-jsexceptions.cc',
        '../../deps/v8/test/cctest/compiler/test-run-jsops.cc',
        '../../deps/v8/test/cctest/compiler/test-run-machops.cc',
        '../../deps/v8/test/cctest/compiler/test-run-variables.cc',
        '../../deps/v8/test/cctest/compiler/test-schedule.cc',
        '../../deps/v8/test/cctest/compiler/test-scheduler.cc',
        '../../deps/v8/test/cctest/compiler/test-simplified-lowering.cc',
        '../../deps/v8/test/cctest/compiler/test-structured-ifbuilder-fuzzer.cc',
        '../../deps/v8/test/cctest/compiler/test-structured-machine-assembler.cc',
        '../../deps/v8/test/cctest/cctest.cc',
        '../../deps/v8/test/cctest/gay-fixed.cc',
        '../../deps/v8/test/cctest/gay-precision.cc',
        '../../deps/v8/test/cctest/gay-shortest.cc',
        '../../deps/v8/test/cctest/print-extension.cc',
        '../../deps/v8/test/cctest/profiler-extension.cc',
        '../../deps/v8/test/cctest/test-accessors.cc',
        '../../deps/v8/test/cctest/test-alloc.cc',
        '../../deps/v8/test/cctest/test-api.cc',
        '../../deps/v8/test/cctest/test-ast.cc',
        '../../deps/v8/test/cctest/test-atomicops.cc',
        '../../deps/v8/test/cctest/test-bignum.cc',
        '../../deps/v8/test/cctest/test-bignum-dtoa.cc',
        '../../deps/v8/test/cctest/test-checks.cc',
        '../../deps/v8/test/cctest/test-circular-queue.cc',
        '../../deps/v8/test/cctest/test-compiler.cc',
        '../../deps/v8/test/cctest/test-constantpool.cc',
        '../../deps/v8/test/cctest/test-conversions.cc',
        '../../deps/v8/test/cctest/test-cpu-profiler.cc',
        '../../deps/v8/test/cctest/test-dataflow.cc',
        '../../deps/v8/test/cctest/test-date.cc',
        '../../deps/v8/test/cctest/test-debug.cc',
        '../../deps/v8/test/cctest/test-declarative-accessors.cc',
        '../../deps/v8/test/cctest/test-decls.cc',
        '../../deps/v8/test/cctest/test-deoptimization.cc',
        '../../deps/v8/test/cctest/test-dictionary.cc',
        '../../deps/v8/test/cctest/test-diy-fp.cc',
        '../../deps/v8/test/cctest/test-double.cc',
        '../../deps/v8/test/cctest/test-dtoa.cc',
        '../../deps/v8/test/cctest/test-fast-dtoa.cc',
        '../../deps/v8/test/cctest/test-fixed-dtoa.cc',
        '../../deps/v8/test/cctest/test-flags.cc',
        '../../deps/v8/test/cctest/test-func-name-inference.cc',
        '../../deps/v8/test/cctest/test-gc-tracer.cc',
        '../../deps/v8/test/cctest/test-global-handles.cc',
        '../../deps/v8/test/cctest/test-global-object.cc',
        '../../deps/v8/test/cctest/test-hashing.cc',
        '../../deps/v8/test/cctest/test-hashmap.cc',
        '../../deps/v8/test/cctest/test-heap.cc',
        '../../deps/v8/test/cctest/test-heap-profiler.cc',
        '../../deps/v8/test/cctest/test-hydrogen-types.cc',
        '../../deps/v8/test/cctest/test-libplatform-default-platform.cc',
        '../../deps/v8/test/cctest/test-libplatform-task-queue.cc',
        '../../deps/v8/test/cctest/test-libplatform-worker-thread.cc',
        '../../deps/v8/test/cctest/test-list.cc',
        '../../deps/v8/test/cctest/test-liveedit.cc',
        '../../deps/v8/test/cctest/test-lockers.cc',
        '../../deps/v8/test/cctest/test-log.cc',
        '../../deps/v8/test/cctest/test-microtask-delivery.cc',
        '../../deps/v8/test/cctest/test-mark-compact.cc',
        '../../deps/v8/test/cctest/test-mementos.cc',
        '../../deps/v8/test/cctest/test-object-observe.cc',
        '../../deps/v8/test/cctest/test-ordered-hash-table.cc',
        '../../deps/v8/test/cctest/test-ostreams.cc',
        '../../deps/v8/test/cctest/test-parsing.cc',
        '../../deps/v8/test/cctest/test-platform.cc',
        '../../deps/v8/test/cctest/test-profile-generator.cc',
        '../../deps/v8/test/cctest/test-random-number-generator.cc',
        '../../deps/v8/test/cctest/test-regexp.cc',
        '../../deps/v8/test/cctest/test-reloc-info.cc',
        '../../deps/v8/test/cctest/test-representation.cc',
        '../../deps/v8/test/cctest/test-semaphore.cc',
        '../../deps/v8/test/cctest/test-serialize.cc',
        '../../deps/v8/test/cctest/test-spaces.cc',
        '../../deps/v8/test/cctest/test-strings.cc',
        '../../deps/v8/test/cctest/test-symbols.cc',
        '../../deps/v8/test/cctest/test-strtod.cc',
        '../../deps/v8/test/cctest/test-thread-termination.cc',
        '../../deps/v8/test/cctest/test-threads.cc',
        '../../deps/v8/test/cctest/test-types.cc',
        '../../deps/v8/test/cctest/test-unbound-queue.cc',
        '../../deps/v8/test/cctest/test-unique.cc',
        '../../deps/v8/test/cctest/test-unscopables-hidden-prototype.cc',
        #'../../deps/v8/test/cctest/test-utils.cc',
        '../../deps/v8/test/cctest/test-version.cc',
        '../../deps/v8/test/cctest/test-weakmaps.cc',
        '../../deps/v8/test/cctest/test-weaksets.cc',
        '../../deps/v8/test/cctest/test-weaktypedarrays.cc',
        '../../deps/v8/test/cctest/trace-extension.cc'
      ],
      'conditions': [
        ['v8_target_arch=="ia32"', {
          'sources': [  ### gcmole(arch:ia32) ###
            '../../deps/v8/test/cctest/compiler/test-instruction-selector-ia32.cc',
            '../../deps/v8/test/cctest/test-assembler-ia32.cc',
            '../../deps/v8/test/cctest/test-code-stubs.cc',
            '../../deps/v8/test/cctest/test-code-stubs-ia32.cc',
            '../../deps/v8/test/cctest/test-disasm-ia32.cc',
            '../../deps/v8/test/cctest/test-macro-assembler-ia32.cc',
            '../../deps/v8/test/cctest/test-log-stack-tracer.cc'
          ],
        }],
        ['v8_target_arch=="x64"', {
          'sources': [  ### gcmole(arch:x64) ###
            '../../deps/v8/test/cctest/test-assembler-x64.cc',
            '../../deps/v8/test/cctest/test-code-stubs.cc',
            '../../deps/v8/test/cctest/test-code-stubs-x64.cc',
            '../../deps/v8/test/cctest/test-disasm-x64.cc',
            '../../deps/v8/test/cctest/test-macro-assembler-x64.cc',
            '../../deps/v8/test/cctest/test-log-stack-tracer.cc'
          ],
        }],
        ['v8_target_arch=="arm"', {
          'sources': [  ### gcmole(arch:arm) ###
            '../../deps/v8/test/cctest/compiler/test-instruction-selector-arm.cc',
            '../../deps/v8/test/cctest/test-assembler-arm.cc',
            '../../deps/v8/test/cctest/test-code-stubs.cc',
            '../../deps/v8/test/cctest/test-code-stubs-arm.cc',
            '../../deps/v8/test/cctest/test-disasm-arm.cc',
            '../../deps/v8/test/cctest/test-macro-assembler-arm.cc'
          ],
        }],
        ['v8_target_arch=="arm64"', {
          'sources': [  ### gcmole(arch:arm64) ###
            '../../deps/v8/test/cctest/test-utils-arm64.cc',
            '../../deps/v8/test/cctest/test-assembler-arm64.cc',
            '../../deps/v8/test/cctest/test-code-stubs.cc',
            '../../deps/v8/test/cctest/test-code-stubs-arm64.cc',
            '../../deps/v8/test/cctest/test-disasm-arm64.cc',
            '../../deps/v8/test/cctest/test-fuzz-arm64.cc',
            '../../deps/v8/test/cctest/test-javascript-arm64.cc',
            '../../deps/v8/test/cctest/test-js-arm64-variables.cc'
          ],
        }],
        ['v8_target_arch=="mipsel"', {
          'sources': [  ### gcmole(arch:mipsel) ###
            '../../deps/v8/test/cctest/test-assembler-mips.cc',
            '../../deps/v8/test/cctest/test-code-stubs.cc',
            '../../deps/v8/test/cctest/test-code-stubs-mips.cc',
            '../../deps/v8/test/cctest/test-disasm-mips.cc',
            '../../deps/v8/test/cctest/test-macro-assembler-mips.cc'
          ],
        }],
        ['v8_target_arch=="mips64el"', {
          'sources': [
            '../../deps/v8/test/cctest/test-assembler-mips64.cc',
            '../../deps/v8/test/cctest/test-code-stubs.cc',
            '../../deps/v8/test/cctest/test-code-stubs-mips64.cc',
            '../../deps/v8/test/cctest/test-disasm-mips64.cc',
            '../../deps/v8/test/cctest/test-macro-assembler-mips64.cc'
          ],
        }],
        ['v8_target_arch=="x87"', {
          'sources': [  ### gcmole(arch:x87) ###
            '../../deps/v8/test/cctest/test-assembler-x87.cc',
            '../../deps/v8/test/cctest/test-code-stubs.cc',
            '../../deps/v8/test/cctest/test-code-stubs-x87.cc',
            '../../deps/v8/test/cctest/test-disasm-x87.cc',
            '../../deps/v8/test/cctest/test-macro-assembler-x87.cc',
            '../../deps/v8/test/cctest/test-log-stack-tracer.cc'
          ],
        }],
        [ 'OS=="linux" or OS=="qnx"', {
          'sources': [
            '../../deps/v8/test/cctest/test-platform-linux.cc',
          ],
        }],
        [ 'OS=="win"', {
          'sources': [
            '../../deps/v8/test/cctest/test-platform-win32.cc',
          ],
          'msvs_settings': {
            'VCCLCompilerTool': {
              # MSVS wants this for gay-{precision,shortest}.cc.
              'AdditionalOptions': ['/bigobj'],
            },
          },
        }],
        ['component=="shared_library"', {
          # cctest can't be built against a shared library, so we need to
          # depend on the underlying static target in that case.
          'conditions': [
            ['v8_use_snapshot=="true"', {
              'dependencies': ['../../deps/v8/tools/gyp/v8.gyp:v8_snapshot'],
            },
            {
              'dependencies': [
                '../../deps/v8/tools/gyp/v8.gyp:v8_nosnapshot',
              ],
            }],
          ],
        }, {
          'dependencies': ['../../deps/v8/tools/gyp/v8.gyp:v8'],
        }],
      ],
    },
    {
      'target_name': 'resources',
      'type': 'none',
      'variables': {
        'file_list': [
           '../../deps/v8/tools/splaytree.js',
           '../../deps/v8/tools/codemap.js',
           '../../deps/v8/tools/csvparser.js',
           '../../deps/v8/tools/consarray.js',
           '../../deps/v8/tools/profile.js',
           '../../deps/v8/tools/profile_view.js',
           '../../deps/v8/tools/logreader.js',
           '../../deps/v8/test/cctest/log-eq-of-logging-and-traversal.js',
        ],
      },
      'actions': [
        {
          'action_name': 'js2c',
          'inputs': [
            '../../deps/v8/tools/js2c.py',
            '<@(file_list)',
          ],
          'outputs': [
            '<(generated_file)',
          ],
          'action': [
            'python',
            '../../deps/v8/tools/js2c.py',
            '<@(_outputs)',
            'TEST',  # type
            'off',  # compression
            '<@(file_list)',
          ],
        }
      ],
    },
  ],
}
