(function(_){
	var
		Template= require('broke/template').Template
	;
	
	_.renderToString= function(templateName, context){
		var i,
			loader,
			template;
		
		for(i= 0; i< broke.conf.settings.TEMPLATE_LOADERS.length; i++) {
			loader= broke.conf.settings.TEMPLATE_LOADERS[i];
			
			if(typeOf(loader) === "string") {
				loader= getattr(loader);
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
