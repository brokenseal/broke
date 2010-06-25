(function(_){
	var
		settings= require('broke/conf/settings').settings
		,utils= require('broke/core/utils')
		,Entry= require('examples/node/models').Entry
		,renderToResponse= require('broke/shortcuts').renderToResponse
		
		,home= function(request){
			return renderToResponse("base.html", {
				message: 'Hello, world!'
			});
		}
		,entry_view= function(request){
			return renderToResponse("base.html", {
				message: 'Welcome home!'
			});
		}
		,handle_static_files= function(){
			return renderToResponse("base.html", {
				message: 'TODO'
			});
		}
	;
	
	utils.extend(_, {
		home: home
		,entry_view: entry_view
		,handle_static_files: handle_static_files
	});
})(exports);
