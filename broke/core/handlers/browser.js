(function(__global__){
	var 
		__module__ = broke.core.handlers.browser = {},
		
		BaseHandler= broke.core.handlers.base.BaseHandler,
		HttpRequest= require('broke/http/http.js').HttpRequest,
		BrowserRequest,
		BrowserHandler
	;
	
	BrowserRequest= HttpRequest.extend("broke.core.handlers.browser.BrowserRequest", {
		
	});
	
	BrowserHandler = BaseHandler.extend("broke.core.handlers.browser.BrowserHandler", {
		requestClass: BrowserRequest
	});
	
	return __module__;
})(this);
