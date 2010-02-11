/*
 * Broke project - a broken project brought to you by Davide Callegari - http://www.brokenseal.it/
 * 
 * Inspired by the Django Web Framework - http://www.djangoproject.com/
 * A lot of inspirement/copy from other Javascript Libraries like:
 *  - jQuery - http://jquery.com/
 *  - JavascriptMVC - http://javascriptmvc.com/
 * 
 * Licensed under MIT.
 * 
 */

var broke= {},
	bk= broke;

(function(){
	broke.extend= function() {
		var name,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length, 
			deep = false,
			options,
			src,
			copy;
		
		if(arguments.length > 2) {
			broke.extend.apply(broke, arguments.slice(1));
		}
		// copy reference to target object
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !(target instanceof Function)) {
			target = {};
		}
		// extend broke itself if only one argument is passed
		if ( length == i ) {
			target = this;
			--i;
		}
		while(i < length) {
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) !== null ) {
				// Extend the base object
				for ( name in options ) {
					if(options.hasOwnProperty(name)) {
						src = target[ name ];
						copy = options[ name ];
						
						// Prevent never-ending loop
						if ( target === copy ) {
							continue;
						}
						// Recurse if we're merging object values
						if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
							target[ name ] = extend( deep, src || ( copy.length !== null ? [ ] : { } ), copy );
						}
						
						// Don't bring in undefined values
						else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}
			
			i++;
		}
		// Return the modified object
		return target;
	};
	
	broke.extend({
		/**************************** VERSION ********************************/
		VERSION: "0.1b",
		removeHash: function(){
			window.location.hash= '';
			return true;
		},
		log: function(debugString, doNotAppendDate){
			if(broke.settings.debug && window.console) {
				if(!doNotAppendDate) {
					var now= new Date();
					now= now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ':' + now.getMilliseconds();
					debugString= '[' + now + '] ' + debugString;
				}
				
				console.debug(debugString);
			}
		},
		fetchData: function(args){
			var model= args.model,
				url= args.url || broke.settings.jsonUrls.getData.render({
					appLabel: model.appLabel,
					model: model.className.lower()
				}),
				filter= args.filter || {},
				result;
			
			$.ajax({
				async: false,
				type: "GET",
				url: url,
				data: filter,
				dataType: broke.settings.ajax.dataType,
				error: function(xhr, status, error){
					result= error;
				},
				success: function(data, status){
					broke.storage[model.tableName]= data;
					
					result= broke.storage[model.tableName];
				}
			});
			
			return result;
		},
		initStorage: function(model){
			broke.fetchData({
				'model': model
			});
		},
		initProject: function(project){
			var key,
				subKey;
			// WARNING: for internal use only!
			
			// init project's models
			for(key in project.models){
				if(project.models.hasOwnProperty(key)) {
					broke.initStorage(project.models[key]);
				}
			}
			
			// init project's url patterns
			broke.extend(broke.urlPatterns, project.urlPatterns);
			
			// init apps' models
			for(key in project.apps){
				
				if(project.apps.hasOwnProperty(key)) {
					
					for(subKey in project.apps[key].models) {
						
						if(project.apps[key].models.hasOwnProperty(subKey)) {
							broke.initStorage(project.apps[key].models[subKey]);
						}
					}
				}
			}
			
			return project;
		},
		registerProject: function(project){
			// settings
			broke.extend(broke.settings, project.settings);
			
			// add the project to the broke project list for later manipulation
			this.projects.push(project);
			
			return project;
		},
		/***************************** INIT **********************************/
		projects: [],
		storage: {},						// local database (?)
		db: {
			models: {}
		},
		exceptions: {},
		i18n: {},
		locale: {},							// locale based strings
		urlPatterns: [],					// url patterns
		views: {},							// views
		templates: {},						// templates
		middleware: {},						// middleware
		contextProcessors: {}				// contextProcessors
	});
})();
