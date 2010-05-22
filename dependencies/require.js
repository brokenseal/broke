(function(__global__){
	var
		require,
		moduleCache= {},
		getModule,
		cacheTimeout= 30 * 24 * 60 * 60 * 1000 // 30 days
	;
	
	if(__global__.require){
		return __global__.require;
	}
	
	require= function(path, forceLoading){
		// support slash notation only
		var
			url,
			i,
			len= require.paths.length,
			searchPath,
			requirePath,
			module
		;
		
		if(path in moduleCache && !forceLoading){
			return moduleCache[path];
		}
		
		if(path.match('^./')) {
			
			searchPath= path.slice(1);
			
			module= getModule(searchPath);
			
		} else {
			
			for(i= 0; i< len; i++) {
				
				requirePath= require.paths[i];
				
				if(!requirePath.match("/$")){
					requirePath+= "/";
				}
				
				searchPath= requirePath + path;
				
				module= getModule(searchPath);
				
				if(module){
					break;
				}
			}
			
		}
		
		if(module){
			moduleCache[path]= module;
		}
		
		return module;
	}
	
	// initialize an empty array to collect all the possible search paths
	require.paths= [];
	require.cacheTimeout= cacheTimeout;
	
	getModule= function(constructedPath){
		var
			module
		;
		
		if(!constructedPath.match('.js$')) {
			constructedPath+= ".js";
		}
		
		$.ajax({
			async: false,
			url: constructedPath,
			dataType: "text",
			success: function(responseText){
				
				(function(){
					module= eval(responseText);
				}).call(__global__);
				
			}
		});
		
		return module;
	}
	
	/*
	moduleCache= (function(){
		
		return {
			set: function(){
				
			},
			get: function(){
				
			},
			clear: function(){
				
			}
		}
	})();
	*/
	
	// make ti accessible from the outside
	__global__.require = require;
	
	// return itself let a different require function require this module
	return require;
	
})(this);
