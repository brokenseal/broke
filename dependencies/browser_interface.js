(function(_){
	var 
		broke= require('broke/broke'),
		utils= require('broke/core/utils'),
		settings= require('broke/conf/settings'),
		
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
						request({
							event: e,
							url: url.split('#')[1],
							completeUrl: url,
							type: type
						});
					}
				};
				
				// collect all the url changing elements
				utils.forEach(settings.URL_CHANGING_ELEMENTS, function(key){
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
					request({
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
				settings= require('broke/conf/settings'),
				callback= function(urlChangingElement){
					
					var
						_this= $(this),
						urlAttribute= urlChangingElement.urlAttribute,
						urlToRender= _this.attr(urlAttribute).split('#')[1] || '',
						reverse= require('broke/core/urlresolvers').reverse,
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
							
							result= reverse(namedUrl, args, myProject.apps.blog.urlPatterns);
							_this.attr(urlAttribute, '#' + result);
							
						} catch(e) {
							if(e.name == "NoReverseMatch") {
								return;
							}
						}
					}
				}
			;
			
			utils.forEach(settings.URL_CHANGING_ELEMENTS, function(key){
				var elements= $(key),
					elementsLength= elements.length;
				
				while(elementsLength--) {
					callback.call(elements[elementsLength], this);
				}
			});
		},
		_getLanguageFiles= function(){
			var 
				settings= require('broke/conf/settings'),
				languageCode= settings.LANGUAGE_CODE,
				localePath= '/locale/%s/LC_MESSAGES/broke.po'.echo(languageCode),
				localePaths= [
					settings.BASE_URL + '/conf'
				],
				translation= require('broke/utils/translation')
			;
			
			// projects' locale paths
			localePaths= localePaths.concat(utils.getattr(BROKE_SETTINGS_OBJECT, window).LOCALE_PATHS);
			
			//localePaths.each(function(){
			utils.forEach(localePaths, function(){
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
				urlResolvers= require('broke/core/urlresolvers'),
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
			utils.extend(settings, utils.getattr(BROKE_SETTINGS_OBJECT, window));
			settings.SETTINGS_OBJECT= utils.getattr(BROKE_SETTINGS_OBJECT, window);
			
			// init project's url patterns
			// TODO: check that
			utils.extend(broke.urlPatterns, utils.getattr(settings.ROOT_URLCONF, window));
			
			// init installed apps' models
			settings.INSTALLED_APPS= utils.map(settings.INSTALLED_APPS, function(){
				var
					app= this
				;
				
				if(app.constructor == String) {
					app= utils.getattr(this, window);
				}
				
				// init model's storage
				utils.forEach(app.models, function(key){
					if(this.autoInit) {
						// TODO: check that
						initStorage(this);
					}
				});
				
				if(settings.PRELOAD_REMOTE_TEMPLATES) {
					_preloadRemoteTemplates(app);
				}
				
				return app;
			});
			
			return settings;
		},
		init= function(){
			var 
				gettext= require('broke/utils/translation').gettext,
				exceptions= require('broke/core/exceptions'),
				cache= require('broke/core/cache/cache'),
				settings= require('broke/conf/settings')
			;
			
			if(_isReady) {
				// already initialized
				log('Broke has already been initialized! Fail silently...');
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
				//_setLanguage();
				
				// get language files
				//_getLanguageFiles();
			}
			
			// search for named urls and swap them with fully qualified urls
			_searchNamedUrls();
			
			// bind events
			_bindEvents();
			
			// cache init
			cache.cache= cache.getCache(settings.CACHE_BACKEND);
			
			// on broke init, check if there is an url to request
			if(window.location.hash !== '') {
				request(window.location.hash.split('#')[1]);
			}
			
			$(window).trigger('broke.ready');
			_isReady= true;
		},
		isReady= function(){
			return _isReady;
		},
		/************************* REQUEST SHORTCUT **************************/
		request= function(args){
			var
				req= {}
			;
			
			if(utils.typeOf(args) === 'string') {
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
		response= function(args){
			$(window).trigger('broke.request', [args]);
		},
		
		/*********************************************************************/
		removeHash= function(){
			window.location.hash= '';
			return true;
		},
		log= function(debugString, doNotAppendDate){
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
		fetchData= function(args){
			var 
				model= args.model,
				settings= settings= require('broke/conf/settings'),
				url= args.url || settings.JSON_URLS.getData.interpolate({
					appLabel: model.appLabel,
					model: model.name.lower()
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
					storage[model.tableName]= data;
					
					result= storage[model.tableName];
				}
			});
			
			return result;
		},
		initStorage= function(model){
			fetchData({
				'model': model
			});
		},
		storage= {}
	;
	
	utils.extend(utils, {
		storage: (function(){
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
		})()
	});
	
	utils.extend(settings, {
		EVENT_BINDING: 'live',			// bind|live
										// it should always be set to 'live' but
										// at the current stage jQuery's live
										// method does not always work properly
		
			
		// 'EVENT_TRIGGERING_METHOD' determines the way to trigger the
		// broke.request event
		// WARNING: hashChange will work with an interval of 150ms on old browsers
		// on more recent browsers will make use of the 'onhashchange' event
		// which, by the time of the writing, it is only available on Firefox 3.6 and IE8
		// as for the 'elements' method please refer to the documentation under the
		// 'events' topic
		// choices are: elements, hashchange
		EVENT_TRIGGERING_METHOD: 'elements',
		
		FORM: null,						// default operation form
		
		HASHCHANGE_INTERVAL: 150,		// interval in milliseconds for the
										// hashchange method to check for a changed
										// url
										// it's effective only if you've selected
										// 'eventTriggeringMethod' as 'hashchange'
										// and your browser does not support
										// the 'onhashchange' event
		
		HIDE_HASH: false,				// whether you want the hash to be hidden
										// from the main url
										// careful: it will prevent any default action
										// from the browser from your event
										// equivalent of doing 'event.preventDefault();'
		
		'RETURN': window.location.href	// form return url
	});
	
	// on DOM ready
	$(function(){
		init();
	});
	
	/*
	 * Request event handling
	 * broke.request
	 * 
	 */
	
	$(window).bind('broke.request', function(e, requestData){
		var 
			utils= require('broke/core/utils'),
			response= {},
			view= null,
			args= null,
			urlMatchResult= [],
			partialUrl,
			target,
			
			urlResolvers= require('broke/core/urlresolvers'),
			parseQueryString= urlResolvers.parseQueryString,
			queryString= {},
			resolve= urlResolvers.resolve,
			BrowserHandler= require('broke/core/handlers/browser').BrowserHandler,
			requestHandler= new BrowserHandler()
		;
		
		// load middleware
		requestHandler.loadMiddleware();
		try {
			response= requestHandler.getResponse(requestData);
		} catch(e) {
			requestHandler.handleUncaughtException(e);
		}
		
		$(window).trigger('broke.response', [response]);
	});
	
	/*
	 * Response event handling
	 * broke.response
	 * 
	 */
	$(window).bind('broke.response', function(e, response){
		var
			utils= require('broke/core/utils')
		;
		
		// apply additional properties
		utils.forEach(response.additionalProperties, function(key){
			response.element[key]= this;
		});
		
		// apply callback
		if(utils.typeOf(response.callback) === 'function') {
			response.callback.apply(response.element);
		}
		
		// --------- middleware fetching in reverse order ---------
		utils.forEach(broke.conf.settings.MIDDLEWARE_CLASSES.reverse(), function(){
		
			var
				middleware= utils.getattr(this, window)
			;
			
			if(middleware.processResponse !== undefined) {
				middleware.processResponse(response);
			}
		});
	});
})();
