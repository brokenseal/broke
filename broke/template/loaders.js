(function(){
	var templatesCache= {},
		settings= broke.conf.settings;
	
	broke.extend(broke.template, {
		loaders: {
			apps: {
				loadTemplate: function(templateName){
					var template,
						len= settings.INSTALLED_APPS.length,
						result,
						app;
					
					// loops through all the apps
					while(len--) {
						app= settings.INSTALLED_APPS[len];
						
						// check if the template exists inside this project's templates
						if('templates' in app && templateName in app.templates) {
							return app.templates[templateName];
						}
					}
					
					// no template found
					return template;
				}
			},
			remote: {
				loadTemplate: function(templateName){
					var template,
						url,
						templatePath,
						len= settings.TEMPLATE_PATHS.length;
					
					// not sure about that...
					while(len--) {
						templatePath= settings.TEMPLATE_PATHS;
						
						url= templatePath + '/' + templateName;
						
						if(url in templatesCache) {
							return templatesCache[url];
						}
						
						$.ajax({
							async: false,
							url: url,
							success: function(responseText){
								template= responseText;
								
								// cache the response
								templatesCache[url]= template;
							},
							error: function(error){
								// TODO
							}
						});
					}
					
					return template;
				}
			}
		}
	});
})();
