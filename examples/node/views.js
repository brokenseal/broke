(function(_){
	var
		settings= require('broke/conf/settings').settings
		,utils= require('broke/core/utils')
		,Entry= require('examples/node/models').Entry
		
		,home= function(request){
			return 'Welcome home!';
		}
		,entry_view= function(request){
			return 'Hello world!';
		}
	;
	
	utils.extend(_, {
		home: home
		,entry_view: entry_view
	});
})(exports);
