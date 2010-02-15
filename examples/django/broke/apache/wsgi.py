import os, sys
import django.core.handlers.wsgi
 

os.environ['DJANGO_SETTINGS_MODULE']= 'broke.settings'
application = django.core.handlers.wsgi.WSGIHandler()
