(function(_){
	var
		utils= require('broke/core/utils'),
		Template= require('broke/template/template').Template
	;
	
	_.renderToString= function(templateName, context){
		var i,
			loader,
			template;
		
		for(i= 0; i< broke.conf.settings.TEMPLATE_LOADERS.length; i++) {
			loader= broke.conf.settings.TEMPLATE_LOADERS[i];
			
			if(utils.typeOf(loader) === "string") {
				loader= utils.getattr(loader);
			}
			
			if((template= loader.loadTemplate(templateName))) {
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
