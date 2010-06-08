(function(_){
	var 
		BaseHandler= require('broke/core/handlers/base').BaseHandler,
		HttpRequest= require('broke/http/http').HttpRequest,
		BrowserRequest,
		BrowserHandler
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
		}
	});
})(exports);
