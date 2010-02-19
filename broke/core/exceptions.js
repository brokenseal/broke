(function(){
	broke.extend(broke.exceptions, {
		NotFound: function(message){
			return {
				name: "NotFound",
				message: message
			};
		},
		NotImplemented: function(message){
			return {
				name: "NotImplemented",
				message: message
			};
		},
		MultipleObjectsReturned: function(message){
			return {
				name: "MultipleObjectsReturned",
				message: message
			};
		},
		DoesNotExist: function(message){
			return {
				name: "DoesNotExist",
				message: message
			};
		},
		SettingsObjectNotDefined: function(message){
			return {
				name: "SettingsObjectNotDefined",
				message: message
			};
		},
		TemplateSyntaxError: function(message){
			return {
				name: "TemplateSyntaxError",
				message: message
			};
		},
		TemplateDoesNotExist: function(message){
			return {
				name: "TemplateSyntaxError",
				message: message
			};
		},
		TemplateEncodingError: function(message){
			return {
				name: "TemplateSyntaxError",
				message: message
			};
		},
		VariableDoesNotExist: function(message){
			return {
				name: "TemplateSyntaxError",
				message: message
			};
		}
	});
})();
