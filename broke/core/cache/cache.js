(function(){
	var InvalidCacheBackendError= broke.exceptions.InvalidCacheBackendError,
		settings= broke.conf.settings,
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
				name;
			
			if(args.scheme in this.BACKENDS) {
				name= 'broke.core.cache.backends.%s'.echo(args.scheme);
			} else {
				name= args.scheme;
			}
			
			return new getattr(name + '.CacheClass')(args);
		},
		cache= null;
	
	broke.extend(broke.core, {
		cache: {
			BACKENDS: BACKENDS,
			parseBackendUri: parseBackendUri,
			getCache: getCache,
			cache: cache
		}
	});
})();
