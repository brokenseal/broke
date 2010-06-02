(function(_){
	var 
		settings= require('broke/conf/settings'),
		GenericError= require('broke/core/exceptions').GenericError,
		gettext= require('broke/utils/translation').gettext,
		
		cache= require('broke/core/cache/cache').cache,
		getCacheKey= require('broke/utils/cache').getCacheKey,
		//learnCacheKey= broke.utils.cache.learnCacheKey,
		//patchResponseHeaders= broke.utils.cache.patchResponseHeaders,
		//getMaxAge= broke.utils.cache.getMaxAge,
		
		Class= require('depencencies/class').Class
	;
	
	Class.extend({
		meta: {
			name: 'CacheMiddleware',
			parent: _
		},
		prototype: {
			init: function(){
				this.cacheTimeout= settings.CACHE_MIDDLEWARE_SECONDS;
				this.keyPrefix= settings.CACHE_MIDDLEWARE_KEY_PREFIX;
				this.cacheAnonymousOnly= settings.CACHE_MIDDLEWARE_ANONYMOUS_ONLY || false;
			},
			processRequest: function(request){
				var response,
					cacheKey;
				
				if(this.cacheAnonymousOnly && !('user' in request)) {
					throw new GenericError(gettext("The Broke cache middleware with CACHE_MIDDLEWARE_ANONYMOUS_ONLY=True requires authentication middleware to be installed. Edit your MIDDLEWARE_CLASSES setting to insert 'broke.contrib.auth.middleware.AuthenticationMiddleware' before the CacheMiddleware."));
				}
				
				//if(['GET', 'HEAD'].has(request.method) || request.GET) {
				if(!['GET', 'HEAD'].has(request.method)) {
					request._cacheUpdateCache= false;
					return null;
				}
				
				//if(this.cacheAnonymousOnly && request.user.isAuthenticated()) {
				//	request._cacheUpdateCache= false;
				//	return null;
				//}
				
				cacheKey= getCacheKey(request, this.keyPrefix);
				if(cacheKey === null) {
					request._cacheUpdateCache= true;
					return null;
				}
				
				response= cache.get(this.cacheKey, null);
				if(response === null) {
					request._cacheUpdateCache= true;
					return null;
				}
				
				request._cacheUpdateCache= false;
				
				//return response; ???
				return request;
			},
			processResponse: function(request, response){
				var timeout,
					cacheKey;
				
				// TODO: fix this
				// temporary work around
				if(!response) {
					response= request;
				}
				
				if(!('_cacheUpdateCache' in response) || response._cacheUpdateCache == null) {
					return response;
				}
				if(request.method != 'GET') {
					return response;
				}
				if(response.statusCode != 200) {
					return response;
				}
				
				//timeout= getMaxAge(response);
				timeout = null;
				
				if(timeout === null) {
					timeout= this.cacheTimeout;
				} else if(timeout === 0) {
					return response;
				}
				//patchResponseHeaders(response, timeout);
				
				if(timeout) {
					cacheKey= getCacheKey(response, timeout, this.keyPrefix);
					cache.set(cacheKey, response, timeout);
				}
				
				return response;
			}
		}
	});
	
	_.CacheMiddleware.extend({
		meta: {
			name: 'UpdateCacheMiddleware',
			parent: _
		},
		prototype: {
			init: function(){
				_this.super();
			},
			processRequest: function(){}
		}
	});
	
	_.CacheMiddleware.extend({
		meta: {
			name: 'FetchFromCacheMiddleware',
			parent: _
		},
		prototype: {
			init: function(){
				_this.super();
			},
			processResponse: function(){}
		}
	});
})(exports);
