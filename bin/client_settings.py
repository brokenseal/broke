# google closure compiler
CLOSURE_COMPILER= 'java/closure-compiler.jar'

WHITESPACE_ONLY= 'WHITESPACE_ONLY'
SIMPLE_OPTIMIZATIONS= 'SIMPLE_OPTIMIZATIONS'
ADVANCED_OPTIMIZATIONS= 'ADVANCED_OPTIMIZATIONS'

CLOSURE_OPTIMIZATION= WHITESPACE_ONLY

# python porting of dean edward's javascript packer
PYTHON_JS_PACKER= 'python/jspacker.py'

# your packer choice
PACKER= PYTHON_JS_PACKER

# settings
BROKE_BASE_PATH= '../broke/'
OUTPUT_FILE= '../dist/broke-client-0.1.pack.js'

FILE_PATHS= (
	'broke-0.1.js',
	
	# conf
	'conf/settings.js',
	
	#core
	'core/class.js',
	'core/exceptions.js',
	'core/i18n.js',
	'core/urlresolvers.js',
	'core/utils.js',
	'core/events.js',
	'core/utils.js',
	'core/context_processors.js',
	
	# db
	'db/models.js',
	'db/fields.js',
	
	# forms
	'forms/models.js',
	'forms/fields.js',
	
	# template
	'template/template.js',
	'template/nodes.js',
	'template/parser.js',
	'template/defaulttags.js',
	'template/defaultfilters.js',
	
	'shortcuts.js',
	'locale.js',
	'middleware.js',
	'templates.js',
	'views.js',
)

DEPENDENCIES_BASE_PATH= '../dependencies/'
DEPENDENCIES_PATHS= (
	'json.js',
	'jquery-1.4.js',	# da inserire la versione non minimizzata
)
INCLUDE_DEPENDENCIES= False
