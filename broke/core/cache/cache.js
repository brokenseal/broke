(function(_){
	var
		utils= require('broke/core/utils'),
		InvalidCacheBackendError= require('broke/core/exceptions').InvalidCacheBackendError,
		settings= require('broke/conf/settings'),
		BACKENDS= {
				localStorage: 'localStorage'
//				localDatabase: 'localDatabase'
		},
		parseBackendUri= function(backendUri){
			var result= {};
			
			// TODO: throw errors
			backendUri= backendUri.split('://');
			result.scheme= backendUri[0];
			
			backendUri= backendUri[0].split('?');
			
			result.host= backendUri[0];
			result.params= broke.urlResolvers.parseQueryString(backendUri[1]);
			
			return result;
		},
		getCache= function(backendUri){
			var args= parseBackendUri(backendUri),
				name,
				cacheClass;
			
			if(args.scheme in this.BACKENDS) {
				name= 'broke.core.cache.backends.%s'.echo(args.scheme);
			} else {
				name= args.scheme;
			}
			
			cacheClass= utils.getattr(name + '.CacheClass');
			
			return new cacheClass(args);
		},
		cache= null
	;
	
	_.BACKENDS= BACKENDS;
	_.parseBackendUri= parseBackendUri;
	_.getCache= getCache;
	_.cache= cache;
})(exports);
