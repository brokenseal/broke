(function(__global__){
	var __module__ = broke.core.handlers.browser = {},
		BaseHandler= broke.core.handlers.base.BaseHandler,
		HttpRequest= broke.http.HttpRequest;
	
	BrowserRequest= HttpRequest.extend("broke.core.handlers.browser.BrowserRequest", {
		
	});
	
	BaseHandler.extend("broke.core.handlers.browser.BrowserHandler", {
		requestClass: BrowserRequest
	});
	
	return __module__;
})(this);
