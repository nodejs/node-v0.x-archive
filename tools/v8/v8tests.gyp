{
  'targets': [
    {
      'target_name': 'v8-build-deps',
      'type': 'none',
      'conditions': [
        [
          'with_v8_tests==1',
          {
            'actions': [
              {
                'action_name': 'fetch-v8-dep-gtest',
                'inputs': [],
                'outputs': ['../../deps/v8/testing/gtest'],
                'action': [
                  'svn', 'checkout', '--force',
                  'http://googletest.googlecode.com/svn/trunk/',
                  '../../deps/v8/testing/gtest', '--revision', '692'
                ]
              },
              {
                'action_name': 'fetch-v8-dep-gmock',
                'inputs': [],
                'outputs': ['../../deps/v8/testing/gmock'],
                'action': [
                  'svn', 'checkout', '--force',
                  'http://googlemock.googlecode.com/svn/trunk/',
                  '../../deps/v8/testing/gmock', '--revision', '485'
                ]
              }
            ]
          }
        ]
      ]
    },
    {
      'target_name': 'd8-tests',
      'type': 'none',
      'conditions': [
        [
          'with_v8_tests==1',
          {
            # 'sources': [
            #   '../../deps/v8/include/v8.h',
            #   '../../deps/v8/include/v8-debug.h'
            # ],
            # 'sources!': [
            #   '../../deps/v8/test/cctest/test-utils.cc'
            # ],
            'dependencies': [
              'v8-build-deps',
              #'../../node.gyp:node',
              '../../deps/v8/src/d8.gyp:d8',
              '../../deps/v8/testing/gtest.gyp:*',
              '../../deps/v8/testing/gmock.gyp:*',
              '../../deps/v8/test/base-unittests/base-unittests.gyp:*',
              '../../deps/v8/test/compiler-unittests/compiler-unittests.gyp:*',
              'cctest.gyp:*'
            ],
          }
        ]
      ]
    }
  ]
}
