# google closure compiler
CLOSURE_COMPILER= 'java/closure-compiler.jar'

WHITESPACE_ONLY= 'WHITESPACE_ONLY'
SIMPLE_OPTIMIZATIONS= 'SIMPLE_OPTIMIZATIONS'
ADVANCED_OPTIMIZATIONS= 'ADVANCED_OPTIMIZATIONS'

CLOSURE_OPTIMIZATION= WHITESPACE_ONLY

# python porting of dean edward's javascript packer
PYTHON_JS_PACKER= 'python/jspacker.py'

# your packer choice
PACKER= CLOSURE_COMPILER

# settings
BROKE_BASE_PATH= '../broke/'
OUTPUT_FILE= '../dist/broke-server-0.1.min.js'

FILE_PATHS= (
	# todo
)

DEPENDENCIES_BASE_PATH= '../dependencies/'
DEPENDENCIES_PATHS= (
#	'json.js',
)
INCLUDE_DEPENDENCIES= False
