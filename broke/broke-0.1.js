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
	
	// broke private methods
	var private= {
		bindEvents: function(){
			var key;
			
			/******************************** EVENTS BINDING ********************************/
			// elements binding
			if(broke.settings.eventTriggeringMethod === 'elements'){
				// --------- on elements ---------
				
				// collect all the url changing elements
				for(key in broke.settings.urlChangingElements) {
					if(broke.settings.urlChangingElements.hasOwnProperty(key)) {
						// bind or live bind
						$(key)[broke.settings.eventBinding](broke.settings.urlChangingElements[key].events.join(','), function(e){
							
							var _this= $(this),
								tag= this.tagName.lower(),
								urlChangingElement= broke.settings.urlChangingElements[tag],
								urlAttribute= urlChangingElement.urlAttribute,
								url= _this.attr(urlAttribute);
							
							if(urlChangingElement.preventDefault) {
								e.preventDefault();
							}
							
							if(url !== undefined && url.contains('#')) {
								broke.request({
									event: e,
									url: url.split('#')[1],
									completeUrl: url
								});
							}
						});
					}
				}
			
			// hash change binding
			} else if(broke.settings.eventTriggeringMethod === 'hashchange'){
				
				// if it does not exist, let's create it
				if(!('onhashchange' in window)){
					// closure to store hide local variable oldHash
					(function(){
						var oldHash= location.hash;
						
						setInterval(function(){
							if(location.hash !== oldHash) {
								oldHash= location.hash;
								
								$(window).trigger('hashchange');
							}
						}, 150);
					})();
					
				}
				
				// bind on hash change
				window.onhashchange= function(e){
					var completeUrl= location.href;
						url= location.href.split('#')[1];
					
					broke.request({
						event: e,
						url: url
					});
				};
			}
		},
		searchNamedUrls: function(){
			/*
			 * Search for named urls on the page and swap them with full qualified urls
			 * Named urls on the page should look like this:
			 * 		<# entry-commit #>		->		/blog/entry/commit/
			 * 		<# entry-view 2 #>		->		/blog/entry/view/2/
			 * 		<# entry-edit 21,2 #>	->		/blog/21/entry/edit/2/
			 * 
			 * If any arguments are needed, they will have to be a comma separated 
			 * series of values after the named url
			 * 
			 */
			
			var key;
			
			for(key in broke.settings.urlChangingElements) {
				if(broke.settings.urlChangingElements.hasOwnProperty(key)) {
					
					$(key).each(function(){
						var _this= $(this),
							urlAttribute= broke.settings.urlChangingElements[key].urlAttribute,
							urlToRender= _this.attr(urlAttribute),
							namedUrl,
							args,
							result;
						
						// it should match /<#(.*)#>/
						if(urlToRender.contains('<#')) {
							urlToRender= urlToRender
								.replace('<#', '')
								.replace('#>', '')
								.trim()
								.split(' ');
							
							namedUrl= urlToRender[0];
							args= urlToRender[1];
							if(args) {
								args= args.split(',');
							} else {
								args= [];
							}
							result= broke.urlResolvers.reverse(namedUrl, args);
							
							_this.attr(urlAttribute, '#' + result);
						}
					});
				}
			}
		},
		getLanguageFiles: function(){
			var languageCode= broke.settings.languageCode,
				localePath= '/locale/%s/LC_MESSAGES/broke.po'.echo(languageCode),
				localePaths= [
					broke.settings.baseUrl + '/conf'
				];
			
			// init projects
			broke.projects.each(function(){
				localePaths.populate(this.settings.localePaths);
			});
			
			localePaths.each(function(){
				broke.i18n.init({
					url: this + localePath
				});
			});
			
			return;
		}
	};
	
	broke.extend({
		/**************************** VERSION ********************************/
		VERSION: "0.1b",
		
		/***************************** INIT **********************************/
		isReady: false,
		init: function(){
			
			// init on dom ready
			$(document).ready(function(){
				
				// init projects
				broke.projects.each(function(){
					broke.initProject(this);
				});
				
				if(broke.settings.usei18n) {
					// get language files
					private.getLanguageFiles();
				}
				
				// search for named urls and swap them with fully qualified urls
				private.searchNamedUrls();
				
				// bind events on elements
				private.bindEvents();
				
				// on broke init, check if there is an url to request
				if(window.location.hash !== '') {
					broke.request(window.location.hash.split('#')[1]);
				}
				
				broke.isReady= true;
			});
		},
		/************************ REQUEST SHORTCUT ****************************/
		request: function(args){
			var req= {};
			
			if(typeOf(args) === 'string') {
				// first case: broke.request('/entry/view/1/');
				req.url= args;
			} else {
				// second case: broke.request({
				// 		url: '/entry/view/1/',
				//		fromReload: true
				// });
				req= args;
			}
			
			$(window).trigger('broke.request', [req]);
		},
		/************************ REQUEST SHORTCUT ****************************/
		response: function(args){
			$(window).trigger('broke.request', [args]);
		},
		/*********************************************************************/
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
				url= args.url || broke.settings.jsonUrls.getData.interpolate({
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
		projects: [],
		storage: {},						// local database (?)
		db: {
			models: {}
		},
		exceptions: {},
		shortcuts: {},
		i18n: {},
		locale: {},							// locale based strings
		urlPatterns: [],					// url patterns
		views: {},							// views
		template: {},						// templates
		templates: {},						// templates
		middleware: {},						// middleware
		contextProcessors: {}				// contextProcessors
	});
	
	broke.init();
})();
