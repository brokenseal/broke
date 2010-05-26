(function(_){
	_.lazy= function(fn, context){
		// a much simpler version of the lazy function loader
		// which works with strings only
		
		// a context needs to be supplied in order to execute the
		// function in the right context
		// defaults to the window object
		context= context || window;
		
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
	};
})(exports);
