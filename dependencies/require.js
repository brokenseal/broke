/*
 * A require function compatible to the one built into nodejs
 * Supports slash notation only
 *
 * -- Usage --
 * Given a Javascript file written this way:
 * 	- /media/js/myjs.js
 * 	(function(_){
 *		exports.myAlert= function(){ alert(arguments[0]) };
 * 	})(exports);
 * 	
 *	var myModule= require('./media/js/myjs.js');
 *	myModule.myAlert('yay!'); // will alert "yay!"
 *
 * Or if you want to use the require.paths:
 * 	require.paths.push('/media/js/');
 *	var myModule= require('myjs.js');
 *	myModule.myAlert('yay!'); // will alert "yay!"
 * 
 *
 * MIT License
 */

(function(__global__){
	var
		require,
		getModule,
		buildPath,
		storage,
		moduleCache= {},
		cacheTimeout= 30 * 24 * 60 * 60 * 1000 // 30 days
	;
	
	if(__global__.require){
		return __global__.require;
	}
	
	require= function(path, forceLoading){
		var
			url,
			i,
			len,
			searchPath,
			requirePath,
			module
		;
		
		if(path.match('^./')) {
			
			// take out the dot at the beginning
			searchPath= path.slice(1);
			
			// get the module
			module= getModule(searchPath, forceLoading);
			
		} else {
			len= require.paths.length;
			
			// cycle through all the given paths
			for(i= 0; i< len; i++) {
				
				requirePath= require.paths[i];
				
				if(!requirePath.match("/$")){
					requirePath+= "/";
				}
				
				// build the absolute path
				searchPath= requirePath + path;
				
				// get the module
				module= getModule(searchPath, forceLoading);
				
				// if the module has been found, break the for cycle
				if(module){
					break;
				}
			}
			
		}
		
		return module;
	};
	
	require.init= function(){
		var
			cacheTimeStampKey= '__require__cache__timestamp__',
			cacheTimestamp,
			currentTimeStamp= (new Date()).getTime()
		;
		
		// debug, for developers only
		require.debug= false;
		
		// initialize an empty array to collect all the possible search paths
		require.paths= [];
		require.cacheTimeout= cacheTimeout;
		
		// initialize and eventually clear the local storage cache
		cacheTimeStamp= storage.getItem(cacheTimeStampKey);
		
		if(!cacheTimeStamp) {
			// redundant?
			cacheTimeStamp= storage.setItem(cacheTimeStampKey, currentTimeStamp + cacheTimeout);
		}
		
		if(parseInt(cacheTimeStamp) < currentTimeStamp) {
			storage.clear();
			
			// redundant?
			storage.setItem(cacheTimeStampKey, currentTimeStamp + cacheTimeout);
		}
	};
	
	getModule= function(path, forceLoading){
		var
			module,
			moduleAsString,
			len,
			i,
			objAsArray,
			obj= __global__
		;
		
		// if require is set on debug mode, force reloading of the script every time
		if(require.debug) {
			forceLoading= true;
		}
		
		// normalize path
		path= buildPath(path);
		
		// try to get the module from the module cache
		module= moduleCache[path];
		
		if(module && !forceLoading) {
			return module;
		}
		
		// try to get the module from the local environment
		// in case we already have the object we are trying to load
		objAsArray= path.split('/').slice(1);
		objAsArray.push(objAsArray.pop().replace('.js', ""));
		len= objAsArray.length;
		
		try {
			for(i= 0; i< len; i++) {
				obj= obj[objAsArray[i]];
			}
			
			// if no errors happened, then the right object has been found
			module= obj;
		} catch(e) {
			
			// try to get the module from the local cache
			moduleAsString= storage.getItem(path);
			
			// if the module exists and force loading is not set or set to false
			// do not load the module again
			if(moduleAsString && !forceLoading){
				module= evaluateModule(moduleAsString);
			} else {
				$.ajax({
					async: false,
					url: path,
					dataType: "text",
					success: function(responseText){
						moduleAsString= responseText;
						module= evaluateModule(moduleAsString);
					}
				});
			}
			
			if(moduleAsString){
				storage.setItem(path, moduleAsString);
			}
		}
		
		if(module){
			moduleCache[path]= module;
		}
		
		return module;
	};
	
	evaluateModule= function(moduleAsString){
		var
			exports= {}
		;
		
		// evaluate the given script module
		eval(moduleAsString);
		
		// export the module
		return exports;
	};
	
	storage= (function(){
		var
			storage= {}
		;
		
		if('localStorage' in __global__) {
			
			return __global__.localStorage;
		}
		
		return {
			key: function(key){
				throw {
					name: "NotImplementedError",
					description: "Sorry, this version of localStorage is a fake and does not support key() method."
				};
			},
			setItem: function(key, value){
				storage[key]= value;
				return this;
			},
			getItem: function(key){
				return storage[key];
			},
			removeItem: function(key){
				delete storage[key];
				return this;
			},
			clear: function(){
				storage= {};
				return this;
			}
		};
	})();
	
	buildPath= function(path){
		if(!path.match('.js$')) {
			path+= ".js";
		}
		
		return path;
	};
	
	require.init();
	
	// make ti accessible from the outside
	__global__.require = require;
	
})(this);
