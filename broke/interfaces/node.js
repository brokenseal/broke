(function(_){
	var
		utils= require('broke/core/utils')
		,sys= require('sys')
		
		,init= function(callback){
			var
				gettext= require('broke/utils/translation').gettext.gettext
				,exceptions= require('broke/core/exceptions')
				,cache= require('broke/core/cache/cache')
				,settings= require('broke/conf/settings').settings
			;
			
			if(_isReady) {
				// already initialized
				sys.puts('Broke has already been initialized! Fail silently...\n');
				return;
			}
			
			if(settings.USE_I18N) {
				// determine the language
				//_setLanguage();
				
				// get language files
				//_getLanguageFiles();
			}
			
			// cache init
			//cache.cache= cache.getCache(settings.CACHE_BACKEND);
			
			_isReady= true;
			
			_startListening();
			
			if(callback) {
				callback(settings);
			}
		}
		,_isReady= false
		,_startListening= function(){
			var
				http= require('http')
				,response= {}
				,NodeHandler= require('broke/core/handlers/node').NodeHandler
				,requestHandler= new NodeHandler()
				
				,server= http.createServer(function (request, response) {
					var
						brokeResponse= requestHandler(request)
						,statusCode= brokeResponse.statusCode
						,body= brokeResponse.getContent()
						,headers= {}
						,name
					;
					
					for(name in brokeResponse._headers){
						headers[brokeResponse._headers[name][0]]= brokeResponse._headers[name][1];
					}
					
					headers['content-length']= headers['content-length'] || body.length;
					
					response.writeHead(statusCode, headers);
					response.write(body);
					response.end();
				}); 
			;
			
			server.listen(8080, 'localhost');
		}
	;
	
	utils.extend(_, {
		init: init
	});
})(exports);
