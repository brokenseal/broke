(function(_){
	var 
		utils= require('broke/core/utils'),
		extend= require('broke/core/utils').extend,
		gettext= require('broke/utils/translation').gettext,
		NoReverseMatch= require('broke/core/exceptions').NoReverseMatch,
		__module__= {}
	;
	
	__module__= {
		patterns: function(prefix, urlPatterns) {
			urlPatterns= utils.map(urlPatterns, function(){
				if(typeof this[1] === "string") {
					this[1]= utils.getattr(prefix + "." + this[1]);
				}
				return this;
			});
			
			return urlPatterns;
		},
		include: function(urlObject){
			if(typeof urlObject === "string") {
				return utils.getattr(urlObject);
			}
			return urlObject;
		},
		parseQueryString: function(queryString){
			var result= {};
			if(!queryString) {
				return {};
			}
			
			queryString= queryString.split('&');
			
			//queryString.each(function(){
			utils.forEach(queryString, function(){
				var tmp= this.split('=');
				result[tmp[0]]= tmp[1];
			});
			
			return result;
		},
		resolve: function(url, args, urlPatterns) {
			var view= null,
				match= null,
				i,
				_this;
			
			urlPatterns= urlPatterns || broke.urlPatterns;
			args= args || [];
			
			for(i= 0; i< urlPatterns.length; i++) {
				_this= urlPatterns[i];
				
				match= url.match(_this[0]);
				
				if(match) {
					if(match.length > 1) {
						args= args.concat(match.slice(1));
					}
					view= _this[1];
					
					if(utils.typeOf(view) === "string") {
						view= utils.getattr(view);
					}
					
					if(isFunction(view)) {
						
						return [view, args];
						
					} else if(isArray(view)) {
						
						url= url.replace(match[0], '');
						return broke.urlResolvers.resolve(url, args, view);
						
					}
				}
			}
			
			throw broke.core.exceptions.NotFound(gettext('Matching url not found.'));
		},
		reverse: function(namedUrl, args, urlPatterns, result) {
			var match= null,
				i,
				isInclude,
				_this;
			
			urlPatterns= urlPatterns || broke.urlPatterns;
			result= result || '';
			args= args || [];
			
			for(i= 0; i< urlPatterns.length; i++) {
				_this= urlPatterns[i];
				
				if(typeOf(_this[1]) === "string") {
					_this[1]= utils.getattr(_this[1]);
				}
				
				isInclude= isArray(_this[1]);
				
				if(isInclude) {
					match= namedUrl.startsWith(_this[2]);
				} else {
					match= (namedUrl === _this[2]);
				}
				
				if(match) {
					if(isInclude) {
						namedUrl= namedUrl.replace(_this[2] + '-', '');
						return broke.urlResolvers.reverse(namedUrl, args, _this[1], _this[0]);
					} else {
						result+= _this[0];
						result= args.echo(result.replace('^', '').replace('$', '').replace(/\(.*?\)/g, '%s'));
						
						if(result.match(_this[0])) {
							return result;
						} else {
							return '';
						}
					}
				}
			}
			
			// no matching url found
			throw NoReverseMatch(gettext('Matching url not found.'));
			
			return null;
		}
	};
	
	extend(_, __module__);
})(exports);
