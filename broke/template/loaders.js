(function(_){
	var
		templatesCache= {}
		,settings= require('broke/conf/settings').settings
		,utils= require('broke/core/utils')
		,TemplateDoesNotExist= require('broke/core/exceptions').TemplateDoesNotExist
	;
	
	_.apps= {
		loadTemplate: function(templateName){
			var
				template
				,len= settings.INSTALLED_APPS.length
				,result
				,app
			;
			
			// loops through all the apps
			while(len--) {
				app= settings.INSTALLED_APPS[len];
				
				// check if the template exists inside this project's templates
				if(utils.typeOf(app) == "object" && 'templates' in app && templateName in app.templates) {
					return app.templates[templateName];
				}
			}
			
			// no template found
			return template;
		}
	};
	
	_.remote= {
		loadTemplate: function(templateName){
			var
				template
				,url
				,templatePath
				,len= settings.TEMPLATE_PATHS.length
			;
			
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
	};
	
	_.filesystem= {
		getTemplateSources: function(templateName, templateDirs){
			var
				i= 0
				,len
				,join= require('path').join
				,paths= []
			;
			
			templateDirs= templateDirs || settings.TEMPLATE_DIRS;
			len= templateDirs.length;
			
			for(i= 0; i< len; i++) {
				try {
					paths.push(join(templateDirs[i], templateName));
				} catch(e) {}
			}
			
			return paths;
		}
		,loadTemplate: function(templateName){
			// Returns the absolute paths to "template_name", when appended to each
			// directory in "template_dirs". Any paths that don't lie inside one of the
			// template dirs are excluded from the result set, for security reasons.
			var
				tried= []
				,fs= require('fs')
				,file
				,paths= _.filesystem.getTemplateSources(templateName)
				,len= paths.length
				,i= 0
				,readFile
			;
			
			for(i= 0; i< len; i++) {
				try {
					file= fs.openSync(paths[i], 'r');
					try {
						require('sys').puts(' path: ' + paths[i]);
						readFile= fs.readFileSync(file, "utf-8");
						require('sys').puts(' readFile: ' + readFile);
						
						return [ readFile, paths[i] ];
					} catch(e) {
						require('sys').puts(' eeee: ' + e);
					} finally {
						fs.close(file);
					}
				} catch(e){
					require('sys').puts('e: ' + e);
					tried.push(paths[i]);
				}
			}
			
			if(tried.length) {
				errorMsg= "Tried %s".echo(tried);
			} else {
				errorMsg= "Your TEMPLATE_DIRS setting is empty. Change it to point to at least one template directory.";
			}
			
			throw new TemplateDoesNotExist(errorMsg);
		}
	};
})(exports);
