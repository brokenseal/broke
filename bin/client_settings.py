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
	'core/context_processors.js',
	'core/events.js',
	'core/exceptions.js',
	'core/i18n.js',
	'core/urlresolvers.js',
	'core/utils.js',
	'core/validators.js',
	
	# db
	'db/models/db.js',
	'db/models/fields.js',
	'db/models/manager.js',
	'db/models/models.js',
	'db/models/query.js',
	
	# forms
	'forms/models.js',
	'forms/fields.js',
	
	# template
	'template/defaultfilters.js',
	'template/defaulttags.js',
	'template/loader.js',
	'template/loaders.js',
	'template/nodes.js',
	'template/parser.js',
	'template/template.js',
	
	'shortcuts.js',
	'locale.js',
	'middleware.js',
	'templates.js',
	'views.js',
)

DEPENDENCIES_BASE_PATH= '../dependencies/'
DEPENDENCIES_PATHS= (
	'gettext.js',
	'jquery-1.4.js',
	'jquery.cookie.js',
	'json.js',
)
INCLUDE_DEPENDENCIES= False
