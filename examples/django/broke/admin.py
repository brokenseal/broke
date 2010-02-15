from django.contrib import admin

from blog.models import Entry


class EntryAdmin(admin.ModelAdmin):
	list_display = ('__unicode__', 'title', 'body',)
	date_hierarchy = 'pub_date'
admin.site.register(Entry, EntryAdmin)
