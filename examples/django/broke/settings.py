DEBUG = False
TEMPLATE_DEBUG= DEBUG
PREPEND_WWW= False

SITE_ID= 1

URL_VALIDATOR_USER_AGENT= 'Django'

ADMINS = (
	('Callegari Davide', 'admin@brokenseal.it'),
)

DATABASE_ENGINE = 'mysql'
DATABASE_NAME = 'broke'
DATABASE_USER = 'broke_user'
DATABASE_PASSWORD = 'br0k3Buzzword'

TIME_ZONE = 'Europe/Rome'

TEMPLATE_LOADERS = (
	'django.template.loaders.filesystem.load_template_source',
	'django.template.loaders.app_directories.load_template_source',
)
MIDDLEWARE_CLASSES = (
	'django.middleware.gzip.GZipMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.contrib.csrf.middleware.CsrfMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.middleware.doc.XViewMiddleware',
)
TEMPLATE_CONTEXT_PROCESSORS = (
	'django.core.context_processors.auth',
	'django.core.context_processors.media',
	'django.core.context_processors.debug',
	'django.core.context_processors.request',
)
LANGUAGE_CODE = 'en'
DEFAULT_CHARSET= 'utf-8'
SESSION_COOKIE_AGE= 21600
SESSION_EXPIRE_AT_BROWSER_CLOSE= True
SESSION_COOKIE_NAME= 'broke_js_session_id'

MEDIA_ROOT= '/var/www/django/projects/broke/media/'
ROOT_URLCONF= 'broke.urls'

INSTALLED_APPS = (
	'django.contrib.auth',
	'django.contrib.sites',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.admin',
	'google_analytics',
	'broke.blog',
)

CACHE_MAX_ENTRIES= 400
CACHE_CULL_PERCENTAGE= 3
MAX_GIORNI_SCADENZA= 45

MEDIA_URL= 'http://demo_media.brokenseal.it/'
ADMIN_MEDIA_PREFIX = '%sadmin_media/'% (MEDIA_URL,)

MANAGERS = ADMINS

SECRET_KEY= 'm(2-yb!etr4f*ve_-$z$#*8e=_fd@qte8yjjpgk+5gzofxf0@k'

TEMPLATE_DIRS= (
	'/var/www/django/projects/broke/templates',
)

GOOGLE_ANALYTICS_MODEL = True
