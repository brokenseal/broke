/****************************************************************************/
/****************************** EVENT SYSTEM ********************************/
/****************************************************************************/

/*
 * events:
 * - broke.request
 * - broke.response
 *
 * request attributes:
 * - completeUrl
 * - event
 * - type: get|post
 * - url
 * - fromReload
 * - queryData
 *
 * response attributes:
 * - operation: create|replace|update
 * - template
 * - context
 * - method
 * - htmlNode
 * - additionalProperties
 * 
 * - event
 * - type: get|post
 * - url
 * - fromReload
 *
 */
(function(){
	var bindEventsOnElements= function(){
		var key;
		
		/******************************** EVENTS BINDING ********************************/
		// elements binding
		if(broke.settings.eventTriggeringMethod === 'elements'){
			
			// --------- event triggering on load ---------
			$(window).load(function(){
				if(window.location.hash !== '') {
					$(window).trigger('broke.request', [{
						url: window.location.hash.split('#')[1],
						completeUrl: window.location.href,
						fromReload: true
					}]);
				}
			});
			
			// --------- on elements ---------
			
			// collect all the url changing elements
			for(key in broke.settings.urlChangingElements) {
				if(broke.settings.urlChangingElements.hasOwnProperty(key)) {
					// bind or live bind
					$(key)[broke.settings.eventBinding](broke.settings.urlChangingElements[key].events.join(','), function(e){
						
						var _this= $(this),
							tag= this.tagName.lower(),
							urlChangingElement= broke.settings.urlChangingElements[tag],
							urlAttribute= urlChangingElement.urlAttribute,
							url= _this.attr(urlAttribute);
						
						if(urlChangingElement.preventDefault) {
							e.preventDefault();
						}
						
						if(url !== undefined && url.contains('#')) {
							$(window).trigger('broke.request', [{
								event: e,
								url: url.split('#')[1],
								completeUrl: url
							}]);
						}
					});
				}
			}
		
		// hash change binding
		} else if(broke.settings.eventTriggeringMethod === 'hashchange'){
			
			// if it does not exist, let's create it
			if(!('onhashchange' in window)){
				// closure to store hide local variable oldHash
				(function(){
					var oldHash= location.hash;
					
					setInterval(function(){
						if(location.hash !== oldHash) {
							oldHash= location.hash;
							
							$(window).trigger('hashchange');
						}
					}, 150);
				})();
				
			}
			
			// bind on hash change
			window.onhashchange= function(e){
				var completeUrl= location.href;
					url= location.href.split('#')[1];
				
				$(window).trigger('broke.request', [{
					completeUrl: url,
					event: e,
					url: url
				}]);
			};
		}
	},
	searchNamedUrls= function(){
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
		
		var key;
		
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
						args= urlToRender[1];
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
	},
	getLanguageFiles= function(){
		var languageCode= broke.settings.languageCode,
			localePath= '/locale/' + languageCode + '/LC_MESSAGES/broke.po',
			localePaths= [
				broke.settings.baseUrl + '/conf'
			];
		
		// init projects
		broke.projects.each(function(){
			localePaths.populate(this.settings.localePaths);
		});
		
		localePaths.each(function(){
			broke.i18n.init({
				url: this + localePath
			});
		});
		
		return;
	};
	
	/*
	 * Request event handling
	 * broke.request
	 * 
	 */
	$(window).bind('broke.request', function(e, request){
		var response= {},
			view= null,
			args= null,
			urlMatchResult= [],
			key,
			partialUrl,
			app,
			parseQueryString= broke.urlResolvers.parseQueryString,
			resolve= broke.urlResolvers.resolve;
		
		request= broke.extend({
			completeUrl: window.location.href,
			event: null,
			type: 'get',
			fromReload: false
		}, request);
		
		// --------- query data split ---------
		partialUrl= request.url.split('?');
		if(partialUrl.length > 1) {
			request.url= partialUrl[0];
			request.queryData= parseQueryString(partialUrl[1]);
		}
		
		// --------- middleware fetching ---------
		broke.settings.middleware.each(function(){
			var middleware= getattr(this.concat());
			
			if(middleware.processRequest !== undefined) {
				middleware.processRequest(request);
			}
		});
		
		// --------- url dispatcher ---------
		try {
			urlMatchResult= resolve(request.url);
		} catch(error) {
			if(error.name === "NotFound") {
				getattr(broke.settings.handler404)(request);
				$(window).trigger('broke.response', [response]);
				return;
				
			} else {
				throw error;
			}
		}
		
		if(urlMatchResult) {
			view= urlMatchResult[0];
			args= urlMatchResult[1];
			
			// response
			response= view(request, args);
			response= broke.extend(request, response);
			
			$(window).trigger('broke.response', [response]);
		}
	});
	
	/*
	 * Response event handling
	 * broke.response
	 * 
	 */
	$(window).bind('broke.response', function(e, response){
		var key;
		
		// --------- apply context processors ---------
		broke.settings.contextProcessors.each(function(){
			var contextProcessor= getattr(this.concat());
			
			broke.extend(response.context, contextProcessor(response));
		});
		
		// --------- middleware fetching in reverse order ---------
		broke.settings.middleware.reverse().each(function(){
			var middleware= getattr(this.concat());
			
			if(middleware.processResponse !== undefined) {
				middleware.processResponse(response);
			}
		});
		
		if(response.operation && broke.template[response.operation] !== undefined) {
			broke.template[response.operation](response);
		}
	});
	
	/*
	 * It all starts here
	 * broke.ready
	 * 
	 */
	$(window).bind('broke.ready', function(){
		// init projects
		broke.projects.each(function(){
			broke.initProject(this);
		});
		
		if(broke.settings.usei18n) {
			// get language files
			getLanguageFiles();
		}
		
		// search for named urls and swap them with fully qualified urls
		searchNamedUrls();
		
		// bind events on elements
		bindEventsOnElements();
	});
	
	$(function(){
		$(window).trigger('broke.ready');
	});
})();
