(function(_){
	var
		__module__,
		extend= require('broke/core/utils').extend
		Class= require('dependencies/class').Class
	;
	
	__module__= {
		memoize: function(fn) {
			// TODO : test
			var
				pad  = {},
				self = fn,
				obj  = arguments.length > 1 ? Array.prototype.slice.call(arguments).slice(1) : null,
				memoizedFn = function() {
					// Copy the arguments object into an array: allows it to be used as
					// a cache key.
					var
						args = [],
						i
					;
					
					for (i = 0; i < arguments.length; i++) {
						args[i] = arguments[i];
					}
					
					// Evaluate the memoized function if it hasn't been evaluated with
					// these arguments before.
					if (!(args in pad)) {
						pad[args] = self.apply(obj, arguments);
					}
					
					return pad[args];
				}
			;
			
			memoizedFn.unmemoize = function() {
				return self;
			}
			
			return memoizedFn;
		},
		lazy: function(fn, context){
			// a much simpler version of the lazy function loader
			// which works with strings only
			
			// a context needs to be supplied in order to execute the
			// function in the right context
			// defaults to the main context object
			context= context || this;
			
			return function(){
				var
					args= Array.prototype.slice.call(arguments)
				;
				
				// returns an object which override the toString method
				// to return whatever function has been supplied
				// within the right context, given the supplied the arguments
				return {
					toString: function(){
						return fn.apply(context, args);
					}
				};
			};
		}
	};
	
	extend(_, __module__);
})(exports);
