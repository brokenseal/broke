(function(_){
	var
		patterns= require('broke/conf/urls/defaults').patterns
		,views= require('examples/html/views')
	;
	
	_.urlpatterns= patterns('', 
		[ '^/$', views.home ]
		,[ '^entry/view/([0-9]+)/', views.entry_view ]
	);
})(exports);
