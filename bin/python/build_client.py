import sys
from jspacker import pack

BROKE_BASE_PATH= '../../broke/'

_client_paths= (
	'broke-0.1.js',
	'core/class.js',
	'core/exceptions.js',
	'core/i18n.js',
	'core/urlresolvers.js',
	'core/utils.js',
	'core/events.js',
	'core/utils.js',
	'core/context_processors.js',
	
	'template/template.js',
	'template/nodes.js',
	'template/parser.js',
	'template/defaulttags.js',
	'template/defaultfilters.js',
	
	'conf/settings.js',
	
	'db/models.js',
	'db/fields.js',
	'forms/models.js',
	'forms/fields.js',
	
	'shortcuts.js',
	'locale.js',
	'middleware.js',
	'templates.js',
	'views.js',
)

if __name__ == '__main__':
	pack(_client_paths, sys.argv[1], BROKE_BASE_PATH)
