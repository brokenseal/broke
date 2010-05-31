(function(_){
	var
		gettext= require('broke/utils/translation').gettext
	;
	
	_.defaults= {
		pageNotFound: function(request){
			// no matching url found, fail silently...
			broke.log(gettext("No matching url found, fail silently..."));
		}
	};
})(exports);
