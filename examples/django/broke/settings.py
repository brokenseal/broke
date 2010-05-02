import os

PROJECT_ROOT= os.path.abspath(os.path.dirname(__file__))
WEB_SITE_NAME= 'broke'

STATIC_ROOT= os.path.join(PROJECT_ROOT, "media")
MEDIA_ROOT= STATIC_ROOT

DEBUG = False
TEMPLATE_DEBUG= DEBUG
PREPEND_WWW= False

SITE_ID= 1

URL_VALIDATOR_USER_AGENT= 'Django'

ADMINS = (
	('Callegari Davide', 'admin@brokenseal.it'),
)

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
	'django.core.context_processors.i18n',
)
LANGUAGE_CODE = 'en'
DEFAULT_CHARSET= 'utf-8'
SESSION_COOKIE_AGE= 21600
SESSION_EXPIRE_AT_BROWSER_CLOSE= True
SESSION_COOKIE_NAME= 'broke_js_session_id'

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

MANAGERS = ADMINS

SECRET_KEY= 'm(2-yb!etr4f*ve_-$z$#*8e=_fd@qte8yjjpgk+5gzofxf0@k'

TEMPLATE_DIRS= (
	os.path.join(PROJECT_ROOT, 'templates'),
	os.path.join(PROJECT_ROOT, 'media/js/myProject/templates'),
)

GOOGLE_ANALYTICS_MODEL = True


from conf import *
