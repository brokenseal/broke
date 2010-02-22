(function(){
	broke.extend({
		exceptions: {
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
			NoReverseMatch: function(message){
				return {
					name: "NoReverseMatch",
					message: message
				};
			},
			GenericError: function(message){
				return {
					name: "GenericError",
					message: message
				};
			},
			MultipleObjectsReturned: function(message){
				return {
					name: "MultipleObjectsReturned",
					message: message
				};
			},
			FieldDoesNotExist: function(message){
				return {
					name: "FieldDoesNotExist",
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
		}
	});
})();
