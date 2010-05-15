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
	
	$(window).bind('broke.request', function(e, requestData){
		var 
			response= {},
			view= null,
			args= null,
			urlMatchResult= [],
			partialUrl,
			target,
			
			parseQueryString= broke.urlResolvers.parseQueryString,
			queryString= {},
			resolve= broke.urlResolvers.resolve,
			BrowserHandler= broke.core.handlers.browser.BrowserHandler,
			requestHandler= new BrowserHandler()
		;
		
		// load middleware
		requestHandler.loadMiddleware();
		try {
			response= requestHandler.getResponse(requestData);
		} catch(e) {
			requestHandler.handleUncaughtException(e);
		}
		
		$(window).trigger('broke.response', [response]);
		
		// middleware fetching
		/*forEach(broke.conf.settings.MIDDLEWARE_CLASSES, function(){
			var middleware= getattr(this.concat());
			
			if(middleware.processRequest !== undefined) {
				middleware.processRequest(requestData);
			}
		});
		
		// url dispatcher
		try {
			urlMatchResult= resolve(requestData.url);
		} catch(error) {
			if(error.name === "NotFound") {
				getattr(broke.conf.settings.HANDLER_404)(requestData);
				broke.response(response);
				return;
				
			} else {
				throw error;
			}
		}
		
		view= urlMatchResult[0];
		args= urlMatchResult[1];
		
		// response
		response= view(requestData, args);
		response= broke.extend(requestData, response);
		
		$(window).trigger('broke.response', [response]);
		*/
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
		forEach(broke.conf.settings.MIDDLEWARE_CLASSES.reverse(), function(){
			var middleware= getattr(this);
			
			if(middleware.processResponse !== undefined) {
				middleware.processResponse(response);
			}
		});
	});
})();
