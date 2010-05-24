(function(__global__){
	var
		__module__= {},
		
		settings= broke.conf.settings,
		cache= broke.core.cache.cache,
		translation= broke.utils.translation,
		_generateCacheHeaderKey= function(keyPrefix, request){
			//var path= md5.hex_md5(request.path);
			var path= md5.hex_md5(request.url),
				cacheKey= 'views.decorators.cache.cache_header.%s.%s'.echo(keyPrefix, path);
			
			if(settings.USE_I18N) {
				cacheKey+= '.%s'.echo(translation.getLanguage());
			}
			
			return cacheKey;
		},
		_generateCacheKey= function(request, headerList, keyPrefix){
			var ctx= '',
				path= md5.hex_md5(request.url),
				cacheKey;
			
			//headerList.each(function(){
			forEach(headerList, function(){
				var value= request.META[this] || null;
				if(value !== null) {
					ctx+= value;
				}
			});
			
			cacheKey= 'views.decorators.cache.cache_page.%s.%s.%s'.echo(keyPrefix, md5.hex_md5(path), md5.hex_md5(ctx));
			
			if(settings.USE_I18N) {
				cacheKey+= '.%s'.echo(translation.getLanguage());
			}
			
			return cacheKey;
		}
	;
	
	__module__= {
		getCacheKey: function(request, keyPrefix){
			var cacheKey,
				headerList;
			
			if(keyPrefix === undefined) {
				keyPrefix= settings.CACHE_MIDDLEWARE_KEY_PREFIX;
			}
			
			cacheKey= _generateCacheHeaderKey(keyPrefix, request);
			headerList= cache.get(cacheKey, null);
			
			if(headerList !== null) {
				return _generateCacheKey(request, headerList, keyPrefix);
			} else {
				return null;
			}
		},
		learnCacheKey: null,
		patchResponseHeaders: null,
		getMaxAge: null
	};
	
	return __module__;
})();
