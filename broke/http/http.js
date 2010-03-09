(function(__global__){
	var __module__ = broke.http = {},
		Class= broke.Class,
		settings= broke.conf.settings,
		absoluteHttpUrlRe= new RegExp("^https?://", "i"),
		RESERVED_CHARS= "!*'();:@&=+$,/?%#[]";
	
	__module__= {
		Http404: function(message){
			return {
				name: "Http404",
				message: message
			};
		}
	};
	
	Class.extend("broke.http.HttpResponse", {
		_encoding: null,
		_uploadHandlers: []
	}, {
		init: function(){
			this.GET = {};
			this.POST = {};
			this.COOKIES = {};
			this.META = {};
			this.FILES = {};
			
			this.path= '';
			this.pathInfo= '';
			this.method= null;
		},
		getHost: function(){
			// Returns the HTTP host using the environment or request headers.
			// We try three options, in order of decreasing preference.
			var host,
				serverPort;
			
			if('HTTP_X_FORWARDED_HOST' in this.META) {
				host= this.META.HTTP_X_FORWARDED_HOST;
			} else if('HTTP_HOST' in this.META) {
				host= this.META.HTTP_HOST;
			} else {
				// Reconstruct the host using the algorithm from PEP 333.
				host= this.META.SERVER_NAME;
				serverPort= this.META.SERVER_PORT;
				
				if(serverPort != (this.isSecure() ? '443' : '80')) {
					host= '%s:%s'.echo(host, serverPort);
				}
			}
			
			return host;
		},
		getFullPath: function(){
			return '';
		},
		buildAbsoluteUri: function(location){
			/*
				Builds an absolute URI from the location and the variables available in
				this request. If no location is specified, the absolute URI is built on
				``request.get_full_path()``.
			*/
			var currentUri;
			
			if(location === undefined) {
				location= this.getFullPath();
			}
			if(!(location.match(absoluteHttpUrlRe))) {
				currentUri='%s://%s%s'.echo((this.isSecure() ? 'https' : 'http'), this.getHost(), this.path);
				location= urlJoin(currentUri, location);
			}
74	            location = urljoin(current_uri, location)
75	        return iri_to_uri(location)
		},
		toString: function(){
			return '<HttpRequest\nGET:%s,\nPOST:%s,\nCOOKIES:%s,\nMETA:%s>'.echo(this.GET, this.POST, this.COOKIES, this.META);
		}
	});
	
	return __module__;
})(this);
