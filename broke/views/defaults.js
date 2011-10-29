(function(_){
	var
		gettext= require('broke/utils/translation').gettext.gettext
		,utils= require('broke/core/utils')
		,Entry= require('examples/node/models').Entry
		,renderToResponse= require('broke/shortcuts').renderToResponse

		,technical404Response= function(){
			// TODO
			return;
		}
		pageNotFound= function(request){
			// no matching url found, fail silently...
		}
		,handleStaticFiles= function(){
			return renderToResponse("base.html", {
				message: 'TODO'
			});
		}
	;

	utils.extend(_, {
		technical404Response: technical404Response
		,handleStaticFiles: handleStaticFiles
		,pageNotFound: pageNotFound
	});
})(exports);
