{
  'target_defaults': {
    'conditions': [
      ['OS != "win"', {
        'defines': [
          '_GNU_SOURCE',
        ],
        'conditions': [
          ['OS=="solaris"', {
            'cflags': ['-pthreads'],
            'ldlags': ['-pthreads'],
          }, {
            'cflags': ['-pthread'],
            'ldlags': ['-pthread'],
          }],
        ],
      }],
    ],
  },
  "targets": [
    {
      "target_name": "lring",
      "type": "<(library)",
      "include_dirs": [
        "include/",
        "src/"
      ],
      "sources": [
        "src/lring.c"
      ]
    }, {
      "target_name": "tests",
      "type": "executable",
      "dependencies": [ "lring" ],
      "include_dirs": [
        "include/",
        "test/"
      ],
      "sources": [
        "test/ring-test.c"
      ]
    }
  ]
}
