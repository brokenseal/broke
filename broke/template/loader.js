(function(_){
	var
		settings= require('broke/conf/settings').settings
		,utils= require('broke/core/utils')
		,Template= require('broke/template/template').Template
	;
	
	_.renderToString= function(templateName, context, contextInstance){
		var
			i
			,loader
			,template
			,len= settings.TEMPLATE_LOADERS.length
		;
		
		for(i= 0; i< len; i++) {
			loader= settings.TEMPLATE_LOADERS[i];
			
			if(utils.typeOf(loader) === "string") {
				loader= utils.getCallable(loader);
			}
			
			template= loader.loadTemplate(templateName);
			
			if(template) {
				break;
			}
		};
		
		if(template) {
			return new Template(template).render(context);
		}
		
		// no template found
		return '';
	}
})(exports);
