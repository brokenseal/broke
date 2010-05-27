(function(_){
	var
		CacheMiddleware= require('broke/middleware/cache').CacheMiddleware,
		decoratorFromMiddlewareWithArgs= require('broke/utils/decorators').decoratorFromMiddlewareWithArgs
	;
	
	_.cache= {
		cachePage: function(fn, timeout, keyPrefix){
			// temporary work around just to see if it works
			var cache= broke.core.cache.cache,
				decorator= function(request, args){
					
				},
				key= keyPrefix + md5.hex_md5(request),
				cachedPage= cache.get();
			
			/*if() {
				
			} else {
				
			}*/
			cache.set(key, value, timeout);
			
			
		},
		//cachePage: function(fn, timeout, keyPrefix){
		//	keyPrefix= keyPrefix || null;
		//	
		//	return decoratorFromMiddlewareWithArgs(CacheMiddleware)(timeout, keyPrefix)(fn);
		//},
		cacheControl: function(kwargs){
			// TODO
			return null;
		},
		neverCache: function(fn){
			// TODO
			return fn;
		}
	};
})(exports);
