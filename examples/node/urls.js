(function(_){
	var
		patterns= require('broke/conf/urls/defaults').patterns
		,views= require('examples/node/views')
		,handle_static_files= function(){
			return 'TODO';
		}
	;
	
	_.urlpatterns= patterns('', 
		[ '^/$', views.home ]
		,[ '^entry/view/([0-9]+)/', views.entry_view ]
		,[ '.*', handle_static_files ]
	);
})(exports);
