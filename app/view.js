/****************************************************************************/
/****************************** VIEW SYSTEM *********************************/
/****************************************************************************/

(function(){
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
					return getattr(urlObject)
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
				
				throw broke.exceptions.NotFound('Matching url not found.');
				
				return null;
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
					isInclude= broke.isArray(_this[1]);
					
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
				broke.log("No matching named url found, fail silently...");
				
				return null;
			}
		}
	});
})();


/*
 * Search for named urls on the page and swap them with full qualified urls
 * Named urls on the page should look like this:
 * 		<# entry-commit #>		->		/blog/entry/commit/
 * 		<# entry-view 2 #>		->		/blog/entry/view/2/
 * 		<# entry-edit 21,2 #>	->		/blog/21/entry/edit/2/
 * 
 * If any arguments are needed, they will have to be a comma separated 
 * series of values after the named url
 * 
 */

$(function(){
	for(key in broke.settings.urlChangingElements) {
		if(broke.settings.urlChangingElements.hasOwnProperty(key)) {
			
			$(key).each(function(){
				var _this= $(this),
					urlAttribute= broke.settings.urlChangingElements[key].urlAttribute,
					urlToRender= _this.attr(urlAttribute),
					namedUrl,
					args,
					result;
				
				// it should match /<#(.*)#>/
				if(urlToRender.contains('<#')) {
					urlToRender= urlToRender
						.replace('<#', '')
						.replace('#>', '')
						.trim()
						.split(' ');
					
					namedUrl= urlToRender[0];
					args= urlToRender[1]
					if(args) {
						args= args.split(',');
					} else {
						args= [];
					}
					result= broke.urlResolvers.reverse(namedUrl, args);
					
					_this.attr(urlAttribute, '#' + result);
				}
			});
		}
	}
});
