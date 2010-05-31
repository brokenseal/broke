(function(_){
	var
		wraps= function(){
			// TODO
		},
		makeMiddlewareDecorator= function(middlewareClass){
		
		// make decorator private function
		var
			_makeDecorator= function(kwargs){
				var
					middleware= new middlewareClass(kwargs),
						// decorator private function
						_decorator= function(viewFunc){
							
							// private wrapped view function
							var
								_wrappedView= function(request, args){
									
									var
										result,
										response
									;
									
									if('processRequest' in middleware) {
										result= middleware.processRequest(request);
										
										if(result !== null) {
											return result;
										}
									}
									
									if('processView' in middleware) {
										result= middleware.processView(viewFunc);
										
										if(result !== null) {
											return result;
										}
									}
									
									try {
										response= viewFunc(request, args);
									} catch(e) {
										if('processException' in middleware) {
											result= middleware.processException(request, e);
											
											if(result !== null) {
												return result;
											}
										}
									}
									
									if('processResponse' in middleware) {
										result= middleware.processResponse(request, response);
										
										if(result !== null) {
											return result;
										}
									}
									
									return response;
								}
							;
							
							return wraps(viewFunc)(_wrappedView);
						}
					;
				
				return _decorator;
			}
		;
		
		return _makeDecorator;
	};
	
	_.decoratorFromMiddlewareWithArgs= function(middlewareClass){
		
		return makeMiddlewareDecorator(middlewareClass);
	};
	
	_.decoratorFromMiddleware= function(middlewareClass){
		
		return makeMiddlewareDecorator(middlewareClass);
	};
})(exports);
