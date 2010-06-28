(function(_){
	var
		settings= require('broke/conf/settings').settings
		,utils= require('broke/core/utils')
		,Entry= require('examples/node/models').Entry
		,renderToResponse= require('broke/shortcuts').renderToResponse
		
		,home= function(request){
			return renderToResponse("base.html", {
				message: 'Hello, world!'
				,MEDIA_URL: 'media.localhost'
			});
		}
		,entry_view= function(request){
			return renderToResponse("base.html", {
				message: 'Welcome home!'
			});
		}
	;
	
	utils.extend(_, {
		home: home
		,entry_view: entry_view
	});
})(exports);
