(function(_){
	var 
		__module__ = {},
		utils= require('depencendies/utils').extend,
		
		_isReady= false,
		_bindEvents= function(){
			var 
				callback,
				oldHash,
				settings= require('broke/conf/settings')
			;
			
			/******************************** EVENTS BINDING ********************************/
			// elements binding
			if(settings.EVENT_TRIGGERING_METHOD === 'elements'){
				// --------- on elements ---------
				callback= function(e){
					var
						_this= $(this),
						tag= this.tagName.lower(),
						urlChangingElement= settings.URL_CHANGING_ELEMENTS[tag],
						urlAttribute= urlChangingElement.urlAttribute,
						url= _this.attr(urlAttribute),
						type= e.target.tagName.lower() == "form" ? 'POST' : 'GET'
					;
					
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
			
			var
				settings= require('broke/con/settings'),
				callback= function(urlChangingElement){
					
					var 
						_this= $(this),
						urlAttribute= urlChangingElement.urlAttribute,
						urlToRender= _this.attr(urlAttribute).split('#')[1] || '',
						reverse= require('broke/core/urlresolvers').urlResolvers,
						namedUrl,
						args,
						result
					;
					
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
							
							result= reverse(namedUrl, args);
							_this.attr(urlAttribute, '#' + result);
							
						} catch(e) {
							if(e.name == "NoReverseMatch") {
								return;
							}
						}
					}
				}
			;
			
			forEach(settings.URL_CHANGING_ELEMENTS, function(key){
				var elements= $(key),
					elementsLength= elements.length;
				
				while(elementsLength--) {
					callback.call(elements[elementsLength], this);
				}
			});
		},
		_getLanguageFiles= function(){
			var 
				settings= require('broke/con/settings'),
				languageCode= settings.LANGUAGE_CODE,
				localePath= '/locale/%s/LC_MESSAGES/broke.po'.echo(languageCode),
				localePaths= [
					settings.BASE_URL + '/conf'
				],
				translation= require('broke/utils/translation')
			;
			
			// projects' locale paths
			populate(localePaths, getattr(BROKE_SETTINGS_OBJECT).LOCALE_PATHS);
			
			//localePaths.each(function(){
			forEach(localePaths, function(){
				translation.init({
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
			var
				urlResolvers= require('broke/core/urlresolvers').urlResolvers,
				queryString= urlResolvers.parseQueryString(window.location.href.split('?')[1]),
				cookie= $.cookie(settings.LANGUAGE_COOKIE_NAME),
				langCodeFromCookie
			;
			
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
			var
				settings= require('broke/conf/settings')
			;
			
			// merge settings
			extend(settings, getattr(BROKE_SETTINGS_OBJECT));
			settings.SETTINGS_OBJECT= getattr(BROKE_SETTINGS_OBJECT);
			
			// init project's url patterns
			// TODO: check that
			extend(broke.urlPatterns, getattr(settings.ROOT_URLCONF));
			
			// init installed apps' models
			settings.INSTALLED_APPS= map(settings.INSTALLED_APPS, function(){
				var
					app= this
				;
				
				if(app.constructor == String) {
					app= getattr(this);
				}
				
				// init model's storage
				forEach(app.models, function(key){
					if(this.autoInit) {
						// TODO: check that
						broke.initStorage(this);
					}
				});
				
				if(settings.PRELOAD_REMOTE_TEMPLATES) {
					_preloadRemoteTemplates(app);
				}
				
				return app;
			});
			
			return settings;
		}
	;
	
	__module__= {
		/**************************** VERSION ********************************/
		VERSION: "0.1b",
		
		/************************ SETTINGS OBJECT ****************************/
		BROKE_SETTINGS_OBJECT: null,	// it points to the registered project's settings
										// equivalent of Django's DJANGO_SETTINGS_MODULE
		
		/****************************** INIT *********************************/
		init: function(){
			var 
				gettext= require('broke/utils/translation').gettext,
				exceptions= require('broke/core/exceptions'),
				settings= require('broke/conf/settings'),
				cache= require('broke/core/cache'),
				settings
			;
			
			if(_isReady) {
				// already initialized
				broke.log('Broke has already been initialized! Fail silently...');
				return;
			}
			
			if(!BROKE_SETTINGS_OBJECT) {
				// no settings object defined, fail out loud
				throw exceptions.SettingsObjectNotDefined(gettext('Settings object not defined!'));
			}
			
			// init project
			_initProject();
			
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
			cache.cache= cache.getCache(settings.CACHE_BACKEND);
			
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
			var
				req= {}
			;
			
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
			var
				settings= require('broke/conf/settings')
			;
			
			if(settings.DEBUG && 'console' in window) {
				if(!doNotAppendDate) {
					var now= new Date();
					now= '%s:%s:%s:%s'.echo(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
					debugString= '[%s] %s'.echo(now, debugString);
				}
				
				console.debug(debugString);
			}
		},
		fetchData: function(args){
			var 
				model= args.model,
				settings= settings= require('broke/conf/settings'),
				url= args.url || settings.JSON_URLS.getData.interpolate({
					appLabel: model.appLabel,
					model: model.className.lower()
				}),
				filter= args.filter || {},
				result
			;
			
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
			var 
				localStorageSetObject= function(key, value) {
					this.setItem(key, JSON.stringify(value));
				},
				localStorageGetObject= function(key) {
					return JSON.parse(this.getItem(key));
				},
				storage= {}
			;
			
			if('localStorage' in window) {
				extend(Storage.prototype, {
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
		extend: extend,
		fn: {},
		storage: {},
		shortcuts: {},
		conf: {
			settings: {}
		},
		core: {},
		i18n: {},
		locale: {},
		urlPatterns: [],
		views: {},
		template: {},
		templates: {},
		middleware: {},
		contextProcessors: {}
	};
	
	extend(_, __module__);
})(exports);
