{
  'variables': {
    'module_name': 'helloworld',#Specify the module name here
	#you may override the variables found in node_module.gypi here or through command line
  },
  'targets': [
    {
		# Needed declarations for the target
		'target_name': '<(module_name)',
		'product_name':'<(module_name)',
		# Source files
		'sources': [ #Specify your source files here
			'HelloWorld.cpp',
		],
		
    },
  ] # end targets
}

