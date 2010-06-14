(function(_){
	var
		patterns= require('broke/conf/urls/defaults').patterns
	;
	
	_.urlpatterns= patterns('', 
		[
			'/entry/view/([0-9]+)/', function() {
				alert(arguments);
			}
		]
	);
})(exports);
