from django.conf.urls.defaults import *
from django.views.generic.list_detail import object_list

from views import save_entry, get_data, delete_entry

urlpatterns = patterns('',
	url(r'entry/json/get_data/$', get_data),
	url(r'entry/json/save/$', save_entry),
	url(r'entry/json/delete/$', delete_entry),
)
