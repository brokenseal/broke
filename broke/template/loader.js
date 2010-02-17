(function(){
	var Template= broke.template.Template;
	
	broke.extend(broke.template, {
		loader: {
			renderToString: function(templateName, context){
				var i,
					loader,
					template;
				
				for(i= 0; i< broke.settings.templateLoaders.length; i++) {
					loader= broke.settings.templateLoaders[i];
					
					if(typeOf(loader) === "string") {
						loader= getattr(loader);
					}
					
					if((template= loader.loadTemplate(templateName)) !== '') {
						break;
					}
				};
				
				if(template) {
					return new Template(template).render(context);
				}
				
				// no template found
				return '';
			}
		}
	});
})();
