(function(){
	var templatesCache= {};
	
	broke.extend(broke.template, {
		loaders: {
			apps: {
				loadTemplate: function(templateName){
					var template,
						i,
						result,
						app;
					
					// loops through all the apps
					for(i= 0; i< broke.conf.settings.INSTALLED_APPS.length; i++) {
						app= broke.conf.settings.INSTALLED_APPS[i];
						
						// check if the template exists inside this project's templates
						if('templates' in app && templateName in app.templates) {
							return app.templates[templateName];
						}
					}
					
					// no template found
					return '';
				}
			},
			remote: {
				loadTemplate: function(templateName){
					var template,
						url= templateName;
					
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
					
					return template;
				}
			}
		}
	});
})();
