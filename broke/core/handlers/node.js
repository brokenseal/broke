(function(_){
	var 
		BaseHandler= require('broke/core/handlers/base').BaseHandler
		,http= require('broke/http/http')
		,HttpRequest= http.HttpRequest
		,url= require('url')
		,sys= require('sys')
		,utils= require('broke/core/utils')
	;
	
	HttpRequest.create({
		__name__: 'NodeRequest'
		,__parent__: _
		,__init__: function(nodeRequest){
			var
				parsedUrl= url.parse(nodeRequest.url)
			;
			this._super(nodeRequest);
			
			this.initMeta(nodeRequest);
			
			this.method= nodeRequest.method;
			this.path= parsedUrl.pathname;
			this.pathInfo= this.path;
			
			this._isSecure= nodeRequest.connection.secure;
		}
		,initMeta: function(nodeRequest){
			var
				_this= this
			;
			
			this.META= {
				CONTENT_TYPE: nodeRequest.headers['accept'] // not sure about that...
				,CONTENT_LENGTH: 0 // not sure about that...
				,REMOTE_ADDR: nodeRequest.client.remoteAddr
				,REMOTE_PORT: nodeRequest.client.remotePort
				
				,SERVER_ADDRESS: nodeRequest.connection.remoteAddr
				,SERVER_PORT: nodeRequest.connection.remotePort
			};
			
			utils.forEach(nodeRequest.headers, function(key){
				key= 'HTTP_'.concat(key.toUpperCase().replace('-', '_'));
				_this.META[key] = this;
			});
		}
	});
	
	BaseHandler.create({
		__name__: 'NodeHandler'
		,__parent__: _
		,requestClass: _.NodeRequest
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
				require('sys').puts('e: ' + e.message);
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
	});
})(exports);
