(function(){
	broke.extend(broke.contrib.auth, {
		middleware: {
			AuthenticationMiddleware: {
				processRequest: function(){},
				processResponse: function(){}
			}
		}
	});
})();
