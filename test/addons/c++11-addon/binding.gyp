{ 'targets':
  [ { 'target_name': 'binding'
    , 'sources': ['binding.cc']
    , 'cflags': ['-std=c++11']
    , 'conditions':
      [ [ 'OS=="mac"',
          { 'xcode_settings':
            { 'OTHER_CPLUSPLUSFLAGS' : ['-std=c++11', '-stdlib=libc++']
            , 'MACOSX_DEPLOYMENT_TARGET': '10.7'
            }
          }
        ]
      ]
    }
  ]
}
