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
							target[ name ]= broke.extend( deep, src || ( copy.length !== null ? [ ] : { } ), copy );
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
	
	// broke private attributes and methods
	var _isReady= false,
		_bindEvents= function(){
			var callback,
				oldHash,
				settings= broke.conf.settings;
			
			/******************************** EVENTS BINDING ********************************/
			// elements binding
			if(settings.EVENT_TRIGGERING_METHOD === 'elements'){
				// --------- on elements ---------
				callback= function(e){
					var _this= $(this),
						tag= this.tagName.lower(),
						urlChangingElement= settings.URL_CHANGING_ELEMENTS[tag],
						urlAttribute= urlChangingElement.urlAttribute,
						url= _this.attr(urlAttribute),
						type= e.target.tagName.lower() == "form" ? 'POST' : 'GET';
					
					if(urlChangingElement.preventDefault) {
						e.preventDefault();
					}
					
					if(url !== undefined && url.contains('#')) {
						broke.request({
							event: e,
							url: url.split('#')[1],
							completeUrl: url,
							type: type
						});
					}
				};
				
				// collect all the url changing elements
				forEach(settings.URL_CHANGING_ELEMENTS, function(key){
					$(key)[settings.EVENT_BINDING](this.events.join(','), callback);
				});
			
			// hash change binding
			} else if(settings.EVENT_TRIGGERING_METHOD === 'hashchange'){
				
				// if it does not exist, let's create it
				if(!('onhashchange' in window)){
					oldHash= location.hash;
					
					setInterval(function(){
						if(location.hash !== oldHash) {
							oldHash= location.hash;
							
							$(window).trigger('hashchange');
						}
					}, settings.HASHCHANGE_INTERVAL);
				}
				
				// bind on hash change
				window.onhashchange= function(e){
					broke.request({
						event: e,
						url: location.href.split('#')[1]
					});
				};
			}
		},
		_searchNamedUrls= function(){
			/*
			 * Search for named urls on the page and swap them with full qualified urls
			 * Named urls on the page should look like this:
			 *     #entry-commit     ->    /blog/entry/commit/
			 *     #entry-view       ->    /blog/entry/view/2/
			 *     #entry-edit 21,2  ->    /blog/21/entry/edit/2/
			 * 
			 * If any arguments are needed, they will have to be a comma separated 
			 * series of values after the named url
			 * 
			 */
			
			var callback= function(urlChangingElement){
				var _this= $(this),
					urlAttribute= urlChangingElement.urlAttribute,
					urlToRender= _this.attr(urlAttribute).split('#')[1] || '',
					namedUrl,
					args,
					result;
				
				if(_this.attr(urlAttribute).contains('#')) {
					urlToRender= urlToRender.trim().split(' ');
					
					namedUrl= urlToRender[0];
					args= urlToRender[1];
					if(args) {
						args= args.split(',');
					} else {
						args= [];
					}
					
					try {
						
						result= broke.urlResolvers.reverse(namedUrl, args);
						_this.attr(urlAttribute, '#' + result);
						
					} catch(e) {
						if(e.name == "NoReverseMatch") {
							return;
						}
					}
				}
			};
			
			forEach(broke.conf.settings.URL_CHANGING_ELEMENTS, function(key){
				var elements= $(key),
					elementsLength= elements.length;
				
				while(elementsLength--) {
					callback.call(elements[elementsLength], this);
				}
			});
		},
		_getLanguageFiles= function(){
			var settings= broke.conf.settings,
				languageCode= settings.LANGUAGE_CODE,
				localePath= '/locale/%s/LC_MESSAGES/broke.po'.echo(languageCode),
				localePaths= [
					settings.BASE_URL + '/conf'
				];
			
			// projects' locale paths
			localePaths.populate(getattr(broke.BROKE_SETTINGS_OBJECT).LOCALE_PATHS);
			
			localePaths.each(function(){
				broke.utils.translation.init({
					url: this + localePath
				});
			});
			
			return;
		},
		_preloadRemoteTemplates= function(app){
			// TODO
		},
		_setLanguage= function(){
			// 1. look in the url
			var queryString= broke.urlResolvers.parseQueryString(window.location.href.split('?')[1]),
				cookie= $.cookie(settings.LANGUAGE_COOKIE_NAME),
				langCodeFromCookie;
			
			// check query string
			if('language' in queryString) {
				settings.LANGUAGE_CODE= queryString.language;
				
				// set cookie language
				$.cookie(settings.LANGUAGE_COOKIE_NAME, queryString.language, {
					expires: 30,
					domain: window.location.host,
					path: '/'
				});
			} else {
				// 2. check cookie
				langCodeFromCookie= $.cookie(settings.LANGUAGE_COOKIE_NAME);
				
				settings.LANGUAGE_CODE= langCodeFromCookie || settings.LANGUAGE_CODE;
			}
		},
		_initProject= function(){
			settings= broke.conf.settings;
			
			// merge settings
			broke.extend(settings, getattr(broke.BROKE_SETTINGS_OBJECT));
			settings.SETTINGS_OBJECT= getattr(broke.BROKE_SETTINGS_OBJECT);
			
			// init project's url patterns
			broke.extend(broke.urlPatterns, getattr(settings.ROOT_URLCONF));
			
			// init installed apps' models
			settings.INSTALLED_APPS.map(function(){
				var app= this;
				
				if(app.constructor == String) {
					app= getattr(this);
				}
				
				// init model's storage
				forEach(app.models, function(key){
					if(this.autoInit) {
						broke.initStorage(this);
					}
				});
				
				if(settings.PRELOAD_REMOTE_TEMPLATES) {
					_preloadRemoteTemplates(app);
				}
				
				return app;
			});
			
			return settings;
		};
	
	broke.extend({
		/**************************** VERSION ********************************/
		VERSION: "0.1b",
		
		/************************ SETTINGS OBJECT ****************************/
		BROKE_SETTINGS_OBJECT: null,	// it points to the registered project's settings
										// equivalent of Django's DJANGO_SETTINGS_MODULE
		
		/****************************** INIT *********************************/
		init: function(){
			var gettext= broke.utils.translation.gettext,
				settings;
			
			if(_isReady) {
				// already initialized
				broke.log('Broke has already been initialized! Fail silently...');
				return;
			}
			
			if(!broke.BROKE_SETTINGS_OBJECT) {
				// no settings object defined, fail out loud
				throw broke.exceptions.SettingsObjectNotDefined(gettext('Settings object not defined!'));
			}
			
			// init project
			_initProject();
			
			settings= broke.conf.settings;
			
			if(settings.USE_I18N) {
				// determine the language
				_setLanguage();
				
				// get language files
				_getLanguageFiles();
			}
			
			// search for named urls and swap them with fully qualified urls
			_searchNamedUrls();
			
			// bind events
			_bindEvents();
			
			// cache init
			broke.core.cache.cache= broke.core.cache.getCache(settings.CACHE_BACKEND);
			
			// on broke init, check if there is an url to request
			if(window.location.hash !== '') {
				broke.request(window.location.hash.split('#')[1]);
			}
			
			$(window).trigger('broke.ready');
			_isReady= true;
		},
		isReady: function(){
			return _isReady;
		},
		/************************* REQUEST SHORTCUT **************************/
		request: function(args){
			var req= {};
			
			if(typeOf(args) === 'string') {
				// first case: broke.request('/entry/view/1/');
				req.url= args;
			} else {
				// second case: broke.request({
				//     url: '/entry/view/1/',
				//     fromReload: true
				// });
				req= args;
			}
			
			$(window).trigger('broke.request', [req]);
		},
		
		/************************ RESPONSE SHORTCUT **************************/
		response: function(args){
			$(window).trigger('broke.request', [args]);
		},
		
		/*********************************************************************/
		removeHash: function(){
			window.location.hash= '';
			return true;
		},
		log: function(debugString, doNotAppendDate){
			if(broke.conf.settings.DEBUG && 'console' in window) {
				if(!doNotAppendDate) {
					var now= new Date();
					now= '%s:%s:%s:%s'.echo(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
					debugString= '[%s] %s'.echo(now, debugString);
				}
				
				console.debug(debugString);
			}
		},
		fetchData: function(args){
			var model= args.model,
				settings= broke.conf.settings,
				url= args.url || settings.JSON_URLS.getData.interpolate({
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
				dataType: settings.AJAX.dataType,
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
		localStorage: (function(){
			// mime or reference HTML 5's Local Storage
			var localStorageSetObject= function(key, value) {
					this.setItem(key, JSON.stringify(value));
				},
				localStorageGetObject= function(key) {
					return JSON.parse(this.getItem(key));
				},
				storage= {};
			
			if('localStorage' in window) {
				broke.extend(Storage.prototype, {
					setObject: localStorageSetObject,
					getObject: localStorageGetObject
				});
				
				return localStorage;
			}
			
			return {
				key: function(key){
					throw {
						name: "NotImplementedError",
						description: "Sorry, this version of localStorage is a fake and does not support key() method."
					};
				},
				setItem: function(key, value){
					storage[key]= value;
					return this;
				},
				getItem: function(key){
					return storage[key];
				},
				removeItem: function(key){
					delete storage[key];
					return this;
				},
				setObject: localStorageSetObject,
				getObject: localStorageGetObject,
				clear: function(){
					storage= {};
					return this;
				}
			};
		})(),
		storage: {},						// local database (?)
		shortcuts: {},
		conf: {
			settings: {}
		},
		core: {},
		i18n: {},
		locale: {},							// locale based strings
		urlPatterns: [],					// url patterns
		views: {},							// views
		template: {},						// templates
		templates: {},						// templates
		middleware: {},						// middleware
		contextProcessors: {}				// contextProcessors
	});
	
	// init on dom ready
	$(document).ready(function(){
		broke.init();
	});
})();
