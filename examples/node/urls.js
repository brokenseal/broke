(function(_){
	var
		patterns= require('broke/conf/urls/defaults').patterns
		,views= require('examples/node/views')
		,serveStaticFiles= require('broke/views/static').serve
	;

	_.urlpatterns= patterns('',
		[ '^$', views.home ]
		,[ '^entry/view/([0-9]+)/', views.entry_view ]
		,[ 'static/(.*)', serveStaticFiles, [ null, true ] ]
	);
})(exports);
