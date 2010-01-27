from django.conf.urls.defaults import *
from django.views.generic.list_detail import object_list

from blog.models import Entry
from blog.forms import EntryForm
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
)
