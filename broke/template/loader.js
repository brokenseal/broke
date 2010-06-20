(function(_){
	var
		settings= require('broke/conf/settings').settings
		,utils= require('broke/core/utils')
		,Template= require('broke/template/template').Template
	;
	
	_.renderToString= function(templateName, context){
		var
			i,
			loader,
			template
		;
		
		for(i= 0; i< settings.TEMPLATE_LOADERS.length; i++) {
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
