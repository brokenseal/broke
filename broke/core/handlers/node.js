(function(_){
	var 
		BaseHandler= require('broke/core/handlers/base').BaseHandler
		,http= require('broke/http/http')
		,HttpRequest= http.HttpRequest
		,url= require('url')
		,sys= require('sys')
		,utils= require('broke/core/utils')
		,encoding= require('broke/utils/encoding')
		,iriToUri= encoding.iriToUri
	;
	
	HttpRequest.create({
		__name__: 'NodeRequest'
		,__parent__: _
		,__init__: function(nodeRequest){
			var
				parsedUrl= url.parse(nodeRequest.url)
			;
			this._super(nodeRequest);
			
			this.nodeRequest= nodeRequest;
			this.initMeta(nodeRequest);
			
			this.method= nodeRequest.method;
			this.parsedUrl= parsedUrl;
			this.path= parsedUrl.pathname;
			this.pathInfo= this.path;
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
		,isSecure: function(){
			return this.nodeRequest.connection.secure;
		}
		,getFullPath: function(){
			// RFC 3986 requires query string arguments to be in the ASCII range.
			// Rather than crash if this doesn't happen, we encode defensively.
			return utils.interpolate('%s%s', this.path, (this.parsedUrl.query || '') ? ('?' + iriToUri((this.parsedUrl.query || ''))) : '');
		}
		,_loadPostAndFiles: function(){
			// Populates self._post and self._files
			if(this.method == 'POST') {
				if(0) {
					 // TODO
				} else {
					
				}
			} else {
				[ this._post, this._files ] = [ http.QueryDict(''), datastructures.MultiValueDict() ];
			}
		}
		/*,get GET() {
			if(!('_get' in this)) {
				this._get= http.QueryDict(this.parsedUrl.query, this._encoding);
			}
			
			return this._get;
		}
		,set GET(get) {
			this._get= get;
		}
		,get POST() {
			if(!('_post' in this)) {
				this._loadPostAndFiles();
			}
			
			return this._post;
		}
		,set POST(post) {
			this._post= post;
		}
		,get FILES() {
			if(!('_files' in this)) {
				this._loadPostAndFiles();
			}
			
			return this._files;
		}
		,set FILES(files) {
			this._files= files;
		}
		,get REQUEST() {
			if(!('_request' in this)) {
				this._request= datastructures.MergeDict(this.POST, this.GET);
			}
			
			return this._request;
		}
		,set REQUEST(request) {
			this._request= request;
		}*/
		/*,get COOKIES() {
			if(!('_cookies' in this)) {
				this._cookies= http.parseCookie();
			}
			
			return this._cookies;
		}
		,set COOKIES(cookies) {
			this._cookies= cookies;
		}*/
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
