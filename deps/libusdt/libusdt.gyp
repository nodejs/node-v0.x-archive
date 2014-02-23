{
  'targets': [
    {
      'target_name': 'libusdt',
      'type': 'static_library',
      'sources': [
        'usdt.h',
        'usdt.c',
        'usdt_dof.c',
        'usdt_dof_file.c',
        'usdt_dof_sections.c',
        'usdt_probe.c',
      ],
      'conditions': [
        [ '"<(target_arch)"=="ia32"', {
          'sources': [ 'usdt_tracepoints_i386.s' ],
          }, {
          'sources': [ 'usdt_tracepoints_x86_64.s' ],
          },
        ],
      ],
    },
  ],
}
