(fucntion(_){
	var
		utils= require('broke/core/utils')
		
		,init: function(callback){
			var
				gettext= require('broke/utils/translation').gettext.gettext
				,exceptions= require('broke/core/exceptions')
				,cache= require('broke/core/cache/cache')
				,settings= require('broke/conf/settings')
			;
			
			if(_isReady) {
				// already initialized
				log('Broke has already been initialized! Fail silently...');
				return;
			}
			
			if(!BROKE_SETTINGS_OBJECT) {
				// no settings object defined, fail out loud
				throw new exceptions.SettingsObjectNotDefined(gettext('Settings object not defined!'));
			}
			
			// init project
			settings= _initProject(settings);
			
			if(settings.USE_I18N) {
				// determine the language
				//_setLanguage();
				
				// get language files
				//_getLanguageFiles();
			}
			
			// search for named urls and swap them with fully qualified urls
			//_searchNamedUrls();
			
			// bind events
			//_bindEvents();
			
			// cache init
			//cache.cache= cache.getCache(settings.CACHE_BACKEND);
			
			_isReady= true;
			
			_startListening();
			callback(settings);
		}
		,request: function(){
			
		},
		,_isReady= false
		,_initProject= function(settings){
			var
				utils= require('broke/core/utils'),
				settings= require('broke/conf/settings')
			;
			
			// merge settings
			utils.extend(settings, utils.getCallable(BROKE_SETTINGS_OBJECT));
			settings.SETTINGS_OBJECT= utils.getCallable(BROKE_SETTINGS_OBJECT);
			
			return settings;
		}
		,_startListening= function(){
			var
				http= require('http')
				,response= {}
				,NodeHandler= require('broke/core/handlers/node').NodeHandler
				,requestHandler= new NodeHandler()
				
				,server= http.createServer(function (request, response) {
					// load middleware
					requestHandler.loadMiddleware();
					try {
						body= requestHandler.getResponse(request);
					} catch(e) {
						requestHandler.handleUncaughtException(e);
					}
					
					response.writeHead(200, {
						'Content-type': 'text/html'
						,'Content-length': body.length
					});
					
					response.end(body);
				}); 
			;
			
			server.listen(80, 'localhost');
		}
	;
	
	utils.extend(_, {
		init: init
	});
})(exports);
