{
  'targets': [
    {
      'target_name': 'node_debug_agent',
      'type': '<(library)',
      'dependencies': [
        '../v8/tools/gyp/v8.gyp:v8',
      ],
      'include_dirs': [
        '../v8',
      ],
      'sources': [
        'socket.h',
        'socket.cc',
        'debug-agent.h',
        'debug-agent.cc',
        'debug-agent-inl.h',
        'debug-agent-inl.cc',
      ]
    }
  ],
}
