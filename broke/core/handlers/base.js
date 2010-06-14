(function(_){
	var
		utils= require('broke/core/utils'),
		Class= require('dependencies/class').Class,
		settings= require('broke/conf/settings'),
		exceptions= require('broke/core/exceptions'),
		urlresolvers= require('broke/core/urlresolvers'),
		http= require('broke/http/http'),
		views= require('broke/views/views'),
		getScriptName= function(environ){
			/*
				Returns the equivalent of the HTTP request's SCRIPT_NAME environment
				variable. If Apache mod_rewrite has been used, returns what would have been
				the script name prior to any rewriting (so it's the script name as seen
				from the client's perspective), unless DJANGO_USE_POST_REWRITE is set (to
				anything).
			*/
			var scriptUrl;
			
			if(settings.FORCE_SCRIPT_NAME !== null){
				return force_unicode(settings.FORCE_SCRIPT_NAME);
			}
			
			// If Apache's mod_rewrite had a whack at the URL, Apache set either
			// SCRIPT_URL or REDIRECT_URL to the full resource URL before applying any
			// rewrites. Unfortunately not every webserver (lighttpd!) passes this
			// information through all the time, so FORCE_SCRIPT_NAME, above, is still
			// needed.
			
			scriptUrl= environ.SCRIPT_URL || '';
			
			if(!scriptUrl) {
				scriptUrl= environ.REDIRECT_URL || '';
			}
			
			if(scriptUrl) {
				// TODO
			}
			
			return environ.SCRIPT_NAME || '';
		}
	;
	
	Class.extend({
		meta: {
			className: 'BaseHandler',
			parent: _
		},
		prototype: {
			init: function(){
				this.requestMiddleware = this.viewMiddleware = this.responseMiddleware = this.exceptionMiddleware = null;
			},
			responseFixes: [
				//http.fixLocationHeader,
				//http.conditionalContentRemoval,
				//http.fixIEForAttach,
				//http.fixIEForVary
			],
			loadMiddleware: function(){
				var
					requestMiddleware= [],
					_this= this
				;
				
				this.viewMiddleware= [];
				this.responseMiddleware= [];
				this.exceptionMiddleware= [];
				
				utils.forEach(settings.MIDDLEWARE_CLASSES, function(){
					var
						middleware,
						middlewareModule
					;
					
					try {
						middleware= utils.getCallable(this);
					} catch(e) {
						throw new exceptions.ImproperlyConfigured("%s isn't a middleware module" % this);
					}
					
					if('processRequest' in middleware) {
						requestMiddleware.push(middleware.processRequest);
					} else if('processView' in middleware) {
						_this.viewMiddleware.push(middleware.processView);
					} else if('processResponse' in middleware) {
						_this.responseMiddleware.push(middleware.processResponse);
					} else if('processException' in middleware) {
						_this.exceptionMiddleware.push(middleware.processException);
					}
					
					// We only assign to this when initialization is complete as it is used
					// as a flag for initialization being complete.
					_this.requestMiddleware= requestMiddleware;
				});
			},
			getResponse: function(request){
				var 
					i,
					len,
					response,
					urlConf,
					resolver,
					callback,
					args,
					result,
					receivers
				;
				
				try {
					try {
						// setup default url resolver for this thread
						urlConf= request.urlconf || settings.ROOT_URLCONF;
						urlresolvers.setUrlConf(null);
						
						resolver = new urlresolvers.RegexURLResolver('^/', urlConf);
						
						// apply request middleware
						for(i= 0, len= this.requestMiddleware.length; i< len; i++) {
							response= this.requestMiddleware[i](request);
							
							if(response) {
								return response;
							}
						}
						
						if('urlConf' in request) {
							// reset url resolver with a custom urlConf
							urlConf= request.urlConf;
							urlresolvers.setUrlConf(null);
							
							resolver= new urlresolvers.RegexURLResolver('^/', urlConf);
						}
						
						result= resolver.resolve(request.pathInfo);
						
						callback= result[0];
						args= result[1];
						
						// Apply view middleware
						for(i= 0, len= this.viewMiddleware; i< len; i++) {
							response= this.viewMiddleware[i](request);
							
							if(response) {
								return response;
							}
						}
						
						try {
							response= callback(request, args);
						} catch(e) {
							// If the view raised an exception, run it through exception
							// middleware, and if the exception middleware returns a
							// response, use that. Otherwise, reraise the exception.
							for(i= 0, len= this.exceptionMiddleware; i< len; i++) {
								response= this.exceptionMiddleware[i](request);
								
								if(response) {
									return response;
								}
							}
							
							throw e;
						}
						
						// Complain if the view returned null (a common error).
						if(response === null) {
							// TODO
						}
						
						return response;
					} catch(e) {
						if(e.name == http.Http404.name) {
							if(settings.DEBUG) {
								views.technical404Response(request, e);
							} else {
								try {
									result= resolver.resolve404();
									callback= result[0];
									args= result[1];
									
									return callback(args);
								} catch(e) {
									try {
										// TODO
										return this.handleUncaughtException(request, resolver, e);
									} finally {
										// TODO
									}
								}
							}
						} else if(e.name == exceptions.PermissionDenied.name) {
							return http.HttpResponseForbidden('<h1>Permission denied</h1>');
						} else if(e.name == "SystemExit") {
							// TODO
							throw e;
						} else {
							// TODO
							return this.handleUncaughtException(request, resolver, e);
						}
					}
				} finally {
					// Reset URLconf for this thread on the way out for complete
					// isolation of request.urlconf
					urlresolvers.setUrlConf(null);
				}
			},
			handleUncaughtException: function(request, resolver, e){
				if(settings.DEBUG_PROPAGATE_EXCEPTIONS) {
					throw e;
				}
				
				if(settings.DEBUG) {
					// TODO
					//broke.view.debug.technicalResponse(request, e);
				}
				
				// When DEBUG is False, send an error message to the admins.
				// TODO
			},
			getTraceback: function(){
				// helper function to return the traceback as a string
				// TODO
			},
			applyResponseFixes: function(request, response){
				/*
					Applies each of the functions in self.response_fixes to the request and
					response, modifying the response in the process. Returns the new
					response.
				*/
				utils.forEach(this.responseFixes, function(){
					response= this(request, response);
				});
				
				return response;
			}
		}
	});
})(exports);
