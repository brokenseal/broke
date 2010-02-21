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
			partialUrl,
			target,
			parseQueryString= broke.urlResolvers.parseQueryString,
			queryString= {},
			resolve= broke.urlResolvers.resolve;
		
		request= broke.extend({
			completeUrl: window.location.href,
			event: null,
			type: 'GET',
			fromReload: false,
			META: {},
			GET: {},
			POST: {},
			REQUEST: {}
		}, request);
		
		// set GET/POST/REQUEST
		partialUrl= request.url.split('?');
		if(partialUrl.length > 1) {
			request.url= partialUrl[0];
			queryString= parseQueryString(partialUrl[1]);
			
			request.GET= queryString;
		} else if(request.event.target.tagName.lower() === "form"){
			target= $(request.event.target);
			target.find('input,select,textarea').each(function(){
				queryString[$(this).attr('name')]= $(this).val();
			});
			
			request.POST= queryString;
		}
		request.REQUEST= queryString;
		
		// set META
		request.META= {
			HTTP_REFERER: window.location.href.split('#')[1] || ''
		};
		
		// middleware fetching
		broke.conf.settings.MIDDLEWARE_CLASSES.each(function(){
			var middleware= getattr(this.concat());
			
			if(middleware.processRequest !== undefined) {
				middleware.processRequest(request);
			}
		});
		
		// url dispatcher
		try {
			urlMatchResult= resolve(request.url);
		} catch(error) {
			if(error.name === "NotFound") {
				getattr(broke.conf.settings.HANDLER_404)(request);
				broke.response(response);
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
		
		// apply additional properties
		forEach(response.additionalProperties, function(key){
			response.element[key]= this;
		});
		
		// apply callback
		if(typeOf(response.callback) === 'function') {
			response.callback.apply(response.element);
		}
		
		// --------- middleware fetching in reverse order ---------
		broke.conf.settings.MIDDLEWARE_CLASSES.reverse().each(function(){
			var middleware= getattr(this);
			
			if(middleware.processResponse !== undefined) {
				middleware.processResponse(response);
			}
		});
	});
})();
