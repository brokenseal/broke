(function(_){
	var 
		BaseHandler= require('broke/core/handlers/base').BaseHandler
		,HttpRequest= require('broke/http/http').HttpRequest
	;
	
	HttpRequest.extend({
		meta: {
			className: 'NodeRequest',
			parent: _
		}
	});
	
	BaseHandler.extend({
		meta: {
			className: 'NodeHandler',
			parent: _
		},
		prototype: {
			requestClass: _.NodeRequest
		}
	});
})(exports);
