(function(__global__){
	var
		require,
		moduleCache= {},
		getModule
	;
	
	if(__global__.require){
		return __global__.require;
	}
	
	getModule= function(constructedPath){
		var
			module
		;
		
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
	
	require.paths= [];
	
	__global__.require = require;
	return require;
	
})(this);