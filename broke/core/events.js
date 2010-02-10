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

/*************************** REQUEST EVENT HANDLING *****************************/
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
	} catch(e) {
		if(e.name === "NotFound") {
			getattr(broke.settings.handler404)(request);
			$(window).trigger('broke.response', [response]);
			return;
			
		} else {
			throw e;
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

/*************************** RESPONSE EVENT HANDLING ****************************/
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

// on DOM ready
$(function(){
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
});
