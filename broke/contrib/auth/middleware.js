(function(__global__){
	broke.extend(broke.contrib.auth, {
		middleware: {
			AuthenticationMiddleware: {
				processRequest: function(){},
				processResponse: function(){}
			}
		}
	});
})(this);
