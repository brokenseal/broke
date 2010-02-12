/****************************************************************************/
/****************************** VIEW SYSTEM *********************************/
/****************************************************************************/

(function(){
	var gettext= broke.i18n.gettext;
	
	broke.extend({
		urlResolvers: {
			patterns: function(prefix, urlPatterns) {
				urlPatterns.map(function(){
					if(typeof this[1] === "string") {
						this[1]= getattr(prefix + "." + this[1]);
					}
					return this;
				});
				
				return urlPatterns;
			},
			include: function(urlObject){
				if(typeof urlObject === "string") {
					return getattr(urlObject);
				}
				return urlObject;
			},
			parseQueryString: function(queryString){
				var result= {};
				if(!queryString) {
					return {};
				}
				
				queryString= queryString.split('&');
				
				queryString.each(function(){
					var tmp= this.split('=');
					result[tmp[0]]= tmp[1];
				});
				
				return result;
			},
			resolve: function(url, args, urlPatterns) {
				var view= null,
					match= null,
					key,
					result,
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
						
						if(typeof view === "string") {
							view= getattr(view);
						}
						
						if(typeof view === 'function') {
							
							return [view, args];
							
						} else if(typeof view === 'object') {
							
							url= url.replace(match[0], '');
							return broke.urlResolvers.resolve(url, args, view);
							
						}
					}
				}
				
				throw broke.exceptions.NotFound(gettext('Matching url not found.'));
			},
			reverse: function(namedUrl, args, urlPatterns, result) {
				var view= null,
					match= null,
					key,
					i,
					isInclude,
					_this;
				
				urlPatterns= urlPatterns || broke.urlPatterns;
				result= result || '';
				args= args || [];
				
				for(i= 0; i< urlPatterns.length; i++) {
					_this= urlPatterns[i];
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
				
				//throw broke.exceptions.NotFound('Matching url not found.');
				// no matching url found, fail silently...
				broke.log(gettext("No matching named url found, fail silently..."));
				
				return null;
			}
		}
	});
})();
