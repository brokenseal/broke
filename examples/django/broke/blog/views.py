import simplejson as json

from django.core import serializers
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from django.utils.html import strip_tags

from models import Entry
from forms import EntryForm


def save_entry(request):
	if not request.is_ajax() or not request.method == 'POST':
		raise Http404
	
	form= EntryForm(request.POST)
	
	if not form.is_valid():
		return HttpResponse('{}', mimetype='application/javascript')
	
	if 'pk' in request.POST:
		entry= get_object_or_404(Entry, pk= request.POST['pk'])
		form= EntryForm(request.POST, instance= entry)
		entry= form.save(commit= False)
		
		entry.body = strip_tags(entry.body)
		entry.title = strip_tags(entry.title)
		entry.save()
	else:
		entry= form.save(commit= False)
		entry.body = strip_tags(entry.body)
		entry.title = strip_tags(entry.title)
		entry.save()
	
	entry_content_type= ContentType.objects.get_for_model(entry.__class__)
	
	response_data= json.dumps({
		'pk': entry.pk,
		'model': '%s.%s' % (entry_content_type.app_label, entry_content_type.model),
	})
	
	return HttpResponse(response_data, mimetype='application/javascript')

def delete_entry(request):
	if not request.is_ajax() or not request.method == 'POST' and 'pk' in request.POST:
		raise Http404
	
	entry= get_object_or_404(Entry, pk= request.POST['pk'])
	entry.delete()
	
	response_data= json.dumps({
		'operation': 'complete',
	})
	
	return HttpResponse(response_data, mimetype='application/javascript')

def get_data(request):
	if not request.is_ajax():
		raise Http404
	
	entries= Entry.objects.all()
	
#	if len(request.GET):
#		for key, value in request.GET:
#		entries.filter(key= value)
	
	return HttpResponse(serializers.serialize("json", entries), mimetype='application/javascript')
