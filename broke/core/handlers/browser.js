(function(_){
	var 
		BaseHandler= require('broke/core/handlers/base').BaseHandler
		,http= require('broke/http/http')
		,HttpRequest= http.HttpRequest
		,BrowserRequest
		,BrowserHandler
	;
	
	BrowserRequest= HttpRequest.extend({
		meta: {
			className: 'BrowserRequest',
			parent: _
		}
	});
	
	BrowserHandler = BaseHandler.extend({
		meta: {
			className: 'BrowserHandler',
			parent: _
		},
		prototype: {
			requestClass: BrowserRequest
			,__call__: function(environ){
				var
					settings= require('broke/conf/settings')
					,request
					,response
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
				
				debugger;
				try {
					request= this.requestClass(environ);
					response= this.getResponse(request);
					
					// apply response middleware
					for(key in this._responseMiddleware) {
						response= this._responseMiddleware[key](request, response);
					}
					
					//response= this.applyResponseFixes(request, response);
				} catch(e) {
					response= http.HttpResponseBadRequest();
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
				status= "%s %s".echo(response.statusCode, statusText);
				*/
				return response;
			}
		}
	});
})(exports);
