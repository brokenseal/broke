from django.conf.urls.defaults import *
from django.views.generic.list_detail import object_list
from django.views.generic.simple import direct_to_template

from blog.models import Entry
from blog.forms import EntryForm
from views import csajaxr

from admin import admin

admin.autodiscover()

urlpatterns = patterns('',
	url(r'^admin/(.*)',	admin.site.root),
	url(r'^/?$', object_list, {
		'queryset': Entry.objects.all(),
		'extra_context': {
			'form': EntryForm()
		}
	}),
	url(r'^blog/', include('broke.blog.urls'),),
	url(r'^rss_reader/$', direct_to_template, {
		'template' : 'rss_reader.html'
	}),
	url(r'^gettext_test/$', direct_to_template, {
		'template' : 'gettext_test.html'
	}),
	url(r'^csajaxr/$', csajaxr, ),
)
