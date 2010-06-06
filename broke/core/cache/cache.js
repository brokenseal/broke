(function(_){
	var
		parseQueryString= require('broke/core/urlresolvers').parseQueryString,
		utils= require('broke/core/utils'),
		InvalidCacheBackendError= require('broke/core/exceptions').InvalidCacheBackendError,
		settings= require('broke/conf/settings'),
		
		BACKENDS= {
				local_storage: 'local_storage'
//				localDatabase: 'localDatabase'
		},
		parseBackendUri= function(backendUri){
			var result= {};
			
			// TODO: throw errors
			backendUri= backendUri.split('://');
			result.scheme= backendUri[0];
			
			backendUri= backendUri[0].split('?');
			
			result.host= backendUri[0];
			result.params= parseQueryString(backendUri[1]);
			
			return result;
		},
		getCache= function(backendUri){
			var
				args= parseBackendUri(backendUri),
				name,
				cacheClass
			;
			
			if(args.scheme in this.BACKENDS) {
				name= 'broke.core.cache.backends.%s'.echo(args.scheme);
			} else {
				name= args.scheme;
			}
			
			module= require(name.replace(/\./g, '/'));
			
			cacheClass= utils.getattr('CacheClass', module);
			
			return new cacheClass(args);
		},
		cache= null
	;
	
	utils.extend(_, {
		BACKENDS: BACKENDS,
		parseBackendUri: parseBackendUri,
		getCache: getCache,
		cache: cache
	});
})(exports);
