(function(_){
	var
		utils= require('broke/core/utils')
		,gettext= require('dependencies/gettext').gettext
		,urlresolvers= require('broke/core/urlresolvers')
		,ImproperlyConfigured= require('broke/core/exceptions').ImproperlyConfigured
		,include
		,urls
		,patterns
	;
	
	include= function(arg, namespace, appName){
		var
			urlConfModule
		;
		
		if(utils.typeOf(arg) == "array") {
			// callable returning a namespace hint
			if(namespace) {
				throw new ImproperlyConfigured(gettext('Cannot override the namespace for a dynamic module that provides a namespace'));
			}
			
			urlConfModule= arg[0];
			appName= arg[1];
			namespace= arg[2];
		} else {
			// No namespace hint - use manually provided namespace
			urlConfModule= arg;
		}
		
		return [ urlConfModule, appName, namespace ];
	};
	
	patterns= function(prefix){
		var
			args= Array.prototype.slice.call(arguments).slice(1)
			,patternList= []
			,i
			,len= args.length
			,arg
		;
		
		for(i= 0; i< len; i++) {
			arg= args[i];
			
			if(utils.typeOf(arg) == "array") {
				// bad fix, do it better!
				if(!arg[2]) {
					arg[2]= null;
				}
				if(!arg[3]) {
					arg[3]= null;
				}
				arg[4]= prefix || null;
				
				arg= url.apply(this, arg);
			} else if(arg instanceof urlresolvers.RegexURLPattern) {
				arg.addPrefix= prefix;
			}
			
			patternList.push(arg);
		}
		
		return patternList;
	};
	
	url= function(regex, view, kwargs, name, prefix){
		var
			urlConfModule
			,appName
			,namespace
		;
		
		if(utils.typeOf(view) == "array") {
			// for include( ... ) processing
			urlConfModule= view[0];
			appName= view[1];
			namespace= view[2];
			
			// TODO: check that
			return new urlresolvers.RegexURLResolver(regex, urlConfModule, kwargs, appName, namespace);
		} else {
			if(utils.typeOf(view) == "string") {
				if(!view) {
					throw new ImproperlyConfigured(utils.interpolate(gettext('Empty URL pattern view name not permitted (for pattern %r)'), regex));
				}
				if(prefix) {
					view= prefix + '.' + view;
				}
			}
			
			return new urlresolvers.RegexURLPattern(regex, view, kwargs, name);
		}
	};
	
	utils.extend(_, {
		handler404: 'django.views.defaults.page_not_found'
		,handler500: 'django.views.defaults.server_error'
		,include: include
		,url: url
		,patterns: patterns
	});
})(exports);
