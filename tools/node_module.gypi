{
	'variables': {
		# These are required variables to make a proper node module build
		'library': 'shared_library', # This gypi file is about modules so everything is shared_library
		'target_arch': 'ia32', # The architecture is hardcoded because of a i386 harcoded element in the gyp make.py file 
		# Normaly we could read the target_arch from node itself (when it will be build with gyp).
		# MAC x64 will have to comment out all line in 
		# gyp\pylib\gyp\generator\make.py that contain append('-arch i386') (2 instances)
		# in order to make a proper 64 bit module
		'output_directory': 'build/Release', # The output dir resembles the old node-waf output in order to keep the old references
	},
	'target_defaults': {
		# Some default properties for all node modules
		'type': '<(library)',
		'product_extension':'node',
		'product_dir':'<(output_directory)',
		'product_prefix':'',# Remove the default lib prefix on each library

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
					# We need to use node's preferred "win32" rather than gyp's preferred "win"
					'PLATFORM="win32"',
				],
				# We need to link to the node.lib file
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
				'libraries': [ # This specifies this library on both the compiler and the linker 
					'-undefined dynamic_lookup',
				],
				# Based on gyp's documentation, the following should be enough but it seems 
				# it doesn't work.
				# 'link_settings': {
				#	'ldflags': [
				#		‘-undefined dynamic_lookup’,
				#	],
				# },
			}],
		],
	}
}