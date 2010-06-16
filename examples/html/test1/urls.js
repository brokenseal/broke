(function(_){
	var
		patterns= require('broke/conf/urls/defaults').patterns
		,views= require('examples/html/test1/views')
	;
	
	_.urlpatterns= patterns('', 
		[ '/entry/view/([0-9]+)/', views.entry.view ]
	);
})(exports);
