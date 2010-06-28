(function(_){
	var
		patterns= require('broke/conf/urls/defaults').patterns
		,views= require('examples/node/views')
		,handleStaticFiles= require('broke/views/defaults').handleStaticFiles
	;
	
	_.urlpatterns= patterns('', 
		[ '^$', views.home ]
		,[ '^entry/view/([0-9]+)/', views.entry_view ]
		,[ 'static/', handleStaticFiles ]
	);
})(exports);
