from urllib2 import urlopen

from django.http import HttpResponse, Http404


def csajaxr(request):
	url= request.GET['url']
	
	return HttpResponse(urlopen(url).read(), mimetype='text/html')
