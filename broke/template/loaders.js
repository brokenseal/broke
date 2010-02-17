(function(){
	var templatesCache= {};
	
	broke.extend(broke.template, {
		loaders: {
			projects: {
				loadTemplate: function(templateName){
					var template,
						i,
						result,
						project;
					
					// loops through all the projects
					for(i= 0; i< broke.projects.length; i++) {
						project= broke.projects[i];
						
						// check if the template exists inside this project's templates
						if('templates' in project && templateName in project.templates) {
							return project.templates[templateName];
						}
						
						// loops through all the project's apps
						result= forEach(project.apps, function(){
							// checks if templates exists and if it's got the
							// template we are looking for
							
							if('templates' in this && templateName in this.templates) {
								template= this.templates[templateName];
								
								// template foud, stop the iteration
								return false;
							}
						});
						
						if(result === false) {
							// template found
							return template;
						}
					}
					
					// no template found
					return '';
				}
			}
		}
	});
})();
