{
  'variables': {
	#These are required variables to make a proper node module build
	'library': 'shared_library', #This gypi file is about modules so everything is shared_library
	'target_arch': 'ia32', #The architecture is hardcoded because of a i386 harcoded element in the gyp make.py file 
	'output_directory': 'build/Release', #The output dir resembles the old node-waf output in order to keep the olde references
  },
		#Needed declarations for the target
		'target_name': '<(module_name)',
		'type': '<(library)',
	  'product_name':'<(module_name)',
	  'product_extension':'node',
	  'product_dir':'<(output_directory)',
      'product_prefix':'',#remove the default lib prefix on each library

      'defines': [
	    'ARCH="<(target_arch)"',
        'PLATFORM="<(OS)"',
		'_LARGEFILE_SOURCE',
		'_FILE_OFFSET_BITS=64',
      ],
	  
      'include_dirs': [
        '<(NODE_ROOT)/src',
        '<(NODE_ROOT)/deps/v8/include',
        '<(NODE_ROOT)/deps/uv/include',
      ],

      'conditions': [
        [ 'OS=="win"', {
          'defines': [
			'uint=unsigned int', #Windows doesn't have uint defined
			# we need to use node's preferred "win32" rather than gyp's preferred "win"
			'PLATFORM="win32"',
          ],
		  #we need to link to the node.lib file
          'libraries': [ '-l<(NODE_ROOT)/<(node_lib_folder)/node.lib' ],
		  'msvs_configuration_attributes': {
			'OutputDirectory': '<(output_directory)',
			'IntermediateDirectory': '<(output_directory)/obj',
		  },
		  'msvs-settings': {
			'VCLinkerTool': {
				'SubSystem': 3, # /subsystem:dll
			},
		  },
        }],
        [ 'OS=="mac"', {
		  'defines': [
			'uint=unsigned int', #Mac doesn't have uint either
          ],
		  #MAC x64 users don't forget to comment out all line in 
		  #gyp\pylib\gyp\generator\make.py that contain append('-arch i386') (2 instances)
		  'libraries': [ #this is a hack to specify this linker option in make              
			'-undefined dynamic_lookup',
		  ],
        }],
        [ 'OS=="linux"', {
          
        }]
      ],
}

