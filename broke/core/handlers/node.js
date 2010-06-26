(function(_){
	var 
		BaseHandler= require('broke/core/handlers/base').BaseHandler
		,http= require('broke/http/http')
		,HttpRequest= http.HttpRequest
		,url= require('url')
		,sys= require('sys')
	;
	
	HttpRequest.extend({
		meta: {
			className: 'NodeRequest',
			parent: _
		}
		,prototype: {
			init: function(request){
				var
					parsedUrl= url.parse(request.url)
				;
				
				this.path= parsedUrl.pathname;
				this.pathInfo= this.path;
			}
		}
	});
	
	BaseHandler.extend({
		meta: {
			className: 'NodeHandler',
			parent: _
		},
		prototype: {
			requestClass: _.NodeRequest
			,__call__: function(environ){
				var
					settings= require('broke/conf/settings')
					,request
					,response= null
					,key
					,statusText
					,status
					,responseHeaders
				;
				
				if(!this._requestMiddleware) {
					this.loadMiddleware();
				}
				// signals.request_started.send(sender=self.__class__)
				// TODO
				
				try {
					request= new this.requestClass(environ);
					response= this.getResponse(request);
					
					// apply response middleware
					for(key in this._responseMiddleware) {
						response= this._responseMiddleware[key](request, response);
					}
					
					//response= this.applyResponseFixes(request, response);
				} catch(e) {
					//require('sys').puts('e: ' + e.message);
					response= new http.HttpResponseBadRequest();
				} finally {
					// signals.request_finished.send(sender=self.__class__)
					// TODO
				}
				
				/*
				try {
					statusText= STATUS_CODE_TEXT[response.statusCode];
					// TODO: check that
				} catch(e) {
					statusText= 'UNKNOWN STATUS CODE';
				}
				status= utils.interpolate("%s %s", response.statusCode, statusText);
				*/
				
				return response;
			}
		}
	});
})(exports);
